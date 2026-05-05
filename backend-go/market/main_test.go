package main

import (
	"net/http"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"vinyl-search/backend-go/common/testutil"
)

func TestMarketEndpoints(t *testing.T) {
	db := testutil.Mongo(t, "vinyl_test_market")
	s3Mock, _ := testutil.InstallAWSMocks(t)

	ownerID := bson.NewObjectID()
	postID := bson.NewObjectID()
	updateID := bson.NewObjectID()
	now := time.Now().UTC()

	testutil.TextIndex(t, db, "selling_items", "name", "description")
	testutil.Insert(t, db, "selling_items",
		bson.M{
			"_id":         bson.NewObjectID(),
			"id":          postID,
			"ownerUid":    ownerID.Hex(),
			"name":        "Turntable Deck",
			"description": "Vintage turntable",
			"saleType":    "gear",
			"saleSubtype": "turntable",
			"images":      bson.A{"selling-images/deck.png"},
			"chosenImage": "selling-images/deck.png",
			"approved":    true,
			"sold":        false,
			"rejected":    false,
			"latest":      true,
			"updatedAt":   now,
			"createdAt":   now,
		},
		bson.M{
			"_id":         bson.NewObjectID(),
			"id":          updateID,
			"ownerUid":    ownerID.Hex(),
			"name":        "Draft Deck",
			"description": "Draft",
			"images":      bson.A{"selling-images/draft.png"},
			"chosenImage": "selling-images/draft.png",
			"approved":    false,
			"sold":        false,
			"rejected":    false,
			"latest":      true,
			"updatedAt":   now,
			"createdAt":   now,
		},
	)

	t.Run("list", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/market", map[string]string{"limit": "5"}, nil, "", false))
		body := testutil.AssertOKSuccess(t, resp)
		if len(body["posts"].([]any)) != 1 {
			t.Fatalf("posts = %#v", body["posts"])
		}
	})

	t.Run("search", func(t *testing.T) {
		query := map[string]string{"query": "Turntable", "gear": `["turntable"]`, "limit": "5"}
		resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/market/search", query, nil, "", false))
		body := testutil.AssertOKSuccess(t, resp)
		if len(body["posts"].([]any)) != 1 {
			t.Fatalf("posts = %#v", body["posts"])
		}
	})

	t.Run("get", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/market/"+postID.Hex(), nil, nil, "", false))
		body := testutil.AssertOKSuccess(t, resp)
		post := body["name"]
		if post != "Turntable Deck" {
			t.Fatalf("name = %#v", post)
		}
	})

	t.Run("create", func(t *testing.T) {
		body := map[string]any{
			"name":        "New Amp",
			"description": "Clean amp",
			"images":      []string{"https://cdn.example.test/temp/amp.png"},
			"chosenImage": "amp.png",
			"currency":    "AUD",
			"price":       125,
		}
		resp := testutil.Call(t, handler, testutil.Request(http.MethodPost, "/market", nil, body, ownerID.Hex(), false))
		testutil.AssertOKSuccess(t, resp)
		if len(s3Mock.Copies) == 0 || len(s3Mock.Puts) < 2 {
			t.Fatalf("expected image promotion, copies=%#v puts=%#v", s3Mock.Copies, s3Mock.Puts)
		}
	})

	t.Run("update", func(t *testing.T) {
		body := map[string]any{
			"id":           updateID.Hex(),
			"name":         "Draft Deck Updated",
			"description":  "Updated",
			"price":        99,
			"images":       []string{"selling-images/draft.png", "https://cdn.example.test/temp/draft2.png"},
			"chosenImage":  "draft2.png",
			"currency":     "AUD",
			"isNegotiable": true,
		}
		resp := testutil.Call(t, handler, testutil.Request(http.MethodPost, "/market/"+updateID.Hex(), nil, body, ownerID.Hex(), false))
		testutil.AssertOKSuccess(t, resp)
		if len(s3Mock.Copies) < 2 {
			t.Fatalf("copies = %#v", s3Mock.Copies)
		}
	})

	t.Run("delete unsupported", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodDelete, "/market/"+postID.Hex(), nil, nil, "", false))
		if resp.StatusCode != http.StatusNotFound {
			t.Fatalf("status = %d", resp.StatusCode)
		}
	})

	t.Run("report get unsupported", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/market/"+postID.Hex()+"/report", nil, nil, "", false))
		if resp.StatusCode != http.StatusNotFound {
			t.Fatalf("status = %d", resp.StatusCode)
		}
	})

	t.Run("report post", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodPost, "/market/"+postID.Hex()+"/report", nil, map[string]any{"description": "spam"}, ownerID.Hex(), false))
		testutil.AssertOKSuccess(t, resp)
		if count := testutil.Count(t, db, "reports", bson.M{"targetId": postID.Hex()}); count != 1 {
			t.Fatalf("reports count = %d", count)
		}
	})
}
