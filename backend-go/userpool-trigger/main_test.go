package main

import (
	"context"
	"testing"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
	"go.mongodb.org/mongo-driver/v2/bson"

	"vinyl-search/backend-go/common/testutil"
)

func TestHandlerPassthrough(t *testing.T) {
	event := map[string]any{"triggerSource": "CustomMessage_ForgotPassword"}
	got, err := handler(context.Background(), event)
	if err != nil {
		t.Fatal(err)
	}
	if got["triggerSource"] != event["triggerSource"] {
		t.Fatalf("event = %#v", got)
	}
}

func TestPostConfirmation(t *testing.T) {
	db := testutil.Mongo(t, "vinyl_test_userpool_post")
	_, cognitoMock := testutil.InstallAWSMocks(t)

	event := map[string]any{
		"triggerSource": "PostConfirmation_ConfirmSignUp",
		"userPoolId":    "pool-test",
		"userName":      "Google_google-sub",
		"request": map[string]any{
			"userAttributes": map[string]any{
				"email":       "signup@example.test",
				"given_name":  "Sign",
				"family_name": "Up",
				"name":        "Sign Up",
			},
		},
	}
	if _, err := handler(context.Background(), event); err != nil {
		t.Fatal(err)
	}
	if len(cognitoMock.UpdateUserAttributesCalls) != 1 {
		t.Fatalf("update calls = %#v", cognitoMock.UpdateUserAttributesCalls)
	}
	call := cognitoMock.UpdateUserAttributesCalls[0]
	if aws.ToString(call.UserPoolId) != "pool-test" || aws.ToString(call.Username) != "Google_google-sub" {
		t.Fatalf("call = %#v", call)
	}
	if len(call.UserAttributes) != 1 || aws.ToString(call.UserAttributes[0].Name) != "custom:uid" || aws.ToString(call.UserAttributes[0].Value) == "" {
		t.Fatalf("attributes = %#v", call.UserAttributes)
	}
	if count := testutil.Count(t, db, "users", bson.M{"email": "signup@example.test", "authProviders": "Google"}); count != 1 {
		t.Fatalf("user count = %d", count)
	}
}

func TestPreSignUpExternalProvider(t *testing.T) {
	db := testutil.Mongo(t, "vinyl_test_userpool_pre")
	_, cognitoMock := testutil.InstallAWSMocks(t)

	older := time.Now().Add(-time.Hour)
	newer := time.Now()
	cognitoMock.ListUsersFunc = func(context.Context, *cognitoidentityprovider.ListUsersInput) (*cognitoidentityprovider.ListUsersOutput, error) {
		return &cognitoidentityprovider.ListUsersOutput{
			Users: []types.UserType{
				{
					Username:             aws.String("Google_existing-sub"),
					UserCreateDate:       &older,
					Attributes:           []types.AttributeType{{Name: aws.String("email"), Value: aws.String("merge@example.test")}},
					Enabled:              true,
					UserStatus:           types.UserStatusTypeConfirmed,
					UserLastModifiedDate: &older,
				},
				{
					Username:       aws.String("Facebook_newer-sub"),
					UserCreateDate: &newer,
					Attributes:     []types.AttributeType{{Name: aws.String("email"), Value: aws.String("merge@example.test")}},
					Enabled:        true,
					UserStatus:     types.UserStatusTypeConfirmed,
				},
			},
		}, nil
	}

	event := map[string]any{
		"triggerSource": "PreSignUp_ExternalProvider",
		"userPoolId":    "pool-test",
		"userName":      "Facebook_source-sub",
		"request": map[string]any{
			"userAttributes": map[string]any{"email": "merge@example.test"},
		},
	}
	got, err := handler(context.Background(), event)
	if err != nil {
		t.Fatal(err)
	}
	response := got["response"].(map[string]any)
	if response["autoConfirmUser"] != true || response["autoVerifyEmail"] != true || response["autoVerifyPhone"] != true {
		t.Fatalf("response = %#v", response)
	}
	if len(cognitoMock.LinkProviderForUserCalls) != 1 {
		t.Fatalf("link calls = %#v", cognitoMock.LinkProviderForUserCalls)
	}
	if count := testutil.Count(t, db, "users", bson.M{"email": "merge@example.test", "authProviders": "Facebook"}); count != 1 {
		t.Fatalf("user count = %d", count)
	}
}
