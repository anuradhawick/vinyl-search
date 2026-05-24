package common

import (
	"bytes"
	"context"
	"log"
	"net/http"
	"strings"
	"testing"

	"github.com/aws/aws-lambda-go/events"
)

func TestLogEndpointIncludesQueryParams(t *testing.T) {
	var buf bytes.Buffer
	originalWriter := log.Writer()
	originalFlags := log.Flags()
	originalPrefix := log.Prefix()

	log.SetOutput(&buf)
	log.SetFlags(0)
	log.SetPrefix("")
	defer func() {
		log.SetOutput(originalWriter)
		log.SetFlags(originalFlags)
		log.SetPrefix(originalPrefix)
	}()

	handler := LogEndpoint(http.MethodGet, "/records/search", func(context.Context, events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
		return events.APIGatewayProxyResponse{StatusCode: http.StatusOK, Body: `{"success":true}`}, nil
	})

	_, err := handler(context.Background(), events.APIGatewayProxyRequest{
		QueryStringParameters: map[string]string{"query": "Needle", "limit": "5"},
	})
	if err != nil {
		t.Fatal(err)
	}

	if !strings.Contains(buf.String(), `endpoint called: method=GET route=/records/search query={"limit":"5","query":"Needle"}`) {
		t.Fatalf("log output = %q", buf.String())
	}
}
