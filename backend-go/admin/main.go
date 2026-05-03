package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/D-Andreev/lambdamux"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	cognito "github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"vinyl-search/backend-go/common"
)

func main() {
	router := lambdamux.NewLambdaMux()
	router.GET("/admin/users", adminOnly(getUsers))
	router.GET("/admin/users/:userUid", adminOnly(getUserByUID))
	router.GET("/admin/admin-users", adminOnly(getAdminUsers))
	router.DELETE("/admin/admin-users/:userUid", adminOnly(removeAdmin))
	router.POST("/admin/admin-users/:email", adminOnly(addAdmin))
	router.GET("/admin/records", adminOnly(getRecords))
	router.DELETE("/admin/records/:recordId", adminOnly(removeRecord))
	router.GET("/admin/forum", adminOnly(getForumPosts))
	router.DELETE("/admin/forum/:postId", adminOnly(removeForumPost))
	router.GET("/admin/reports", adminOnly(getReports))
	router.POST("/admin/reports/:reportId", adminOnly(resolveReport))
	router.GET("/admin/market", adminOnly(getMarketPosts))
	router.POST("/admin/market", adminOnly(marketAction))
	router.GET("/admin/market/:postId", adminOnly(getMarketPost))
	router.POST("/admin/market/:postId", adminOnly(updateMarketPost))

	lambda.Start(func(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
		common.NormalizePath(&req)
		return router.Handle(ctx, req)
	})
}

func adminOnly(next func(context.Context, events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error)) func(context.Context, events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return func(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
		if !common.IsAdmin(req) {
			return common.JSON(http.StatusForbidden, "Not an Admin"), nil
		}
		return next(ctx, req)
	}
}

func getUsers(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	data, err := users(ctx, req.QueryStringParameters)
	if err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	return common.JSON(http.StatusOK, data), nil
}

func getUserByUID(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	data, err := userByUID(ctx, req.PathParameters["userUid"])
	if err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	return common.JSON(http.StatusOK, data), nil
}

func getAdminUsers(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	data, err := adminUsers(ctx)
	if err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"users": data, "success": true}), nil
}

func removeAdmin(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	ok, err := removeAdminUser(ctx, req.PathParameters["userUid"])
	if err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"success": ok}), nil
}

func addAdmin(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	ok, err := addAdminUser(ctx, req.PathParameters["email"])
	if err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"success": ok}), nil
}

func getRecords(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	data, err := allRecords(ctx, req.QueryStringParameters)
	if err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	data["success"] = true
	return common.JSON(http.StatusOK, data), nil
}

func removeRecord(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if err := deleteRecord(ctx, req.PathParameters["recordId"]); err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"success": true}), nil
}

func getForumPosts(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	data, err := allForumPosts(ctx, req.QueryStringParameters)
	if err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	data["success"] = true
	return common.JSON(http.StatusOK, data), nil
}

func removeForumPost(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if err := deleteForumPost(ctx, req.PathParameters["postId"]); err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"success": true}), nil
}

func getReports(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	data, err := reports(ctx, req.QueryStringParameters)
	if err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	data["success"] = true
	return common.JSON(http.StatusOK, data), nil
}

func resolveReport(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if err := resolveUserReport(ctx, req.PathParameters["reportId"]); err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"success": true}), nil
}

func getMarketPosts(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var (
		data bson.M
		err  error
	)
	switch req.QueryStringParameters["type"] {
	case "pending":
		data, err = marketPosts(ctx, req.QueryStringParameters, bson.M{"approved": false, "latest": true, "rejected": false, "sold": false})
	case "all":
		data, err = marketPosts(ctx, req.QueryStringParameters, bson.M{"latest": true})
	case "rejected-expired":
		data, err = marketPosts(ctx, req.QueryStringParameters, bson.M{"latest": true, "$or": bson.A{bson.M{"rejected": true}, bson.M{"updatedAt": bson.M{"$lt": time.Now().Add(-60 * 24 * time.Hour)}}}})
	case "approved":
		data, err = marketPosts(ctx, req.QueryStringParameters, bson.M{"latest": true, "$or": bson.A{bson.M{"approved": true}}})
	default:
		data = bson.M{}
	}
	if err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	data["success"] = true
	return common.JSON(http.StatusOK, data), nil
}

func marketAction(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	body, err := common.DecodeBody(req.Body)
	if err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	ok, err := marketPostAction(ctx, body)
	if err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"success": ok}), nil
}

func getMarketPost(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	data, err := marketPost(ctx, req.PathParameters["postId"])
	if err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	data["success"] = true
	return common.JSON(http.StatusOK, data), nil
}

func updateMarketPost(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	body, err := common.DecodeBody(req.Body)
	if err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	postID, err := updateMarket(ctx, common.UID(req), req.PathParameters["postId"], body)
	if err != nil {
		return common.Internal(map[string]any{"success": false}, err), nil
	}
	return common.JSON(http.StatusOK, map[string]any{"postId": postID, "success": true}), nil
}

func users(ctx context.Context, params map[string]string) (bson.M, error) {
	limit := common.IntQuery(params, "limit", 5)
	skip := common.IntQuery(params, "skip", 0)
	pipeline := mongo.Pipeline{
		{{Key: "$facet", Value: bson.M{
			"data": bson.A{bson.M{"$count": "total"}},
			"users": bson.A{
				bson.M{"$sort": bson.M{"_id": 1}},
				bson.M{"$skip": skip},
				bson.M{"$limit": limit},
				bson.M{"$project": bson.M{"name": 1, "email": 1, "picture": 1}},
			},
		}}},
		{{Key: "$addFields", Value: bson.M{"count": bson.M{"$arrayElemAt": bson.A{"$data.total", 0}}, "limit": limit, "skip": skip}}},
		{{Key: "$project", Value: bson.M{"data": 0}}},
	}
	return aggregateOne(ctx, "users", pipeline)
}

func userByUID(ctx context.Context, uid string) (bson.M, error) {
	oid, err := common.ParseOID(uid)
	if err != nil {
		return nil, err
	}
	db, err := common.DB(ctx)
	if err != nil {
		return nil, err
	}
	var user bson.M
	err = db.Collection("users").FindOne(ctx, bson.M{"_id": oid}).Decode(&user)
	return user, err
}

func adminUsers(ctx context.Context) ([]bson.M, error) {
	db, err := common.DB(ctx)
	if err != nil {
		return nil, err
	}
	cursor, err := db.Collection("users").Find(ctx, bson.M{"roles": "Admin"})
	if err != nil {
		return nil, err
	}
	var users []bson.M
	if err := cursor.All(ctx, &users); err != nil {
		return nil, err
	}
	for _, user := range users {
		user["uid"] = user["_id"]
		for key := range user {
			if key != "name" && key != "email" && key != "picture" && key != "uid" {
				delete(user, key)
			}
		}
	}
	return users, nil
}

func listUsersByEmail(ctx context.Context, email string) ([]cognitoTypesUser, error) {
	client, err := common.Cognito(ctx)
	if err != nil {
		return nil, err
	}
	out, err := client.ListUsers(ctx, &cognito.ListUsersInput{
		UserPoolId: aws.String(common.LoadConfig().CognitoUserPoolID),
		Filter:     aws.String(`email = "` + email + `"`),
	})
	if err != nil {
		return nil, err
	}
	users := make([]cognitoTypesUser, len(out.Users))
	for i, user := range out.Users {
		users[i] = cognitoTypesUser{Username: aws.ToString(user.Username)}
	}
	return users, nil
}

type cognitoTypesUser struct {
	Username string
}

func removeAdminUser(ctx context.Context, uid string) (bool, error) {
	db, err := common.DB(ctx)
	if err != nil {
		return false, err
	}
	oid, err := common.ParseOID(uid)
	if err != nil {
		return false, err
	}
	var dbUser bson.M
	if err := db.Collection("users").FindOne(ctx, bson.M{"_id": oid}).Decode(&dbUser); err != nil {
		return false, err
	}
	email := stringValue(dbUser["email"])
	cognitoUsers, err := listUsersByEmail(ctx, email)
	if err != nil {
		return false, err
	}
	if len(cognitoUsers) == 0 || email == "anuradhawick@gmail.com" {
		return false, nil
	}
	client, err := common.Cognito(ctx)
	if err != nil {
		return false, err
	}
	_, err = client.AdminRemoveUserFromGroup(ctx, &cognito.AdminRemoveUserFromGroupInput{
		GroupName:  aws.String("Admin"),
		UserPoolId: aws.String(common.LoadConfig().CognitoUserPoolID),
		Username:   aws.String(cognitoUsers[0].Username),
	})
	if err != nil {
		return false, err
	}
	_, err = db.Collection("users").UpdateOne(ctx, bson.M{"_id": oid, "roles": "Admin"}, bson.M{"$pull": bson.M{"roles": "Admin"}})
	return err == nil, err
}

func addAdminUser(ctx context.Context, email string) (bool, error) {
	cognitoUsers, err := listUsersByEmail(ctx, email)
	if err != nil {
		return false, err
	}
	if len(cognitoUsers) == 0 {
		return false, nil
	}
	client, err := common.Cognito(ctx)
	if err != nil {
		return false, err
	}
	_, err = client.AdminAddUserToGroup(ctx, &cognito.AdminAddUserToGroupInput{
		GroupName:  aws.String("Admin"),
		UserPoolId: aws.String(common.LoadConfig().CognitoUserPoolID),
		Username:   aws.String(cognitoUsers[0].Username),
	})
	if err != nil {
		return false, err
	}
	db, err := common.DB(ctx)
	if err != nil {
		return false, err
	}
	_, err = db.Collection("users").UpdateOne(ctx, bson.M{"email": email}, bson.M{"$addToSet": bson.M{"roles": "Admin"}})
	return err == nil, err
}

func allRecords(ctx context.Context, params map[string]string) (bson.M, error) {
	limit := common.IntQuery(params, "limit", 30)
	skip := common.IntQuery(params, "skip", 0)
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"latest": true}}},
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

func deleteRecord(ctx context.Context, recordID string) error {
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
		images = append(images, common.StringSlice(record["images"])...)
	}
	for _, image := range common.UniqueStrings(images) {
		if common.PreviousPathSegment(image) == "records-images" {
			_ = common.DeleteObject(ctx, "records-images/"+common.Filename(image))
		}
	}
	_, err = db.Collection("records").DeleteMany(ctx, bson.M{"id": oid})
	return err
}

func allForumPosts(ctx context.Context, params map[string]string) (bson.M, error) {
	limit := common.IntQuery(params, "limit", 5)
	skip := common.IntQuery(params, "skip", 0)
	return aggregateOne(ctx, "forum_posts", userPostsPipeline(bson.M{}, skip, limit, bson.M{"postTitle": 1, "createdAt": 1, "id": 1}))
}

func deleteForumPost(ctx context.Context, postID string) error {
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
	return db.Collection("forum_posts").FindOneAndDelete(ctx, bson.M{"_id": oid}).Err()
}

func reports(ctx context.Context, params map[string]string) (bson.M, error) {
	limit := common.IntQuery(params, "limit", 5)
	skip := common.IntQuery(params, "skip", 0)
	pipeline := mongo.Pipeline{
		{{Key: "$facet", Value: bson.M{
			"data": bson.A{bson.M{"$count": "total"}},
			"reports": bson.A{
				bson.M{"$match": bson.M{"resolved": false}},
				bson.M{"$sort": bson.M{"createdAt": -1}},
				bson.M{"$skip": skip},
				bson.M{"$limit": limit},
				bson.M{"$addFields": bson.M{"id": "$_id"}},
				bson.M{"$project": bson.M{"description": 1, "type": 1, "targetId": 1, "createdAt": 1, "id": 1}},
			},
		}}},
		{{Key: "$addFields", Value: bson.M{"count": bson.M{"$arrayElemAt": bson.A{"$data", 0}}}}},
		{{Key: "$addFields", Value: bson.M{"count": "$count.total", "limit": limit, "skip": skip}}},
		{{Key: "$project", Value: bson.M{"data": 0}}},
	}
	return aggregateOne(ctx, "reports", pipeline)
}

func resolveUserReport(ctx context.Context, reportID string) error {
	oid, err := common.ParseOID(reportID)
	if err != nil {
		return err
	}
	db, err := common.DB(ctx)
	if err != nil {
		return err
	}
	return db.Collection("reports").FindOneAndUpdate(ctx, bson.M{"_id": oid}, bson.M{"$set": bson.M{"resolved": true}}).Err()
}

func marketPosts(ctx context.Context, params map[string]string, match bson.M) (bson.M, error) {
	limit := common.IntQuery(params, "limit", 5)
	skip := common.IntQuery(params, "skip", 0)
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: match}},
		{{Key: "$facet", Value: bson.M{
			"data": bson.A{bson.M{"$count": "total"}},
			"posts": bson.A{
				bson.M{"$sort": bson.M{"createdAt": -1}},
				bson.M{"$skip": skip},
				bson.M{"$limit": limit},
				bson.M{"$project": bson.M{"name": 1, "createdAt": 1, "chosenImage": 1, "images": 1, "id": 1}},
			},
		}}},
		{{Key: "$addFields", Value: bson.M{"count": bson.M{"$arrayElemAt": bson.A{"$data", 0}}}}},
		{{Key: "$addFields", Value: bson.M{"count": "$count.total", "limit": limit, "skip": skip}}},
		{{Key: "$project", Value: bson.M{"data": 0}}},
	}
	data, err := aggregateOne(ctx, "selling_items", pipeline)
	if err != nil {
		return nil, err
	}
	common.RewriteImageList(data, "posts", "selling-images", "thumbnails")
	return data, nil
}

func marketPostAction(ctx context.Context, body bson.M) (bool, error) {
	id, err := common.OIDFromAny(body["id"])
	if err != nil {
		return false, err
	}
	var update bson.M
	switch stringValue(body["type"]) {
	case "approve":
		update = bson.M{"$set": bson.M{"approved": true, "paid": true}}
	case "reject":
		update = bson.M{"$set": bson.M{"rejected": true}}
	default:
		return false, nil
	}
	db, err := common.DB(ctx)
	if err != nil {
		return false, err
	}
	_, err = db.Collection("selling_items").UpdateOne(ctx, bson.M{"id": id}, update)
	return err == nil, err
}

func marketPost(ctx context.Context, postID string) (bson.M, error) {
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

func updateMarket(ctx context.Context, reviserUID, postID string, post bson.M) (any, error) {
	oid, err := common.ParseOID(postID)
	if err != nil {
		return nil, err
	}
	id, err := common.OIDFromAny(post["id"])
	if err != nil {
		return nil, err
	}
	images, err := processSellingImages(ctx, post["images"])
	if err != nil {
		return nil, err
	}
	delete(post, "_id")
	db, err := common.DB(ctx)
	if err != nil {
		return nil, err
	}
	if _, err := db.Collection("selling_items").UpdateMany(ctx, bson.M{"id": oid}, bson.M{"$set": bson.M{"latest": false}}); err != nil {
		return nil, err
	}
	post["reviserUid"] = reviserUID
	post["createdAt"] = time.Now()
	post["updatedAt"] = time.Now()
	post["id"] = id
	post["latest"] = true
	post["images"] = images
	if _, err := db.Collection("selling_items").InsertOne(ctx, post); err != nil {
		return nil, err
	}
	return id, nil
}

func processSellingImages(ctx context.Context, raw any) (bson.A, error) {
	images := common.StringSlice(raw)
	out := make(bson.A, 0, len(images))
	for _, image := range images {
		if common.FirstPathSegment(image) == "selling-images" {
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

func stringValue(value any) string {
	if s, ok := value.(string); ok {
		return s
	}
	return ""
}
