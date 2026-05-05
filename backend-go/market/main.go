package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/D-Andreev/lambdamux"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"vinyl-search/backend-go/common"
)

// main registers marketplace routes and starts the Lambda router.
func main() {
	lambda.Start(handler)
}

// handler normalizes API Gateway paths and dispatches requests through the market router.
func handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	common.NormalizePath(&req)
	return newRouter().Handle(ctx, req)
}

// newRouter registers marketplace routes.
func newRouter() *lambdamux.LambdaMux {
	router := lambdamux.NewLambdaMux()
	router.GET("/market/search", searchPosts)
	router.GET("/market", fetchPosts)
	router.POST("/market", newPost)
	router.GET("/market/:postId", fetchPost)
	router.POST("/market/:postId", updatePost)
	router.DELETE("/market/:postId", unsupported)
	router.GET("/market/:postId/report", unsupported)
	router.POST("/market/:postId/report", reportPost)

	return router
}

// unsupported returns a not found response for marketplace routes that are not implemented.
func unsupported(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return common.NotFound(), nil
}

// searchPosts returns marketplace posts that match query and filter parameters.
func searchPosts(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	data, err := search(ctx, req.QueryStringParameters)
	if err != nil {
		return common.Internal(map[string]any{"records": "ERROR", "success": false}, err), nil
	}
	data["success"] = true
	return common.JSON(http.StatusOK, data), nil
}

// fetchPosts returns the active marketplace listing.
func fetchPosts(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	data, err := list(ctx, req.QueryStringParameters)
	if err != nil {
		return common.Internal(map[string]any{"records": "ERROR", "success": false}, err), nil
	}
	data["success"] = true
	return common.JSON(http.StatusOK, data), nil
}

// fetchPost returns a single active marketplace post.
func fetchPost(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	data, err := get(ctx, req.PathParameters["postId"])
	if err != nil {
		return common.Internal(map[string]any{"records": "ERROR", "success": false}, err), nil
	}
	data["success"] = true
	return common.JSON(http.StatusOK, data), nil
}

// newPost creates a marketplace post for the authenticated user.
func newPost(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	body, err := common.DecodeBody(req.Body)
	if err != nil {
		return common.Internal(map[string]any{"records": "ERROR", "success": false}, err), nil
	}
	result, err := create(ctx, common.UID(req), body)
	if err != nil {
		return common.Internal(map[string]any{"records": "ERROR", "success": false}, err), nil
	}
	result["success"] = true
	return common.JSON(http.StatusOK, result), nil
}

// updatePost updates an unapproved marketplace post owned by the authenticated user.
func updatePost(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	body, err := common.DecodeBody(req.Body)
	if err != nil {
		return common.Internal(map[string]any{"records": "ERROR", "success": false}, err), nil
	}
	result, err := update(ctx, common.UID(req), req.PathParameters["postId"], body)
	if err != nil {
		return common.Internal(map[string]any{"records": "ERROR", "success": false}, err), nil
	}
	result["success"] = true
	return common.JSON(http.StatusOK, result), nil
}

// reportPost records a user report for a marketplace post.
func reportPost(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	body, err := common.DecodeBody(req.Body)
	if err != nil {
		return common.Internal(map[string]any{"records": "ERROR", "success": false}, err), nil
	}
	result, err := report(ctx, common.UID(req), req.PathParameters["postId"], body)
	if err != nil {
		return common.Internal(map[string]any{"records": "ERROR", "success": false}, err), nil
	}
	result["success"] = true
	return common.JSON(http.StatusOK, result), nil
}

// search returns filtered active marketplace posts with pagination metadata.
func search(ctx context.Context, params map[string]string) (bson.M, error) {
	materials := common.StringArrayQuery(params, "material")
	gears := common.StringArrayQuery(params, "gear")
	limit := common.IntQuery(params, "limit", 30)
	skip := common.IntQuery(params, "skip", 0)
	query := common.StringQuery(params, "query", "")

	match := activeMarketplaceMatch()
	if query != "" {
		match["$text"] = bson.M{"$search": query}
	}
	if len(gears) > 0 || len(materials) > 0 {
		// Subtype filters are scoped by sale type so gear and material values do not overlap.
		match["$or"] = bson.A{
			bson.M{"$and": bson.A{bson.M{"saleType": bson.M{"$eq": "gear"}}, bson.M{"saleSubtype": bson.M{"$in": common.StringArray(gears)}}}},
			bson.M{"$and": bson.A{bson.M{"saleType": bson.M{"$eq": "material"}}, bson.M{"saleSubtype": bson.M{"$in": common.StringArray(materials)}}}},
		}
	}

	pipeline := mongo.Pipeline{{{Key: "$match", Value: match}}}
	if query != "" {
		pipeline = append(pipeline,
			bson.D{{Key: "$addFields", Value: bson.M{"score": bson.M{"$meta": "textScore"}}}},
			bson.D{{Key: "$sort", Value: bson.M{"score": 1}}},
		)
	} else {
		pipeline = append(pipeline, bson.D{{Key: "$sort", Value: bson.M{"createdAt": -1}}})
	}
	pipeline = append(pipeline, postsFacet(skip, limit)...)
	result, err := aggregateOne(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	common.RewriteImageList(result, "posts", "selling-images", "thumbnails")
	return result, nil
}

// list returns active marketplace posts sorted by newest first.
func list(ctx context.Context, params map[string]string) (bson.M, error) {
	limit := common.IntQuery(params, "limit", 30)
	skip := common.IntQuery(params, "skip", 0)
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: activeMarketplaceMatch()}},
		{{Key: "$sort", Value: bson.M{"createdAt": -1}}},
	}
	pipeline = append(pipeline, postsFacet(skip, limit)...)
	result, err := aggregateOne(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	common.RewriteImageList(result, "posts", "selling-images", "thumbnails")
	return result, nil
}

// activeMarketplaceMatch builds the public visibility filter for marketplace posts.
func activeMarketplaceMatch() bson.M {
	return bson.M{
		"approved": true,
		"sold":     false,
		"rejected": false,
		"latest":   true,
		"updatedAt": bson.M{
			"$gt": time.Now().Add(-60 * 24 * time.Hour),
		},
	}
}

// postsFacet builds the marketplace pagination facet.
func postsFacet(skip, limit int64) mongo.Pipeline {
	return mongo.Pipeline{
		{{Key: "$facet", Value: bson.M{
			"data": bson.A{bson.M{"$count": "total"}},
			"posts": bson.A{
				bson.M{"$skip": skip},
				bson.M{"$limit": limit},
				bson.M{"$project": bson.M{"name": 1, "chosenImage": 1, "images": 1, "id": 1, "score": 1}},
			},
		}}},
		{{Key: "$addFields", Value: bson.M{"count": bson.M{"$arrayElemAt": bson.A{"$data", 0}}}}},
		{{Key: "$addFields", Value: bson.M{"count": "$count.total", "limit": limit, "skip": skip}}},
		{{Key: "$project", Value: bson.M{"data": 0}}},
	}
}

// get fetches one latest marketplace post and rewrites image URLs for display.
func get(ctx context.Context, postID string) (bson.M, error) {
	oid, err := common.ParseOID(postID)
	if err != nil {
		return nil, err
	}
	db, err := common.DB(ctx)
	if err != nil {
		return nil, err
	}
	var data bson.M
	if err := db.Collection("selling_items").FindOne(ctx, bson.M{"id": oid, "latest": true}).Decode(&data); err != nil {
		return nil, err
	}
	common.RewriteImages(data, "selling-images", "watermarked")
	return data, nil
}

// create inserts a new marketplace post in a pending moderation state.
func create(ctx context.Context, uid string, post bson.M) (bson.M, error) {
	images, err := processImages(ctx, post["images"], false)
	if err != nil {
		return nil, err
	}
	id := bson.NewObjectID()
	post["ownerUid"] = uid
	post["createdAt"] = time.Now()
	post["updatedAt"] = time.Now()
	post["id"] = id
	post["latest"] = true
	post["approved"] = false
	post["rejected"] = false
	post["sold"] = false
	post["paid"] = false
	post["images"] = images

	db, err := common.DB(ctx)
	if err != nil {
		return nil, err
	}
	if _, err := db.Collection("selling_items").InsertOne(ctx, post); err != nil {
		return nil, err
	}
	return bson.M{"id": id}, nil
}

// update modifies an owner's latest unapproved marketplace post.
func update(ctx context.Context, uid, postID string, body bson.M) (bson.M, error) {
	oid, err := common.ParseOID(postID)
	if err != nil {
		return nil, err
	}
	images, err := processImages(ctx, body["images"], true)
	if err != nil {
		return nil, err
	}
	db, err := common.DB(ctx)
	if err != nil {
		return nil, err
	}
	_, err = db.Collection("selling_items").UpdateOne(
		ctx,
		bson.M{"ownerUid": uid, "id": oid, "approved": false, "rejected": false, "latest": true},
		bson.M{"$set": bson.M{
			"name":         body["name"],
			"description":  body["description"],
			"price":        body["price"],
			"images":       images,
			"chosenImage":  body["chosenImage"],
			"currency":     body["currency"],
			"isNegotiable": body["isNegotiable"],
			"updatedAt":    time.Now(),
		}},
	)
	if err != nil {
		return nil, err
	}
	return bson.M{"id": body["id"]}, nil
}

// processImages promotes marketplace images from temp storage and creates derived variants.
func processImages(ctx context.Context, raw any, keepExisting bool) (bson.A, error) {
	images := common.StringSlice(raw)
	out := make(bson.A, 0, len(images))
	for _, image := range images {
		if keepExisting && common.FirstPathSegment(image) == "selling-images" {
			// Existing permanent keys are kept during edits so they are not copied again.
			out = append(out, image)
			continue
		}
		filename := common.Filename(image)
		if err := common.CopyFromTemp(ctx, filename, "selling-images"); err != nil {
			return nil, err
		}
		if err := common.CreateWatermarks(ctx, "selling-images/"+filename); err != nil {
			log.Printf("watermarking error: %v", err)
		}
		out = append(out, filename)
	}
	return out, nil
}

// report inserts a marketplace report document for moderation review.
func report(ctx context.Context, reporterUID, postID string, report bson.M) (bson.M, error) {
	report["reporterUid"] = reporterUID
	report["createdAt"] = time.Now()
	report["type"] = "report_selling_ad"
	report["resolved"] = false
	report["targetId"] = postID

	db, err := common.DB(ctx)
	if err != nil {
		return nil, err
	}
	res, err := db.Collection("reports").InsertOne(ctx, report)
	if err != nil {
		return nil, err
	}
	return bson.M{"id": res.InsertedID}, nil
}

// aggregateOne returns the first document from a selling_items aggregation pipeline.
func aggregateOne(ctx context.Context, pipeline mongo.Pipeline) (bson.M, error) {
	db, err := common.DB(ctx)
	if err != nil {
		return nil, err
	}
	cursor, err := db.Collection("selling_items").Aggregate(ctx, pipeline)
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
