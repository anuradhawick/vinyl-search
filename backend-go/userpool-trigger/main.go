package main

import (
	"context"
	"sort"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	cognito "github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"vinyl-search/backend-go/common"
)

// main starts the Cognito user-pool trigger Lambda.
func main() {
	lambda.Start(handler)
}

// handler dispatches Cognito trigger events to the matching workflow.
func handler(ctx context.Context, event map[string]any) (map[string]any, error) {
	switch stringValue(event["triggerSource"]) {
	case "PostConfirmation_ConfirmSignUp":
		return postConfirmation(ctx, event)
	case "PreSignUp_ExternalProvider":
		return preSignUp(ctx, event)
	default:
		return event, nil
	}
}

// postConfirmation upserts the Mongo user and writes its uid back to Cognito.
func postConfirmation(ctx context.Context, event map[string]any) (map[string]any, error) {
	userPoolID := stringValue(event["userPoolId"])
	username := stringValue(event["userName"])
	attrs := userAttributes(event)
	email := attrs["email"]
	provider := strings.Split(username, "_")[0]

	update := bson.M{
		"$set": bson.M{
			"email":       attrs["email"],
			"given_name":  attrs["given_name"],
			"family_name": attrs["family_name"],
			"name":        attrs["name"],
			"updatedAt":   time.Now(),
			"roles":       bson.A{},
		},
		"$addToSet": bson.M{
			"authProviders": provider,
		},
	}

	// The Mongo document is the source for the custom uid claim used by API handlers.
	user, err := updateUser(ctx, email, update)
	if err != nil {
		return nil, err
	}
	uid, err := common.OIDFromAny(user["_id"])
	if err != nil {
		return nil, err
	}

	client, err := common.Cognito(ctx)
	if err != nil {
		return nil, err
	}
	_, err = client.AdminUpdateUserAttributes(ctx, &cognito.AdminUpdateUserAttributesInput{
		UserPoolId: aws.String(userPoolID),
		Username:   aws.String(username),
		UserAttributes: []types.AttributeType{
			{Name: aws.String("custom:uid"), Value: aws.String(uid.Hex())},
		},
	})
	if err != nil {
		return nil, err
	}
	return event, nil
}

// preSignUp links external identities and auto-confirms trusted provider signups.
func preSignUp(ctx context.Context, event map[string]any) (map[string]any, error) {
	if err := mergeUsers(ctx, stringValue(event["userPoolId"]), userAttributes(event), stringValue(event["userName"])); err != nil {
		return nil, err
	}
	response := childMap(event, "response")
	response["autoConfirmUser"] = true
	response["autoVerifyEmail"] = true
	response["autoVerifyPhone"] = true
	return event, nil
}

// mergeUsers links a new external provider identity to the oldest Cognito user with the same email.
func mergeUsers(ctx context.Context, userPoolID string, attrs map[string]string, username string) error {
	provider, providerID := splitProvider(username)
	if provider != "Google" && provider != "Facebook" {
		return nil
	}
	client, err := common.Cognito(ctx)
	if err != nil {
		return err
	}
	out, err := client.ListUsers(ctx, &cognito.ListUsersInput{
		UserPoolId: aws.String(userPoolID),
		Filter:     aws.String(`email = "` + attrs["email"] + `"`),
	})
	if err != nil || len(out.Users) == 0 {
		return err
	}
	// Link into the oldest matching Cognito user so repeat signups converge on one account.
	sort.Slice(out.Users, func(i, j int) bool {
		if out.Users[i].UserCreateDate == nil {
			return false
		}
		if out.Users[j].UserCreateDate == nil {
			return true
		}
		return out.Users[i].UserCreateDate.Before(*out.Users[j].UserCreateDate)
	})
	destProvider, destID := splitProvider(aws.ToString(out.Users[0].Username))
	_, err = client.AdminLinkProviderForUser(ctx, &cognito.AdminLinkProviderForUserInput{
		DestinationUser: &types.ProviderUserIdentifierType{
			ProviderAttributeValue: aws.String(destID),
			ProviderName:           aws.String(destProvider),
		},
		SourceUser: &types.ProviderUserIdentifierType{
			ProviderAttributeName:  aws.String("Cognito_Subject"),
			ProviderAttributeValue: aws.String(providerID),
			ProviderName:           aws.String(provider),
		},
		UserPoolId: aws.String(userPoolID),
	})
	if err != nil {
		return err
	}
	return addAuthProvider(ctx, attrValue(out.Users[0].Attributes, "email"), provider)
}

// updateUser upserts a Mongo user document by email and returns the updated document.
func updateUser(ctx context.Context, email string, update bson.M) (bson.M, error) {
	db, err := common.DB(ctx)
	if err != nil {
		return nil, err
	}
	var user bson.M
	err = db.Collection("users").FindOneAndUpdate(
		ctx,
		bson.M{"email": email},
		update,
		options.FindOneAndUpdate().SetReturnDocument(options.After).SetUpsert(true),
	).Decode(&user)
	return user, err
}

// addAuthProvider records an auth provider on a Mongo user document.
func addAuthProvider(ctx context.Context, email, provider string) error {
	_, err := updateUser(ctx, email, bson.M{"$addToSet": bson.M{"authProviders": provider}})
	return err
}

// userAttributes extracts Cognito user attributes from a trigger event.
func userAttributes(event map[string]any) map[string]string {
	request := childMap(event, "request")
	raw := childMap(request, "userAttributes")
	out := map[string]string{}
	for key, value := range raw {
		out[key] = stringValue(value)
	}
	return out
}

// childMap returns a nested event map, creating it when missing.
func childMap(parent map[string]any, key string) map[string]any {
	child, ok := parent[key].(map[string]any)
	if !ok {
		child = map[string]any{}
		parent[key] = child
	}
	return child
}

// splitProvider splits a Cognito provider username into provider and provider id.
func splitProvider(username string) (string, string) {
	parts := strings.SplitN(username, "_", 2)
	if len(parts) == 1 {
		return parts[0], ""
	}
	return parts[0], parts[1]
}

// attrValue returns the value of a named Cognito attribute.
func attrValue(attrs []types.AttributeType, name string) string {
	for _, attr := range attrs {
		if aws.ToString(attr.Name) == name {
			return aws.ToString(attr.Value)
		}
	}
	return ""
}

// stringValue safely converts event values into strings.
func stringValue(value any) string {
	if s, ok := value.(string); ok {
		return s
	}
	return ""
}
