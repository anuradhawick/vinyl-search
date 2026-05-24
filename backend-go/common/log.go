package common

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/aws/aws-lambda-go/events"
)

// LogEventPayload logs the Lambda event as a JSON string for invocation debugging.
func LogEventPayload(event any) {
	payload, err := json.Marshal(event)
	if err != nil {
		log.Printf("event payload: %+v", event)
		return
	}
	log.Printf("event payload: %s", payload)
}

// LogEndpoint wraps an API handler with route-level request and response logging.
func LogEndpoint(method, route string, next LambdaHandler) LambdaHandler {
	return func(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
		if query := queryLogPayload(req); query != "" {
			log.Printf("endpoint called: method=%s route=%s query=%s", method, route, query)
		} else {
			log.Printf("endpoint called: method=%s route=%s", method, route)
		}
		response, err := next(ctx, req)
		LogReturnPayload(response)
		if err != nil {
			log.Printf("endpoint returned error: method=%s route=%s error=%v", method, route, err)
			return response, err
		}
		return response, nil
	}
}

// LogReturnPayload logs a handler return value as a JSON string.
func LogReturnPayload(response any) {
	payload, err := json.Marshal(response)
	if err != nil {
		log.Printf("return payload: %+v", response)
		return
	}
	log.Printf("return payload: %s", payload)
}

func queryLogPayload(req events.APIGatewayProxyRequest) string {
	switch {
	case len(req.MultiValueQueryStringParameters) > 0:
		payload, err := json.Marshal(req.MultiValueQueryStringParameters)
		if err != nil {
			return fmt.Sprintf("%+v", req.MultiValueQueryStringParameters)
		}
		return string(payload)
	case len(req.QueryStringParameters) > 0:
		payload, err := json.Marshal(req.QueryStringParameters)
		if err != nil {
			return fmt.Sprintf("%+v", req.QueryStringParameters)
		}
		return string(payload)
	default:
		return ""
	}
}
