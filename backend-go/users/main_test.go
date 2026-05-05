package main

import (
	"net/http"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"vinyl-search/backend-go/common/testutil"
)

func TestUsersEndpoints(t *testing.T) {
	db := testutil.Mongo(t, "vinyl_test_users")
	s3Mock, _ := testutil.InstallAWSMocks(t)

	ownerID := bson.NewObjectID()
	recordID := bson.NewObjectID()
	postID := bson.NewObjectID()
	marketID := bson.NewObjectID()
	now := time.Now().UTC()

	testutil.Insert(t, db, "users", bson.M{
		"_id":         ownerID,
		"uid":         ownerID,
		"email":       "owner@example.test",
		"given_name":  "Old",
		"family_name": "Name",
		"name":        "Old Name",
		"picture":     "old.png",
	})
	testutil.Insert(t, db, "records", bson.M{
		"_id":         bson.NewObjectID(),
		"id":          recordID,
		"ownerUid":    ownerID,
		"name":        "Owned Record",
		"label":       "Owned Label",
		"catalogNo":   "OWN-1",
		"images":      bson.A{"records-images/user-record.png"},
		"chosenImage": "records-images/user-record.png",
		"latest":      true,
		"createdAt":   now,
	})
	testutil.Insert(t, db, "forum_posts", bson.M{
		"_id":       postID,
		"ownerUid":  ownerID,
		"postTitle": "Owned Forum",
		"postHTML":  `<p>Owned</p><img src="https://cdn.example.test/forum-images/user-forum.png">`,
		"comment":   false,
		"createdAt": now,
	})
	testutil.Insert(t, db, "selling_items", bson.M{
		"_id":         bson.NewObjectID(),
		"id":          marketID,
		"ownerUid":    ownerID,
		"name":        "Owned Sale",
		"images":      bson.A{"selling-images/user-sale.png"},
		"chosenImage": "selling-images/user-sale.png",
		"approved":    false,
		"rejected":    false,
		"sold":        false,
		"latest":      true,
		"createdAt":   now,
	})

	t.Run("profile", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/users", nil, nil, ownerID.Hex(), false))
		body := testutil.AssertOKSuccess(t, resp)
		if body["uid"] != ownerID.Hex() {
			t.Fatalf("uid = %#v", body["uid"])
		}
	})

	t.Run("update profile", func(t *testing.T) {
		update := map[string]any{"given_name": "New", "family_name": "Name", "picture": "new.png"}
		resp := testutil.Call(t, handler, testutil.Request(http.MethodPost, "/users", nil, update, ownerID.Hex(), false))
		body := testutil.AssertOKSuccess(t, resp)
		if body["name"] != "New Name" {
			t.Fatalf("name = %#v", body["name"])
		}
	})

	t.Run("records", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/users/records", map[string]string{"limit": "5"}, nil, ownerID.Hex(), false))
		body := testutil.AssertOKSuccess(t, resp)
		if len(body["records"].([]any)) != 1 {
			t.Fatalf("records = %#v", body["records"])
		}
	})

	t.Run("forum", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/users/forum", map[string]string{"limit": "5"}, nil, ownerID.Hex(), false))
		body := testutil.AssertOKSuccess(t, resp)
		if len(body["posts"].([]any)) != 1 {
			t.Fatalf("posts = %#v", body["posts"])
		}
	})

	t.Run("market", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/users/market", map[string]string{"limit": "5"}, nil, ownerID.Hex(), false))
		body := testutil.AssertOKSuccess(t, resp)
		if len(body["posts"].([]any)) != 1 {
			t.Fatalf("posts = %#v", body["posts"])
		}
	})

	t.Run("delete forum", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodDelete, "/users/forum/"+postID.Hex(), nil, nil, ownerID.Hex(), false))
		testutil.AssertOKSuccess(t, resp)
		if count := testutil.Count(t, db, "forum_posts", bson.M{"_id": postID}); count != 0 {
			t.Fatalf("forum count = %d", count)
		}
	})

	t.Run("delete record", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodDelete, "/users/records/"+recordID.Hex(), nil, nil, ownerID.Hex(), false))
		testutil.AssertOKSuccess(t, resp)
		if count := testutil.Count(t, db, "records", bson.M{"id": recordID}); count != 0 {
			t.Fatalf("record count = %d", count)
		}
	})

	t.Run("delete market", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodDelete, "/users/market/"+marketID.Hex(), nil, nil, ownerID.Hex(), false))
		testutil.AssertOKSuccess(t, resp)
		if count := testutil.Count(t, db, "selling_items", bson.M{"id": marketID}); count != 0 {
			t.Fatalf("market count = %d", count)
		}
		if len(s3Mock.Deletes) == 0 {
			t.Fatalf("deletes = %#v", s3Mock.Deletes)
		}
	})
}
