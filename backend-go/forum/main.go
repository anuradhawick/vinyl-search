package main

import (
	"context"
	"net/http"
	"time"

	"github.com/D-Andreev/lambdamux"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"vinyl-search/backend-go/common"
)

// main registers forum routes and starts the Lambda router.
func main() {
	router := lambdamux.NewLambdaMux()
	router.GET("/forum/:postId", getPost)
	router.GET("/forum/:postId/comments", getComments)
	router.GET("/forum/:postId/comments/:commentId", unsupported)
	router.GET("/forum", getPosts)
	router.GET("/forum/search", searchPosts)
	router.POST("/forum", saveNewPost)
	router.POST("/forum/:postId", saveExistingPost)
	router.POST("/forum/:postId/comments", saveComment)
	router.DELETE("/forum/:postId", removePost)
	router.DELETE("/forum/:postId/comments/:commentId", removeComment)

	lambda.Start(func(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
		common.NormalizePath(&req)
		return router.Handle(ctx, req)
	})
}

// unsupported returns a not found response for forum routes that are not implemented.
func unsupported(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return common.NotFound(), nil
}

// getPost returns a single forum post by path id.
func getPost(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	post, err := retrievePost(ctx, req.PathParameters["postId"])
	if err != nil {
		return common.Internal(map[string]any{"records": "ERROR", "success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"post": post, "success": true}), nil
}

// getComments returns all comments for a forum post.
func getComments(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	comments, err := retrieveComments(ctx, req.PathParameters["postId"])
	if err != nil {
		return common.Internal(map[string]any{"records": "ERROR", "success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"comments": comments, "success": true}), nil
}

// getPosts returns the paginated forum post listing.
func getPosts(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	posts, err := retrievePosts(ctx, req.QueryStringParameters)
	if err != nil {
		return common.Internal(map[string]any{"records": "ERROR", "success": false}, err), nil
	}
	posts["success"] = true
	return common.JSON(http.StatusOK, posts), nil
}

// searchPosts returns forum posts that match a full-text query.
func searchPosts(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	posts, err := searchForum(ctx, req.QueryStringParameters)
	if err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	posts["success"] = true
	return common.JSON(http.StatusOK, posts), nil
}

// saveNewPost creates a new top-level forum post for the authenticated user.
func saveNewPost(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	body, err := common.DecodeBody(req.Body)
	if err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	id, err := savePost(ctx, common.UID(req), body, "")
	if err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"postId": id, "success": true}), nil
}

// saveExistingPost updates an existing forum post owned by the authenticated user.
func saveExistingPost(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	body, err := common.DecodeBody(req.Body)
	if err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	id, err := savePost(ctx, common.UID(req), body, req.PathParameters["postId"])
	if err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"postId": id, "success": true}), nil
}

// saveComment creates a comment under an existing forum post.
func saveComment(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	body, err := common.DecodeBody(req.Body)
	if err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	id, err := savePost(ctx, common.UID(req), body, req.PathParameters["postId"])
	if err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"postId": id, "success": true}), nil
}

// removePost deletes a forum post owned by the authenticated user.
func removePost(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if err := deletePost(ctx, common.UID(req), req.PathParameters["postId"]); err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"success": true}), nil
}

// removeComment deletes a forum comment owned by the authenticated user.
func removeComment(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if err := deletePost(ctx, common.UID(req), req.PathParameters["commentId"]); err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"success": true}), nil
}

// retrievePost fetches one forum post document and mirrors its Mongo id into id.
func retrievePost(ctx context.Context, postID string) (bson.M, error) {
	oid, err := common.ParseOID(postID)
	if err != nil {
		return nil, err
	}
	db, err := common.DB(ctx)
	if err != nil {
		return nil, err
	}
	var post bson.M
	if err := db.Collection("forum_posts").FindOne(ctx, bson.M{"_id": oid}).Decode(&post); err != nil {
		return nil, err
	}
	post["id"] = post["_id"]
	return post, nil
}

// retrieveComments fetches comments for a post in creation order.
func retrieveComments(ctx context.Context, postID string) ([]bson.M, error) {
	oid, err := common.ParseOID(postID)
	if err != nil {
		return nil, err
	}
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"comment": true, "comment_for": oid}}},
		{{Key: "$sort", Value: bson.M{"createdAt": 1}}},
	}
	return aggregateMany(ctx, pipeline)
}

// retrievePosts returns paginated top-level forum posts.
func retrievePosts(ctx context.Context, params map[string]string) (bson.M, error) {
	limit := common.IntQuery(params, "limit", 50)
	skip := common.IntQuery(params, "skip", 0)
	pipeline := basePostPipeline(bson.M{"comment": false}, skip, limit)
	return aggregateOne(ctx, pipeline)
}

// searchForum returns paginated forum posts ranked by Mongo text search score.
func searchForum(ctx context.Context, params map[string]string) (bson.M, error) {
	limit := common.IntQuery(params, "limit", 50)
	skip := common.IntQuery(params, "skip", 0)
	query := common.StringQuery(params, "query", "")
	pipeline := basePostPipeline(bson.M{"$text": bson.M{"$search": query}}, skip, limit)
	pipeline = append(mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"$text": bson.M{"$search": query}}}},
		{{Key: "$addFields", Value: bson.M{"score": bson.M{"$meta": "textScore"}}}},
		{{Key: "$sort", Value: bson.M{"score": 1}}},
	}, pipeline[2:]...)
	return aggregateOne(ctx, pipeline)
}

// basePostPipeline builds the shared forum listing aggregation pipeline.
func basePostPipeline(match bson.M, skip, limit int64) mongo.Pipeline {
	return mongo.Pipeline{
		{{Key: "$match", Value: match}},
		{{Key: "$sort", Value: bson.M{"createdAt": -1}}},
		{{Key: "$lookup", Value: bson.M{"from": "users", "localField": "ownerUid", "foreignField": "uid", "as": "user"}}},
		{{Key: "$addFields", Value: bson.M{"ownerName": "$user.name", "ownerPic": "$user.picture", "id": "$_id"}}},
		{{Key: "$addFields", Value: bson.M{"ownerName": bson.M{"$arrayElemAt": bson.A{"$ownerName", 0}}, "ownerPic": bson.M{"$arrayElemAt": bson.A{"$ownerPic", 0}}}}},
		// Facet keeps the total count and page data in one aggregation result.
		{{Key: "$facet", Value: bson.M{
			"data": bson.A{bson.M{"$count": "total"}},
			"posts": bson.A{
				bson.M{"$skip": skip},
				bson.M{"$limit": limit},
				bson.M{"$project": bson.M{"user": 0, "_id": 0, "postHTML": 0, "textHTML": 0}},
			},
		}}},
		{{Key: "$addFields", Value: bson.M{"count": bson.M{"$arrayElemAt": bson.A{"$data", 0}}}}},
		{{Key: "$project", Value: bson.M{"data": 0}}},
		{{Key: "$addFields", Value: bson.M{"count": "$count.total", "skip": skip, "limit": limit}}},
	}
}

// savePost creates or updates a forum post, rewriting HTML images as needed.
func savePost(ctx context.Context, uid string, post bson.M, postID string) (any, error) {
	ownerUID, err := common.ParseOID(uid)
	if err != nil {
		return nil, err
	}
	db, err := common.DB(ctx)
	if err != nil {
		return nil, err
	}
	rewritten, err := common.RewriteForumHTML(stringValue(post["postHTML"]))
	if err != nil {
		return nil, err
	}
	for _, image := range rewritten.NewImages {
		// Only images uploaded through temp storage need to be promoted into forum-images.
		if err := common.CopyFromTemp(ctx, common.Filename(image), "forum-images"); err != nil {
			return nil, err
		}
	}
	post["postHTML"] = rewritten.HTML
	comment := boolValue(post["comment"])

	if postID != "" && !comment {
		// Updates return the previous document so removed embedded images can be cleaned up.
		oid, err := common.ParseOID(postID)
		if err != nil {
			return nil, err
		}
		var old bson.M
		err = db.Collection("forum_posts").FindOneAndUpdate(
			ctx,
			bson.M{"_id": oid, "ownerUid": ownerUID},
			bson.M{"$set": bson.M{
				"postHTML":  post["postHTML"],
				"postTitle": post["postTitle"],
				"updatedAt": time.Now(),
				"textHTML":  rewritten.Text,
			}},
			options.FindOneAndUpdate().SetReturnDocument(options.Before),
		).Decode(&old)
		if err == nil {
			oldImages, _ := common.ImageSources(stringValue(old["postHTML"]))
			for _, image := range removed(oldImages, rewritten.AllImages) {
				_ = common.DeleteObject(ctx, "forum-images/"+common.Filename(image))
			}
		}
		return postID, nil
	}

	post["ownerUid"] = ownerUID
	post["createdAt"] = time.Now()
	post["textHTML"] = rewritten.Text
	if comment {
		commentFor, err := common.ParseOID(postID)
		if err != nil {
			return nil, err
		}
		post["comment"] = true
		post["comment_for"] = commentFor
	} else {
		post["comment"] = false
	}
	result, err := db.Collection("forum_posts").InsertOne(ctx, post)
	if err != nil {
		return nil, err
	}
	if oid, ok := result.InsertedID.(bson.ObjectID); ok {
		return oid, nil
	}
	return result.InsertedID, nil
}

// deletePost deletes a post owned by uid and removes any embedded forum images.
func deletePost(ctx context.Context, uid, postID string) error {
	ownerUID, err := common.ParseOID(uid)
	if err != nil {
		return err
	}
	oid, err := common.ParseOID(postID)
	if err != nil {
		return err
	}
	db, err := common.DB(ctx)
	if err != nil {
		return err
	}
	var post bson.M
	if err := db.Collection("forum_posts").FindOne(ctx, bson.M{"_id": oid}).Decode(&post); err != nil {
		return err
	}
	images, _ := common.ImageSources(stringValue(post["postHTML"]))
	for _, image := range images {
		_ = common.DeleteObject(ctx, "forum-images/"+common.Filename(image))
	}
	return db.Collection("forum_posts").FindOneAndDelete(ctx, bson.M{"_id": oid, "ownerUid": ownerUID}).Err()
}

// aggregateOne returns the first document from a forum aggregation pipeline.
func aggregateOne(ctx context.Context, pipeline mongo.Pipeline) (bson.M, error) {
	data, err := aggregateMany(ctx, pipeline)
	if err != nil || len(data) == 0 {
		return bson.M{}, err
	}
	return data[0], nil
}

// aggregateMany runs an aggregation pipeline against forum_posts.
func aggregateMany(ctx context.Context, pipeline mongo.Pipeline) ([]bson.M, error) {
	db, err := common.DB(ctx)
	if err != nil {
		return nil, err
	}
	cursor, err := db.Collection("forum_posts").Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	var data []bson.M
	err = cursor.All(ctx, &data)
	return data, err
}

// removed returns old image URLs that no longer appear in the new image list.
func removed(oldImages, newImages []string) []string {
	present := map[string]bool{}
	for _, image := range newImages {
		present[image] = true
	}
	var out []string
	for _, image := range oldImages {
		if !present[image] {
			out = append(out, image)
		}
	}
	return out
}

// stringValue safely converts string values from loosely typed request bodies.
func stringValue(value any) string {
	if value == nil {
		return ""
	}
	if s, ok := value.(string); ok {
		return s
	}
	return ""
}

// boolValue safely converts boolean values from loosely typed request bodies.
func boolValue(value any) bool {
	if b, ok := value.(bool); ok {
		return b
	}
	return false
}
