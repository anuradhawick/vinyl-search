package common

import (
	"context"
	"strings"

	"github.com/aws/aws-lambda-go/events"
)

// Claims returns the authorizer claims map from an API Gateway request.
func Claims(req events.APIGatewayProxyRequest) map[string]any {
	if req.RequestContext.Authorizer == nil {
		claims, err := ClaimsFromAuthorizationHeader(context.Background(), req.Headers)
		if err != nil {
			return map[string]any{}
		}
		return claims
	}
	raw, ok := req.RequestContext.Authorizer["claims"].(map[string]any)
	if ok {
		return raw
	}
	return req.RequestContext.Authorizer
}

// ClaimString reads a claim value as a comma-separated string.
func ClaimString(req events.APIGatewayProxyRequest, key string) string {
	value := Claims(req)[key]
	switch typed := value.(type) {
	case string:
		return typed
	case []string:
		return strings.Join(typed, ",")
	case []any:
		parts := make([]string, 0, len(typed))
		for _, part := range typed {
			if s, ok := part.(string); ok {
				parts = append(parts, s)
			}
		}
		return strings.Join(parts, ",")
	default:
		return ""
	}
}

// UID returns the Cognito custom uid claim for the current request.
func UID(req events.APIGatewayProxyRequest) string {
	return ClaimString(req, "custom:uid")
}

// IsAdmin reports whether the request belongs to a Cognito Admin group member.
func IsAdmin(req events.APIGatewayProxyRequest) bool {
	groups := ClaimString(req, "cognito:groups")
	for _, group := range strings.Split(groups, ",") {
		if strings.TrimSpace(group) == "Admin" {
			return true
		}
	}
	return false
}

// LambdaHandler is the API Gateway handler shape used by this service.
type LambdaHandler = func(context.Context, events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error)

// AuthRequired rejects requests that do not carry a valid Cognito uid claim.
func AuthRequired(next LambdaHandler) LambdaHandler {
	return func(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
		if UID(req) == "" {
			return JSON(401, map[string]any{"success": false}), nil
		}
		return next(ctx, req)
	}
}
