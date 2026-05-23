package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/D-Andreev/lambdamux"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"vinyl-search/backend-go/common"
)

var router *lambdamux.LambdaMux

func init() {
	router = newRouter()
}

// main registers record routes and starts the Lambda router.
func main() {
	lambda.Start(handler)
}

// handler dispatches requests through the records router.
func handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	common.LogEventPayload(req)
	return router.Handle(ctx, req)
}

// newRouter registers record routes.
func newRouter() *lambdamux.LambdaMux {
	router := lambdamux.NewLambdaMux()
	// Register the collection route before longer prefix routes; lambdamux drops
	// the exact handler if a shorter path is added after a longer matching path.
	router.GET("/records", common.LogEndpoint("GET", "/records", fetchRecords))
	router.GET("/records/search", common.LogEndpoint("GET", "/records/search", searchRecords))
	router.GET("/records/:recordId", common.LogEndpoint("GET", "/records/:recordId", common.AuthRequired(fetchRecord)))
	router.POST("/records", common.LogEndpoint("POST", "/records", common.AuthRequired(newRecord)))
	router.POST("/records/:recordId", common.LogEndpoint("POST", "/records/:recordId", common.AuthRequired(updateRecord)))
	router.GET("/records/:recordId/revisions", common.LogEndpoint("GET", "/records/:recordId/revisions", common.AuthRequired(fetchHistory)))
	router.GET("/records/:recordId/revisions/:revisionId", common.LogEndpoint("GET", "/records/:recordId/revisions/:revisionId", common.AuthRequired(fetchRevision)))

	return router
}

// searchRecords returns records matching text and facet query parameters.
func searchRecords(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	data, err := search(ctx, req.QueryStringParameters)
	if err != nil {
		return common.Internal(map[string]any{"records": "ERROR", "success": false}, err), nil
	}
	return common.JSON(http.StatusOK, withSuccess(data)), nil
}

// fetchRecords returns the newest latest-version records.
func fetchRecords(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	data, err := list(ctx, req.QueryStringParameters)
	if err != nil {
		return common.Internal(map[string]any{"records": "ERROR", "success": false}, err), nil
	}
	return common.JSON(http.StatusOK, withSuccess(data)), nil
}

// fetchRecord returns one latest-version record by id.
func fetchRecord(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	record, err := getRecord(ctx, req.PathParameters["recordId"])
	if err != nil {
		return common.Internal(map[string]any{"record": nil, "success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"record": record, "success": true}), nil
}

// newRecord creates a new catalog record for the authenticated user.
func newRecord(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	body, err := common.DecodeBody(req.Body)
	if err != nil {
		return common.Internal(map[string]any{"recordId": nil, "success": false}, err), nil
	}
	result, err := create(ctx, common.UID(req), body)
	if err != nil {
		return common.Internal(map[string]any{"recordId": nil, "success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"recordId": result, "success": true}), nil
}

// updateRecord creates a new latest revision for an existing catalog record.
func updateRecord(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	body, err := common.DecodeBody(req.Body)
	if err != nil {
		return common.Internal(map[string]any{"recordId": nil, "success": false}, err), nil
	}
	recordID, err := update(ctx, common.UID(req), req.PathParameters["recordId"], body)
	if err != nil {
		return common.Internal(map[string]any{"recordId": nil, "success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"recordId": recordID, "success": true}), nil
}

// fetchHistory returns revision metadata for a record.
func fetchHistory(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	history, err := history(ctx, req.PathParameters["recordId"])
	if err != nil {
		return common.Internal(map[string]any{"history": nil, "success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"history": history, "success": true}), nil
}

// fetchRevision returns one historical record revision.
func fetchRevision(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	record, err := revision(ctx, req.PathParameters["revisionId"])
	if err != nil {
		return common.Internal(map[string]any{"record": nil, "success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"record": record, "success": true}), nil
}

// search returns filtered latest-version records with pagination metadata.
func search(ctx context.Context, params map[string]string) (bson.M, error) {
	genres := common.StringArrayQuery(params, "genres")
	styles := common.StringArrayQuery(params, "styles")
	formats := common.StringArrayQuery(params, "formats")
	countries := common.StringArrayQuery(params, "countries")
	limit := common.IntQuery(params, "limit", 30)
	skip := common.IntQuery(params, "skip", 0)
	query := common.StringQuery(params, "query", "")

	match := bson.M{"latest": true}
	if query != "" {
		match["$text"] = bson.M{"$search": query}
	}
	if len(genres) > 0 {
		match["genres"] = bson.M{"$all": common.StringArray(genres)}
	}
	if len(styles) > 0 {
		match["styles"] = bson.M{"$all": common.StringArray(styles)}
	}
	if len(formats) > 0 {
		match["format"] = bson.M{"$in": common.StringArray(formats)}
	}
	if len(countries) > 0 {
		match["country"] = bson.M{"$in": common.StringArray(countries)}
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
	pipeline = append(pipeline, recordsFacet(skip, limit)...)

	result, err := aggregateOne(ctx, "records", pipeline)
	if err != nil {
		return nil, err
	}
	common.RewriteImageList(result, "records", "records-images", "thumbnails")
	return result, nil
}

// list returns latest-version records sorted by newest first.
func list(ctx context.Context, params map[string]string) (bson.M, error) {
	limit := common.IntQuery(params, "limit", 30)
	skip := common.IntQuery(params, "skip", 0)
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"latest": true}}},
		{{Key: "$sort", Value: bson.M{"createdAt": -1}}},
	}
	pipeline = append(pipeline, recordsFacet(skip, limit)...)
	result, err := aggregateOne(ctx, "records", pipeline)
	if err != nil {
		return nil, err
	}
	common.RewriteImageList(result, "records", "records-images", "thumbnails")
	return result, nil
}

// recordsFacet builds the record pagination facet used by search and list.
func recordsFacet(skip, limit int64) mongo.Pipeline {
	return mongo.Pipeline{
		{{Key: "$facet", Value: bson.M{
			"data": bson.A{bson.M{"$count": "total"}},
			"records": bson.A{
				bson.M{"$skip": skip},
				bson.M{"$limit": limit},
				bson.M{"$project": bson.M{
					"name":        1,
					"label":       1,
					"genres":      1,
					"chosenImage": 1,
					"images":      1,
					"id":          1,
					"score":       1,
				}},
			},
		}}},
		{{Key: "$addFields", Value: bson.M{"count": bson.M{"$arrayElemAt": bson.A{"$data", 0}}}}},
		{{Key: "$addFields", Value: bson.M{"count": "$count.total", "limit": limit, "skip": skip}}},
		{{Key: "$project", Value: bson.M{"data": 0}}},
	}
}

// getRecord fetches one latest-version record and rewrites image URLs for display.
func getRecord(ctx context.Context, recordID string) (bson.M, error) {
	oid, err := common.ParseOID(recordID)
	if err != nil {
		return nil, err
	}
	db, err := common.DB(ctx)
	if err != nil {
		return nil, err
	}
	var data bson.M
	if err := db.Collection("records").FindOne(ctx, bson.M{"id": oid, "latest": true}).Decode(&data); err != nil {
		return nil, err
	}
	common.RewriteImages(data, "records-images", "watermarked")
	return data, nil
}

// revision fetches one record revision with limited reviser profile data.
func revision(ctx context.Context, revisionID string) (bson.M, error) {
	oid, err := common.ParseOID(revisionID)
	if err != nil {
		return nil, err
	}
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"_id": oid}}},
		{{Key: "$lookup", Value: bson.M{"from": "users", "localField": "reviserUid", "foreignField": "uid", "as": "reviser"}}},
		{{Key: "$addFields", Value: bson.M{"reviser": bson.M{"$arrayElemAt": bson.A{"$reviser", 0}}}}},
		// Remove private user fields before returning revision metadata to clients.
		{{Key: "$project", Value: bson.M{"reviser._id": 0, "reviser.authProviders": 0, "reviser.email": 0, "reviser.updatedAt": 0}}},
	}
	data, err := aggregateOne(ctx, "records", pipeline)
	if err != nil {
		return nil, err
	}
	common.RewriteImages(data, "records-images", "watermarked")
	return data, nil
}

// history returns lightweight revision entries for all versions of a record.
func history(ctx context.Context, recordID string) ([]bson.M, error) {
	oid, err := common.ParseOID(recordID)
	if err != nil {
		return nil, err
	}
	db, err := common.DB(ctx)
	if err != nil {
		return nil, err
	}
	cursor, err := db.Collection("records").Find(ctx, bson.M{"id": oid})
	if err != nil {
		return nil, err
	}
	var data []bson.M
	if err := cursor.All(ctx, &data); err != nil {
		return nil, err
	}
	// Match the original projection and sort after decoding to keep the query simple.
	for _, doc := range data {
		for key := range doc {
			if key != "_id" && key != "createdAt" && key != "ownerUid" && key != "reviserUid" {
				delete(doc, key)
			}
		}
	}
	sortByCreatedDesc(data)
	return data, nil
}

// create inserts a new latest-version catalog record after checking catalog number uniqueness.
func create(ctx context.Context, uid string, record bson.M) (bson.M, error) {
	ownerUID, err := common.ParseOID(uid)
	if err != nil {
		return nil, err
	}
	db, err := common.DB(ctx)
	if err != nil {
		return nil, err
	}

	// The original API reports duplicates by returning the existing logical record id.
	catalogNo := strings.TrimSpace(stringValue(record["catalogNo"]))
	var existing bson.M
	err = db.Collection("records").FindOne(ctx, bson.M{"catalogNo": catalogNo}).Decode(&existing)
	if err == nil {
		return bson.M{"recordId": false, "originalId": existing["id"]}, nil
	}
	if !errors.Is(err, mongo.ErrNoDocuments) {
		return nil, err
	}

	images, err := processImages(ctx, record["images"], false)
	if err != nil {
		return nil, err
	}
	id := bson.NewObjectID()
	record["ownerUid"] = ownerUID
	record["createdAt"] = time.Now()
	record["id"] = id
	record["latest"] = true
	record["images"] = images

	if _, err := db.Collection("records").InsertOne(ctx, record); err != nil {
		return nil, err
	}
	return bson.M{"recordId": id}, nil
}

// update marks old record versions as stale and inserts the supplied record as the latest revision.
func update(ctx context.Context, reviserUID, recordID string, record bson.M) (any, error) {
	reviser, err := common.ParseOID(reviserUID)
	if err != nil {
		return nil, err
	}
	oid, err := common.ParseOID(recordID)
	if err != nil {
		return nil, err
	}
	id, err := common.OIDFromAny(record["id"])
	if err != nil {
		return nil, err
	}
	images, err := processImages(ctx, record["images"], true)
	if err != nil {
		return nil, err
	}
	delete(record, "_id")

	db, err := common.DB(ctx)
	if err != nil {
		return nil, err
	}
	// Store revisions as append-only documents while preserving the logical record id.
	if _, err := db.Collection("records").UpdateMany(ctx, bson.M{"id": oid}, bson.M{"$set": bson.M{"latest": false}}); err != nil {
		return nil, err
	}
	record["reviserUid"] = reviser
	record["createdAt"] = time.Now()
	record["id"] = id
	record["latest"] = true
	record["images"] = images
	if _, err := db.Collection("records").InsertOne(ctx, record); err != nil {
		return nil, err
	}
	return id, nil
}

// processImages promotes record images from temp storage and creates derived variants.
func processImages(ctx context.Context, raw any, keepExisting bool) (bson.A, error) {
	images := common.StringSlice(raw)
	out := make(bson.A, 0, len(images))
	for _, image := range images {
		if keepExisting && common.FirstPathSegment(image) == "records-images" {
			// Existing permanent keys are kept during edits so they are not copied again.
			out = append(out, image)
			continue
		}
		filename := common.Filename(image)
		if err := common.CopyFromTemp(ctx, filename, "records-images"); err != nil {
			return nil, err
		}
		if err := common.CreateWatermarks(ctx, "records-images/"+filename); err != nil {
			return nil, err
		}
		out = append(out, filename)
	}
	return out, nil
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

// withSuccess annotates a response document with a success flag.
func withSuccess(doc bson.M) bson.M {
	doc["success"] = true
	return doc
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

// sortByCreatedDesc sorts decoded history documents by createdAt descending.
func sortByCreatedDesc(data []bson.M) {
	for i := 0; i < len(data); i++ {
		for j := i + 1; j < len(data); j++ {
			if createdMillis(data[j]["createdAt"]) > createdMillis(data[i]["createdAt"]) {
				data[i], data[j] = data[j], data[i]
			}
		}
	}
}

// createdMillis converts supported createdAt values into milliseconds for sorting.
func createdMillis(value any) int64 {
	switch typed := value.(type) {
	case bson.DateTime:
		return int64(typed)
	case time.Time:
		return typed.UnixMilli()
	default:
		log.Printf("unknown createdAt type %T", value)
		return 0
	}
}
