package common

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/aws/aws-lambda-go/events"
)

var corsHeaders = map[string]string{
	"Access-Control-Allow-Origin":      "*",
	"Access-Control-Allow-Credentials": "true",
	"Content-Type":                     "application/json",
}

func NormalizePath(req *events.APIGatewayProxyRequest) {
	if req.Path != "/" {
		req.Path = strings.TrimRight(req.Path, "/")
	}
	if req.Path == "" {
		req.Path = "/"
	}
}

func JSON(status int, body any) events.APIGatewayProxyResponse {
	data, err := json.Marshal(NormalizeMongoJSON(body))
	if err != nil {
		log.Printf("marshal response: %v", err)
		status = http.StatusInternalServerError
		data = []byte(`{"success":false}`)
	}
	return events.APIGatewayProxyResponse{
		StatusCode: status,
		Headers:    corsHeaders,
		Body:       string(data),
	}
}

func Error(status int, body any) events.APIGatewayProxyResponse {
	return JSON(status, body)
}

func NotFound() events.APIGatewayProxyResponse {
	return JSON(http.StatusNotFound, map[string]any{"success": false, "error": "Not Found"})
}

func Internal(body any, err error) events.APIGatewayProxyResponse {
	if err != nil {
		log.Printf("handler error: %v", err)
	}
	return JSON(http.StatusInternalServerError, body)
}
