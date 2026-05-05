package main

import (
	"net/http"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"vinyl-search/backend-go/common/testutil"
)

func TestForumEndpoints(t *testing.T) {
	db := testutil.Mongo(t, "vinyl_test_forum")
	s3Mock, _ := testutil.InstallAWSMocks(t)

	ownerID := bson.NewObjectID()
	postID := bson.NewObjectID()
	commentID := bson.NewObjectID()
	now := time.Now().UTC()

	testutil.TextIndex(t, db, "forum_posts", "postTitle", "textHTML")
	testutil.Insert(t, db, "users", bson.M{
		"_id":     ownerID,
		"uid":     ownerID,
		"name":    "Forum User",
		"picture": "avatar.png",
	})
	testutil.Insert(t, db, "forum_posts",
		bson.M{
			"_id":       postID,
			"ownerUid":  ownerID,
			"postTitle": "Needle care",
			"postHTML":  `<p>Needle care</p><img src="https://cdn.example.test/forum-images/keep.png">`,
			"textHTML":  "Needle care",
			"comment":   false,
			"createdAt": now,
			"updatedAt": now,
		},
		bson.M{
			"_id":         commentID,
			"ownerUid":    ownerID,
			"postHTML":    `<p>First comment</p>`,
			"textHTML":    "First comment",
			"comment":     true,
			"comment_for": postID,
			"createdAt":   now.Add(time.Minute),
		},
	)

	t.Run("get post", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/forum/"+postID.Hex(), nil, nil, "", false))
		body := testutil.AssertOKSuccess(t, resp)
		post := body["post"].(map[string]any)
		if post["id"] != postID.Hex() {
			t.Fatalf("post id = %#v", post["id"])
		}
	})

	t.Run("get comments", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/forum/"+postID.Hex()+"/comments", nil, nil, "", false))
		body := testutil.AssertOKSuccess(t, resp)
		if len(body["comments"].([]any)) != 1 {
			t.Fatalf("comments = %#v", body["comments"])
		}
	})

	t.Run("unsupported comment get", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/forum/"+postID.Hex()+"/comments/"+commentID.Hex(), nil, nil, "", false))
		if resp.StatusCode != http.StatusNotFound {
			t.Fatalf("status = %d", resp.StatusCode)
		}
	})

	t.Run("list", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/forum", map[string]string{"limit": "5"}, nil, "", false))
		body := testutil.AssertOKSuccess(t, resp)
		if len(body["posts"].([]any)) != 1 {
			t.Fatalf("posts = %#v", body["posts"])
		}
	})

	t.Run("search", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodGet, "/forum/search", map[string]string{"query": "Needle"}, nil, "", false))
		body := testutil.AssertOKSuccess(t, resp)
		if len(body["posts"].([]any)) != 1 {
			t.Fatalf("posts = %#v", body["posts"])
		}
	})

	t.Run("create post", func(t *testing.T) {
		body := map[string]any{
			"postTitle": "New post",
			"postHTML":  `<p>Hello</p><img src="https://cdn.example.test/temp/forum-new.png">`,
		}
		resp := testutil.Call(t, handler, testutil.Request(http.MethodPost, "/forum", nil, body, ownerID.Hex(), false))
		testutil.AssertOKSuccess(t, resp)
		if len(s3Mock.Copies) == 0 {
			t.Fatalf("copies = %#v", s3Mock.Copies)
		}
	})

	t.Run("create comment", func(t *testing.T) {
		body := map[string]any{
			"comment":  true,
			"postHTML": `<p>Second comment</p>`,
		}
		resp := testutil.Call(t, handler, testutil.Request(http.MethodPost, "/forum/"+postID.Hex()+"/comments", nil, body, ownerID.Hex(), false))
		result := testutil.AssertOKSuccess(t, resp)
		newCommentID, ok := result["postId"].(string)
		if !ok || newCommentID == "" {
			t.Fatalf("postId = %#v", result["postId"])
		}

		deleteResp := testutil.Call(t, handler, testutil.Request(http.MethodDelete, "/forum/"+postID.Hex()+"/comments/"+newCommentID, nil, nil, ownerID.Hex(), false))
		testutil.AssertOKSuccess(t, deleteResp)
	})

	t.Run("update post", func(t *testing.T) {
		body := map[string]any{
			"postTitle": "Needle care updated",
			"postHTML":  `<p>Needle care updated</p><img src="https://cdn.example.test/temp/forum-update.png">`,
		}
		resp := testutil.Call(t, handler, testutil.Request(http.MethodPost, "/forum/"+postID.Hex(), nil, body, ownerID.Hex(), false))
		testutil.AssertOKSuccess(t, resp)
		if len(s3Mock.Deletes) == 0 {
			t.Fatalf("deletes = %#v", s3Mock.Deletes)
		}
	})

	t.Run("delete post", func(t *testing.T) {
		resp := testutil.Call(t, handler, testutil.Request(http.MethodDelete, "/forum/"+postID.Hex(), nil, nil, ownerID.Hex(), false))
		testutil.AssertOKSuccess(t, resp)
	})
}
