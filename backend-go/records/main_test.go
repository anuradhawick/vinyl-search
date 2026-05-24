package main

import (
	"context"
	"net/http"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"vinyl-search/backend-go/common/testutil"
)

func TestRecordsBaseRouteMatchesBeforeDB(t *testing.T) {
	resp, err := handler(context.Background(), testutil.Request(http.MethodGet, "/public/records", nil, nil, "", false))
	if err != nil {
		t.Fatalf("handler error = %v", err)
	}
	if resp.StatusCode == http.StatusNotFound {
		t.Fatalf("expected /public/records to reach fetchRecords, got %d body=%s", resp.StatusCode, resp.Body)
	}
}

func TestRecordsEndpoints(t *testing.T) {
	db := testutil.Mongo(t, "vinyl_test_records")
	s3Mock, _ := testutil.InstallAWSMocks(t)

	ownerID := bson.NewObjectID()
	reviserID := bson.NewObjectID()
	recordID := bson.NewObjectID()
	oldRevisionID := bson.NewObjectID()
	latestRevisionID := bson.NewObjectID()
	now := time.Now().UTC()

	testutil.TextIndex(t, db, "records", "name", "label", "catalogNo")
	testutil.Insert(t, db, "users", bson.M{
		"_id":           reviserID,
		"uid":           reviserID,
		"name":          "Revision Owner",
		"picture":       "avatar.png",
		"email":         "private@example.test",
		"authProviders": bson.A{"Google"},
	})
	testutil.Insert(t, db, "records",
		bson.M{
			"_id":        oldRevisionID,
			"id":         recordID,
			"ownerUid":   ownerID,
			"reviserUid": reviserID,
			"name":       "Baila Gold",
			"label":      "Lotus",
			"catalogNo":  "CAT-1",
			"genres":     bson.A{"Baila"},
			"styles":     bson.A{"Sri Lankan"},
			"format":     "LP",
			"country":    "LK",
			"images":     bson.A{"records-images/old.png"},
			"latest":     false,
			"createdAt":  now.Add(-time.Hour),
		},
		bson.M{
			"_id":         latestRevisionID,
			"id":          recordID,
			"ownerUid":    ownerID,
			"reviserUid":  reviserID,
			"name":        "Baila Gold",
			"label":       "Lotus",
			"catalogNo":   "CAT-1",
			"genres":      bson.A{"Baila"},
			"styles":      bson.A{"Sri Lankan"},
			"format":      "LP",
			"country":     "LK",
			"images":      bson.A{"records-images/latest.png"},
			"chosenImage": "records-images/latest.png",
			"latest":      true,
			"createdAt":   now,
		},
	)

	t.Run("list", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/public/records", map[string]string{"limit": "5"}, nil, "", false))
		body := testutil.AssertOKSuccess(t, resp)
		if len(body["records"].([]any)) != 1 {
			t.Fatalf("records = %#v", body["records"])
		}
	})

	t.Run("search", func(t *testing.T) {
		query := map[string]string{"query": "Baila", "genres": `["Baila"]`, "limit": "5"}
		resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/public/records/search", query, nil, "", false))
		body := testutil.AssertOKSuccess(t, resp)
		if len(body["records"].([]any)) != 1 {
			t.Fatalf("records = %#v", body["records"])
		}
	})

	t.Run("get", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/public/records/"+recordID.Hex(), nil, nil, "", false))
		body := testutil.AssertOKSuccess(t, resp)
		record := body["record"].(map[string]any)
		images := record["images"].([]any)
		if images[0] != "https://cdn.example.test/records-images/watermarked/latest.jpeg" {
			t.Fatalf("images = %#v", images)
		}
	})

	t.Run("history", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/public/records/"+recordID.Hex()+"/revisions", nil, nil, "", false))
		body := testutil.AssertOKSuccess(t, resp)
		if len(body["history"].([]any)) != 2 {
			t.Fatalf("history = %#v", body["history"])
		}
	})

	t.Run("revision", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/public/records/"+recordID.Hex()+"/revisions/"+latestRevisionID.Hex(), nil, nil, "", false))
		body := testutil.AssertOKSuccess(t, resp)
		record := body["record"].(map[string]any)
		if record["id"] != recordID.Hex() {
			t.Fatalf("record id = %#v", record["id"])
		}
	})

	t.Run("protected list requires auth", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/records", map[string]string{"limit": "5"}, nil, "", false))
		if resp.StatusCode != http.StatusUnauthorized {
			t.Fatalf("status = %d body = %s", resp.StatusCode, resp.Body)
		}
	})

	t.Run("create", func(t *testing.T) {
		body := map[string]any{
			"name":        "Fresh Record",
			"label":       "New Label",
			"catalogNo":   "CAT-2",
			"images":      []string{"https://cdn.example.test/temp/fresh.png"},
			"chosenImage": "fresh.png",
		}
		resp := testutil.Call(t, handler, testutil.Request(http.MethodPost, "/records", nil, body, ownerID.Hex(), false))
		testutil.AssertOKSuccess(t, resp)
		if len(s3Mock.Copies) == 0 || len(s3Mock.Puts) < 2 {
			t.Fatalf("expected image promotion, copies=%#v puts=%#v", s3Mock.Copies, s3Mock.Puts)
		}
	})

	t.Run("update", func(t *testing.T) {
		body := map[string]any{
			"id":          recordID.Hex(),
			"name":        "Baila Gold Updated",
			"label":       "Lotus",
			"catalogNo":   "CAT-1",
			"images":      []string{"records-images/latest.png", "https://cdn.example.test/temp/revision.png"},
			"chosenImage": "revision.png",
		}
		resp := testutil.Call(t, handler, testutil.Request(http.MethodPost, "/records/"+recordID.Hex(), nil, body, reviserID.Hex(), false))
		testutil.AssertOKSuccess(t, resp)
		if len(s3Mock.Copies) < 2 {
			t.Fatalf("copies = %#v", s3Mock.Copies)
		}
	})
}
