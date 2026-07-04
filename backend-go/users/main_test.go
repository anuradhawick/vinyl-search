package main

import (
	"net/http"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"vinyl-search/backend-go/common/testutil"
)

type usersTestFixture struct {
	db       *mongo.Database
	ownerID  bson.ObjectID
	recordID bson.ObjectID
	postID   bson.ObjectID
	marketID bson.ObjectID
}

func setupUsersTest(t *testing.T) usersTestFixture {
	t.Helper()

	db := testutil.Mongo(t, "vinyl_test_users")

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
		"chosenImage": 0,
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
		"chosenImage": 0,
		"approved":    false,
		"rejected":    false,
		"sold":        false,
		"latest":      true,
		"createdAt":   now,
	})

	return usersTestFixture{
		db:       db,
		ownerID:  ownerID,
		recordID: recordID,
		postID:   postID,
		marketID: marketID,
	}
}

func TestUserProfile(t *testing.T) {
	fixture := setupUsersTest(t)

	resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/users", nil, nil, fixture.ownerID.Hex(), false))
	body := testutil.AssertOKSuccess(t, resp)
	if body["uid"] != fixture.ownerID.Hex() {
		t.Fatalf("uid = %#v", body["uid"])
	}
}

func TestUserProfileSyncsAdminRole(t *testing.T) {
	fixture := setupUsersTest(t)

	resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/users", nil, nil, fixture.ownerID.Hex(), true))
	body := testutil.AssertOKSuccess(t, resp)
	roles := body["roles"].([]any)
	if len(roles) != 1 || roles[0] != "Admin" {
		t.Fatalf("roles = %#v", roles)
	}
	if count := testutil.Count(t, fixture.db, "users", bson.M{"_id": fixture.ownerID, "roles": "Admin"}); count != 1 {
		t.Fatalf("admin role count = %d", count)
	}
}

func TestUpdateUserProfile(t *testing.T) {
	fixture := setupUsersTest(t)

	update := map[string]any{"given_name": "New", "family_name": "Name", "picture": "new.png"}
	resp := testutil.Call(t, handler, testutil.Request(http.MethodPost, "/users", nil, update, fixture.ownerID.Hex(), false))
	body := testutil.AssertOKSuccess(t, resp)
	if body["name"] != "New Name" {
		t.Fatalf("name = %#v", body["name"])
	}
}

func TestUserRecords(t *testing.T) {
	fixture := setupUsersTest(t)

	resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/users/records", map[string]string{"limit": "5"}, nil, fixture.ownerID.Hex(), false))
	body := testutil.AssertOKSuccess(t, resp)
	if len(body["records"].([]any)) != 1 {
		t.Fatalf("records = %#v", body["records"])
	}
}

func TestUserForum(t *testing.T) {
	fixture := setupUsersTest(t)

	resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/users/forum", map[string]string{"limit": "5"}, nil, fixture.ownerID.Hex(), false))
	body := testutil.AssertOKSuccess(t, resp)
	if len(body["posts"].([]any)) != 1 {
		t.Fatalf("posts = %#v", body["posts"])
	}
}

func TestUserMarket(t *testing.T) {
	fixture := setupUsersTest(t)

	resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/users/market", map[string]string{"limit": "5"}, nil, fixture.ownerID.Hex(), false))
	body := testutil.AssertOKSuccess(t, resp)
	if len(body["market"].([]any)) != 1 {
		t.Fatalf("market = %#v", body["market"])
	}
}

func TestDeleteUserForum(t *testing.T) {
	fixture := setupUsersTest(t)

	resp := testutil.Call(t, handler, testutil.Request(http.MethodDelete, "/users/forum/"+fixture.postID.Hex(), nil, nil, fixture.ownerID.Hex(), false))
	testutil.AssertOKSuccess(t, resp)
	if count := testutil.Count(t, fixture.db, "forum_posts", bson.M{"_id": fixture.postID}); count != 0 {
		t.Fatalf("forum count = %d", count)
	}
}

func TestDeleteUserRecord(t *testing.T) {
	fixture := setupUsersTest(t)

	resp := testutil.Call(t, handler, testutil.Request(http.MethodDelete, "/users/records/"+fixture.recordID.Hex(), nil, nil, fixture.ownerID.Hex(), false))
	testutil.AssertOKSuccess(t, resp)
	if count := testutil.Count(t, fixture.db, "records", bson.M{"_id": fixture.recordID}); count != 0 {
		t.Fatalf("record count = %d", count)
	}
}
