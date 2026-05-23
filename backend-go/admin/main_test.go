package main

import (
	"context"
	"net/http"
	"testing"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
	"go.mongodb.org/mongo-driver/v2/bson"

	"vinyl-search/backend-go/common/testutil"
)

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

func TestAdminEndpoints(t *testing.T) {
	db := testutil.Mongo(t, "vinyl_test_admin")
	s3Mock, cognitoMock := testutil.InstallAWSMocks(t)
	cognitoMock.DefaultUsers = []types.UserType{{Username: aws.String("cognito-user")}}

	adminID := bson.NewObjectID()
	userID := bson.NewObjectID()
	recordID := bson.NewObjectID()
	forumID := bson.NewObjectID()
	reportID := bson.NewObjectID()
	marketPendingID := bson.NewObjectID()
	marketUpdateID := bson.NewObjectID()
	now := time.Now().UTC()

	testutil.Insert(t, db, "users",
		bson.M{"_id": adminID, "uid": adminID, "name": "Admin User", "email": "admin@example.test", "picture": "admin.png", "roles": bson.A{"Admin"}},
		bson.M{"_id": userID, "uid": userID, "name": "Member User", "email": "member@example.test", "picture": "member.png", "roles": bson.A{"Admin"}},
	)
	testutil.Insert(t, db, "records", bson.M{
		"_id":         bson.NewObjectID(),
		"id":          recordID,
		"ownerUid":    userID,
		"name":        "Admin Record",
		"label":       "Admin Label",
		"genres":      bson.A{"Jazz"},
		"catalogNo":   "ADM-1",
		"images":      bson.A{"records-images/admin-record.png"},
		"chosenImage": "records-images/admin-record.png",
		"latest":      true,
		"createdAt":   now,
	})
	testutil.Insert(t, db, "forum_posts", bson.M{
		"_id":       forumID,
		"ownerUid":  userID,
		"postTitle": "Admin Forum",
		"postHTML":  `<p>Admin</p><img src="https://cdn.example.test/forum-images/admin-forum.png">`,
		"comment":   false,
		"createdAt": now,
	})
	testutil.Insert(t, db, "reports", bson.M{
		"_id":         reportID,
		"description": "Bad listing",
		"type":        "report_selling_ad",
		"targetId":    marketPendingID.Hex(),
		"resolved":    false,
		"createdAt":   now,
	})
	testutil.Insert(t, db, "selling_items",
		bson.M{
			"_id":         bson.NewObjectID(),
			"id":          marketPendingID,
			"ownerUid":    userID,
			"name":        "Pending Sale",
			"images":      bson.A{"selling-images/pending.png"},
			"chosenImage": "selling-images/pending.png",
			"approved":    false,
			"rejected":    false,
			"sold":        false,
			"latest":      true,
			"createdAt":   now,
			"updatedAt":   now,
		},
		bson.M{
			"_id":         bson.NewObjectID(),
			"id":          marketUpdateID,
			"ownerUid":    userID,
			"name":        "Sale To Update",
			"images":      bson.A{"selling-images/update.png"},
			"chosenImage": "selling-images/update.png",
			"approved":    true,
			"rejected":    false,
			"sold":        false,
			"latest":      true,
			"createdAt":   now,
			"updatedAt":   now,
		},
	)

	adminReq := func(method, path string, query map[string]string, body any) events.APIGatewayProxyRequest {
		return testutil.Request(method, path, query, body, adminID.Hex(), true)
	}

	t.Run("users", func(t *testing.T) {
		resp := testutil.Call(t, handler, adminReq(http.MethodGet, "/admin/users", map[string]string{"limit": "10"}, nil))
		if resp.StatusCode != http.StatusOK {
			t.Fatalf("status = %d body = %s", resp.StatusCode, resp.Body)
		}
		body := testutil.BodyMap(t, resp)
		if len(body["users"].([]any)) != 2 {
			t.Fatalf("users = %#v", body["users"])
		}
	})

	t.Run("user by uid", func(t *testing.T) {
		resp := testutil.Call(t, handler, adminReq(http.MethodGet, "/admin/users/"+userID.Hex(), nil, nil))
		if resp.StatusCode != http.StatusOK {
			t.Fatalf("status = %d body = %s", resp.StatusCode, resp.Body)
		}
		body := testutil.BodyMap(t, resp)
		if body["email"] != "member@example.test" {
			t.Fatalf("email = %#v", body["email"])
		}
	})

	t.Run("admin users", func(t *testing.T) {
		resp := testutil.Call(t, handler, adminReq(http.MethodGet, "/admin/admin-users", nil, nil))
		body := testutil.AssertOKSuccess(t, resp)
		if len(body["users"].([]any)) != 2 {
			t.Fatalf("users = %#v", body["users"])
		}
	})

	t.Run("remove admin", func(t *testing.T) {
		resp := testutil.Call(t, handler, adminReq(http.MethodDelete, "/admin/admin-users/"+userID.Hex(), nil, nil))
		testutil.AssertOKSuccess(t, resp)
		if len(cognitoMock.RemoveUserFromGroupCalls) != 1 {
			t.Fatalf("remove calls = %#v", cognitoMock.RemoveUserFromGroupCalls)
		}
	})

	t.Run("add admin", func(t *testing.T) {
		resp := testutil.Call(t, handler, adminReq(http.MethodPost, "/admin/admin-users/member@example.test", nil, nil))
		testutil.AssertOKSuccess(t, resp)
		if len(cognitoMock.AddUserToGroupCalls) != 1 {
			t.Fatalf("add calls = %#v", cognitoMock.AddUserToGroupCalls)
		}
	})

	t.Run("records", func(t *testing.T) {
		resp := testutil.Call(t, handler, adminReq(http.MethodGet, "/admin/records", map[string]string{"limit": "5"}, nil))
		body := testutil.AssertOKSuccess(t, resp)
		if len(body["records"].([]any)) != 1 {
			t.Fatalf("records = %#v", body["records"])
		}
	})

	t.Run("forum", func(t *testing.T) {
		resp := testutil.Call(t, handler, adminReq(http.MethodGet, "/admin/forum", map[string]string{"limit": "5"}, nil))
		body := testutil.AssertOKSuccess(t, resp)
		if len(body["posts"].([]any)) != 1 {
			t.Fatalf("posts = %#v", body["posts"])
		}
	})

	t.Run("reports", func(t *testing.T) {
		resp := testutil.Call(t, handler, adminReq(http.MethodGet, "/admin/reports", map[string]string{"limit": "5"}, nil))
		body := testutil.AssertOKSuccess(t, resp)
		if len(body["reports"].([]any)) != 1 {
			t.Fatalf("reports = %#v", body["reports"])
		}
	})

	t.Run("resolve report", func(t *testing.T) {
		resp := testutil.Call(t, handler, adminReq(http.MethodPost, "/admin/reports/"+reportID.Hex(), nil, nil))
		testutil.AssertOKSuccess(t, resp)
		if count := testutil.Count(t, db, "reports", bson.M{"_id": reportID, "resolved": true}); count != 1 {
			t.Fatalf("resolved count = %d", count)
		}
	})

	t.Run("market list", func(t *testing.T) {
		resp := testutil.Call(t, handler, adminReq(http.MethodGet, "/admin/market", map[string]string{"type": "pending", "limit": "5"}, nil))
		body := testutil.AssertOKSuccess(t, resp)
		if len(body["posts"].([]any)) != 1 {
			t.Fatalf("posts = %#v", body["posts"])
		}
	})

	t.Run("market get", func(t *testing.T) {
		resp := testutil.Call(t, handler, adminReq(http.MethodGet, "/admin/market/"+marketUpdateID.Hex(), nil, nil))
		body := testutil.AssertOKSuccess(t, resp)
		if body["name"] != "Sale To Update" {
			t.Fatalf("name = %#v", body["name"])
		}
	})

	t.Run("market action", func(t *testing.T) {
		resp := testutil.Call(t, handler, adminReq(http.MethodPost, "/admin/market", nil, map[string]any{"id": marketPendingID.Hex(), "type": "approve"}))
		testutil.AssertOKSuccess(t, resp)
		if count := testutil.Count(t, db, "selling_items", bson.M{"id": marketPendingID, "approved": true, "paid": true}); count != 1 {
			t.Fatalf("approved count = %d", count)
		}
	})

	t.Run("market update", func(t *testing.T) {
		body := map[string]any{
			"id":          marketUpdateID.Hex(),
			"name":        "Sale Updated",
			"images":      []string{"selling-images/update.png", "https://cdn.example.test/temp/admin-market.png"},
			"chosenImage": "admin-market.png",
		}
		resp := testutil.Call(t, handler, adminReq(http.MethodPost, "/admin/market/"+marketUpdateID.Hex(), nil, body))
		testutil.AssertOKSuccess(t, resp)
		if len(s3Mock.Copies) == 0 {
			t.Fatalf("copies = %#v", s3Mock.Copies)
		}
	})

	t.Run("delete record", func(t *testing.T) {
		resp := testutil.Call(t, handler, adminReq(http.MethodDelete, "/records/"+recordID.Hex(), nil, nil))
		testutil.AssertOKSuccess(t, resp)
		if count := testutil.Count(t, db, "records", bson.M{"id": recordID}); count != 0 {
			t.Fatalf("record count = %d", count)
		}
	})

	t.Run("delete forum", func(t *testing.T) {
		resp := testutil.Call(t, handler, adminReq(http.MethodDelete, "/forum/"+forumID.Hex(), nil, nil))
		testutil.AssertOKSuccess(t, resp)
		if count := testutil.Count(t, db, "forum_posts", bson.M{"_id": forumID}); count != 0 {
			t.Fatalf("forum count = %d", count)
		}
	})
}
