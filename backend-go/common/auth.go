package common

import (
	"strings"

	"github.com/aws/aws-lambda-go/events"
)

func Claims(req events.APIGatewayProxyRequest) map[string]any {
	if req.RequestContext.Authorizer == nil {
		return map[string]any{}
	}
	raw, ok := req.RequestContext.Authorizer["claims"].(map[string]any)
	if ok {
		return raw
	}
	return req.RequestContext.Authorizer
}

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

func UID(req events.APIGatewayProxyRequest) string {
	return ClaimString(req, "custom:uid")
}

func IsAdmin(req events.APIGatewayProxyRequest) bool {
	groups := ClaimString(req, "cognito:groups")
	for _, group := range strings.Split(groups, ",") {
		if strings.TrimSpace(group) == "Admin" {
			return true
		}
	}
	return false
}
