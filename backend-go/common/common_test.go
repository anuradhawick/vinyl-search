package common

import (
	"encoding/json"
	"os"
	"testing"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// TestQueryHelpers verifies query parsing helpers and their fallback behavior.
func TestQueryHelpers(t *testing.T) {
	params := map[string]string{"limit": "12", "bad": "nope", "genres": `["baila","pop"]`}
	if got := IntQuery(params, "limit", 30); got != 12 {
		t.Fatalf("limit = %d", got)
	}
	if got := IntQuery(params, "bad", 30); got != 30 {
		t.Fatalf("bad fallback = %d", got)
	}
	if got := StringArrayQuery(params, "genres"); len(got) != 2 || got[1] != "pop" {
		t.Fatalf("genres = %#v", got)
	}
}

// TestNormalizeMongoJSON verifies BSON values are serialized into JSON-friendly values.
func TestNormalizeMongoJSON(t *testing.T) {
	oid := bson.NewObjectID()
	input := bson.M{
		"_id":       oid,
		"createdAt": bson.NewDateTimeFromTime(time.Date(2024, 1, 2, 3, 4, 5, 6_000_000, time.UTC)),
	}
	data, err := json.Marshal(NormalizeMongoJSON(input))
	if err != nil {
		t.Fatal(err)
	}
	var out map[string]string
	if err := json.Unmarshal(data, &out); err != nil {
		t.Fatal(err)
	}
	if out["_id"] != oid.Hex() {
		t.Fatalf("_id = %q", out["_id"])
	}
	if out["createdAt"] != "2024-01-02T03:04:05.006Z" {
		t.Fatalf("createdAt = %q", out["createdAt"])
	}
}

// TestCDNURL verifies CDN image variant URL generation.
func TestCDNURL(t *testing.T) {
	t.Setenv("CDN_DOMAIN", "cdn.example.test")
	got := CDNURL("records-images", "thumbnails", "https://bucket/records-images/original.png")
	want := "https://cdn.example.test/records-images/thumbnails/original.jpeg"
	if got != want {
		t.Fatalf("got %q want %q", got, want)
	}
}

// TestRewriteForumHTML verifies temp images are rewritten and forum text is extracted.
func TestRewriteForumHTML(t *testing.T) {
	t.Setenv("CDN_DOMAIN", "cdn.example.test")
	result, err := RewriteForumHTML(`<html><body><p>Hello <b>world</b></p><img src="https://cdn.example.test/temp/a.png"></body></html>`)
	if err != nil {
		t.Fatal(err)
	}
	if len(result.NewImages) != 1 || Filename(result.NewImages[0]) != "a.png" {
		t.Fatalf("new images = %#v", result.NewImages)
	}
	if result.AllImages[0] != "https://cdn.example.test/forum-images/a.png" {
		t.Fatalf("all images = %#v", result.AllImages)
	}
	if result.Text != "Hello\nworld" {
		t.Fatalf("text = %q", result.Text)
	}
}

// TestAuthHelpers verifies UID and admin claims are read from API Gateway authorizer data.
func TestAuthHelpers(t *testing.T) {
	req := events.APIGatewayProxyRequest{
		RequestContext: events.APIGatewayProxyRequestContext{
			Authorizer: map[string]any{"claims": map[string]any{
				"custom:uid":      "abc",
				"cognito:groups":  "User,Admin",
				"unused-provider": os.Getenv("HOME"),
			}},
		},
	}
	if UID(req) != "abc" {
		t.Fatalf("uid = %q", UID(req))
	}
	if !IsAdmin(req) {
		t.Fatal("expected admin")
	}
}
