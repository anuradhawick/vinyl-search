package main

import (
	"context"
	"net/http"
	"testing"

	"github.com/aws/aws-lambda-go/events"
)

// TestUnsupportedTerraformRoutes verifies unsupported marketplace routes return 404.
func TestUnsupportedTerraformRoutes(t *testing.T) {
	resp, err := unsupported(context.Background(), events.APIGatewayProxyRequest{})
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != http.StatusNotFound {
		t.Fatalf("status = %d", resp.StatusCode)
	}
}
