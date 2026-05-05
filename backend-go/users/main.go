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

// main registers user account routes and starts the Lambda router.
func main() {
	lambda.Start(handler)
}

// handler normalizes API Gateway paths and dispatches requests through the users router.
func handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	common.NormalizePath(&req)
	return newRouter().Handle(ctx, req)
}

// newRouter registers user account routes.
func newRouter() *lambdamux.LambdaMux {
	router := lambdamux.NewLambdaMux()
	router.GET("/users", getProfile)
	router.POST("/users", updateProfile)
	router.GET("/users/records", getRecords)
	router.DELETE("/users/records/:recordId", deleteRecord)
	router.GET("/users/forum", getForum)
	router.DELETE("/users/forum/:postId", deleteForum)
	router.GET("/users/market", getMarket)
	router.DELETE("/users/market/:postId", deleteMarket)

	return router
}

// getProfile returns the authenticated user's profile.
func getProfile(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	user, err := user(ctx, common.UID(req))
	if err != nil {
		return common.Internal(map[string]any{"records": "ERROR", "success": false}, err), nil
	}
	user["success"] = true
	return common.JSON(http.StatusOK, user), nil
}

// updateProfile applies allowed profile changes for the authenticated user.
func updateProfile(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	body, err := common.DecodeBody(req.Body)
	if err != nil {
		return common.Internal(map[string]any{"records": "ERROR", "success": false}, err), nil
	}
	user, err := updateUser(ctx, common.UID(req), body)
	if err != nil {
		return common.Internal(map[string]any{"records": "ERROR", "success": false}, err), nil
	}
	if user == nil {
		user = bson.M{}
	}
	user["success"] = true
	return common.JSON(http.StatusOK, user), nil
}

// getRecords returns records owned by the authenticated user.
func getRecords(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	records, err := userRecords(ctx, common.UID(req), req.QueryStringParameters)
	if err != nil {
		return common.Internal(map[string]any{"records": "ERROR", "success": false}, err), nil
	}
	records["success"] = true
	return common.JSON(http.StatusOK, records), nil
}

// getForum returns forum posts owned by the authenticated user.
func getForum(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	posts, err := userForumPosts(ctx, common.UID(req), req.QueryStringParameters)
	if err != nil {
		return common.Internal(map[string]any{"records": "ERROR", "success": false}, err), nil
	}
	posts["success"] = true
	return common.JSON(http.StatusOK, posts), nil
}

// getMarket returns marketplace posts owned by the authenticated user.
func getMarket(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	posts, err := userMarketPosts(ctx, common.UID(req), req.QueryStringParameters)
	if err != nil {
		return common.Internal(map[string]any{"records": "ERROR", "success": false}, err), nil
	}
	posts["success"] = true
	return common.JSON(http.StatusOK, posts), nil
}

// deleteForum deletes one forum post owned by the authenticated user.
func deleteForum(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if err := deleteForumPost(ctx, common.UID(req), req.PathParameters["postId"]); err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"success": true}), nil
}

// deleteRecord deletes one logical record owned by the authenticated user.
func deleteRecord(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if err := deleteUserRecord(ctx, common.UID(req), req.PathParameters["recordId"]); err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"success": true}), nil
}

// deleteMarket deletes one marketplace ad owned by the authenticated user.
func deleteMarket(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if err := deleteMarketplaceAd(ctx, common.UID(req), req.PathParameters["postId"]); err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"success": true}), nil
}

// updateUser updates mutable profile fields and returns the updated user document.
func updateUser(ctx context.Context, uid string, data bson.M) (bson.M, error) {
	oid, err := common.ParseOID(uid)
	if err != nil {
		return nil, err
	}
	set := bson.M{"updatedAt": time.Now()}
	if stringValue(data["picture"]) != "" {
		set["picture"] = data["picture"]
	}
	if stringValue(data["family_name"]) != "" && stringValue(data["given_name"]) != "" {
		// Keep the display name derived from given and family names for compatibility.
		set["family_name"] = data["family_name"]
		set["given_name"] = data["given_name"]
		set["name"] = stringValue(data["given_name"]) + " " + stringValue(data["family_name"])
	}
	if len(set) == 1 {
		return nil, nil
	}
	db, err := common.DB(ctx)
	if err != nil {
		return nil, err
	}
	var user bson.M
	err = db.Collection("users").FindOneAndUpdate(
		ctx,
		bson.M{"_id": oid},
		bson.M{"$set": set},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&user)
	return user, err
}

// user fetches the authenticated user's profile by uid.
func user(ctx context.Context, uid string) (bson.M, error) {
	oid, err := common.ParseOID(uid)
	if err != nil {
		return nil, err
	}
	db, err := common.DB(ctx)
	if err != nil {
		return nil, err
	}
	var user bson.M
	if err := db.Collection("users").FindOne(ctx, bson.M{"_id": oid}).Decode(&user); err != nil {
		return nil, err
	}
	user["uid"] = user["_id"]
	return user, nil
}

// userRecords returns paginated latest-version records owned by a user.
func userRecords(ctx context.Context, uid string, params map[string]string) (bson.M, error) {
	owner, err := common.ParseOID(uid)
	if err != nil {
		return nil, err
	}
	limit := common.IntQuery(params, "limit", 30)
	skip := common.IntQuery(params, "skip", 0)
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"ownerUid": owner, "latest": true}}},
		{{Key: "$facet", Value: bson.M{
			"data": bson.A{bson.M{"$count": "total"}},
			"records": bson.A{
				bson.M{"$sort": bson.M{"createdAt": -1}},
				bson.M{"$skip": skip},
				bson.M{"$limit": limit},
				bson.M{"$project": bson.M{"name": 1, "label": 1, "genres": 1, "chosenImage": 1, "catalogNo": 1, "images": 1, "id": 1, "score": 1}},
			},
		}}},
		{{Key: "$addFields", Value: bson.M{"count": bson.M{"$arrayElemAt": bson.A{"$data", 0}}}}},
		{{Key: "$addFields", Value: bson.M{"count": "$count.total", "limit": limit, "skip": skip}}},
		{{Key: "$project", Value: bson.M{"data": 0}}},
	}
	data, err := aggregateOne(ctx, "records", pipeline)
	if err != nil {
		return nil, err
	}
	common.RewriteImageList(data, "records", "records-images", "thumbnails")
	return data, nil
}

// userForumPosts returns paginated forum posts owned by a user.
func userForumPosts(ctx context.Context, uid string, params map[string]string) (bson.M, error) {
	owner, err := common.ParseOID(uid)
	if err != nil {
		return nil, err
	}
	limit := common.IntQuery(params, "limit", 5)
	skip := common.IntQuery(params, "skip", 0)
	pipeline := userPostsPipeline(bson.M{"ownerUid": owner}, skip, limit, bson.M{"postTitle": 1, "createdAt": 1, "id": 1})
	return aggregateOne(ctx, "forum_posts", pipeline)
}

// userMarketPosts returns paginated marketplace posts owned by a user.
func userMarketPosts(ctx context.Context, uid string, params map[string]string) (bson.M, error) {
	owner, err := common.ParseOID(uid)
	if err != nil {
		return nil, err
	}
	limit := common.IntQuery(params, "limit", 5)
	skip := common.IntQuery(params, "skip", 0)
	project := bson.M{"name": 1, "createdAt": 1, "chosenImage": 1, "images": 1, "id": 1, "approved": 1, "rejected": 1, "sold": 1}
	return aggregateOne(ctx, "selling_items", userPostsPipeline(bson.M{"ownerUid": owner}, skip, limit, project))
}

// userPostsPipeline builds the shared pagination pipeline for user-owned content.
func userPostsPipeline(match bson.M, skip, limit int64, project bson.M) mongo.Pipeline {
	return mongo.Pipeline{
		{{Key: "$match", Value: match}},
		{{Key: "$facet", Value: bson.M{
			"data": bson.A{bson.M{"$count": "total"}},
			"posts": bson.A{
				bson.M{"$sort": bson.M{"createdAt": -1}},
				bson.M{"$skip": skip},
				bson.M{"$limit": limit},
				bson.M{"$addFields": bson.M{"id": "$_id"}},
				bson.M{"$project": project},
			},
		}}},
		{{Key: "$addFields", Value: bson.M{"count": bson.M{"$arrayElemAt": bson.A{"$data", 0}}}}},
		{{Key: "$addFields", Value: bson.M{"count": "$count.total", "limit": limit, "skip": skip}}},
		{{Key: "$project", Value: bson.M{"data": 0}}},
	}
}

// deleteForumPost deletes an owned forum post and removes its embedded images.
func deleteForumPost(ctx context.Context, uid, postID string) error {
	owner, err := common.ParseOID(uid)
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
	return db.Collection("forum_posts").FindOneAndDelete(ctx, bson.M{"_id": oid, "ownerUid": owner}).Err()
}

// deleteUserRecord deletes all owned revisions for a logical record and its images.
func deleteUserRecord(ctx context.Context, uid, recordID string) error {
	owner, err := common.ParseOID(uid)
	if err != nil {
		return err
	}
	oid, err := common.ParseOID(recordID)
	if err != nil {
		return err
	}
	db, err := common.DB(ctx)
	if err != nil {
		return err
	}
	cursor, err := db.Collection("records").Find(ctx, bson.M{"id": oid})
	if err != nil {
		return err
	}
	var records []bson.M
	if err := cursor.All(ctx, &records); err != nil {
		return err
	}
	var images []string
	for _, record := range records {
		// Gather images across all revisions before deleting the logical record.
		images = append(images, common.StringSlice(record["images"])...)
	}
	for _, image := range common.UniqueStrings(images) {
		filename := common.Filename(image)
		_ = common.DeleteObject(ctx, "records-images/"+filename)
		_ = common.DeleteObject(ctx, "records-images/watermarked/"+filename)
	}
	_, err = db.Collection("records").DeleteMany(ctx, bson.M{"id": oid, "ownerUid": owner})
	return err
}

// deleteMarketplaceAd deletes all owned versions of a marketplace ad and its images.
func deleteMarketplaceAd(ctx context.Context, uid, postID string) error {
	owner, err := common.ParseOID(uid)
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
	cursor, err := db.Collection("selling_items").Find(ctx, bson.M{"id": oid})
	if err != nil {
		return err
	}
	var posts []bson.M
	if err := cursor.All(ctx, &posts); err != nil {
		return err
	}
	var images []string
	for _, post := range posts {
		// Gather images across all versions before deleting the logical ad.
		images = append(images, common.StringSlice(post["images"])...)
	}
	for _, image := range common.UniqueStrings(images) {
		if common.PreviousPathSegment(image) != "selling-images" {
			continue
		}
		_ = common.DeleteObject(ctx, "selling-images/"+common.Filename(image))
	}
	_, err = db.Collection("selling_items").DeleteMany(ctx, bson.M{"id": oid, "ownerUid": owner})
	return err
}

// aggregateOne returns the first document from a collection aggregation pipeline.
func aggregateOne(ctx context.Context, collection string, pipeline mongo.Pipeline) (bson.M, error) {
	db, err := common.DB(ctx)
	if err != nil {
		return nil, err
	}
	cursor, err := db.Collection(collection).Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	var data []bson.M
	if err := cursor.All(ctx, &data); err != nil {
		return nil, err
	}
	if len(data) == 0 {
		return bson.M{}, nil
	}
	return data[0], nil
}

// stringValue safely converts string values from loosely typed request bodies.
func stringValue(value any) string {
	if s, ok := value.(string); ok {
		return s
	}
	return ""
}
