package main

import (
	"context"
	"net/http"
	"testing"

	"github.com/aws/aws-lambda-go/events"
)

// TestAdminOnlyRejectsNonAdmin verifies adminOnly blocks requests without Admin claims.
func TestAdminOnlyRejectsNonAdmin(t *testing.T) {
	handler := adminOnly(func(context.Context, events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
		t.Fatal("wrapped handler should not run")
		return events.APIGatewayProxyResponse{}, nil
	})
	resp, err := handler(context.Background(), events.APIGatewayProxyRequest{})
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != http.StatusForbidden || resp.Body != `"Not an Admin"` {
		t.Fatalf("response = %#v", resp)
	}
}
