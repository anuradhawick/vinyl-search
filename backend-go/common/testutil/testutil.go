package testutil

import (
	"bytes"
	"context"
	"encoding/json"
	"image"
	"image/color"
	"image/jpeg"
	"image/png"
	"io"
	"net/http"
	"os"
	"testing"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/aws"
	cognito "github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"vinyl-search/backend-go/common"
)

// Mongo connects common.DB to an isolated localhost Mongo database for a test.
func Mongo(t *testing.T, name string) *mongo.Database {
	t.Helper()

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	db, err := common.MockDB(ctx, name)
	if err != nil {
		t.Skipf("skipping localhost MongoDB endpoint test: %v", err)
	}
	if err := db.Drop(ctx); err != nil {
		t.Fatalf("drop test database: %v", err)
	}

	t.Cleanup(func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = db.Drop(ctx)
		_ = common.ResetDB(ctx)
	})
	return db
}

// Insert inserts one or more documents into a Mongo collection.
func Insert(t *testing.T, db *mongo.Database, collection string, docs ...any) {
	t.Helper()
	if len(docs) == 0 {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if len(docs) == 1 {
		if _, err := db.Collection(collection).InsertOne(ctx, docs[0]); err != nil {
			t.Fatalf("insert %s: %v", collection, err)
		}
		return
	}
	if _, err := db.Collection(collection).InsertMany(ctx, docs); err != nil {
		t.Fatalf("insert many %s: %v", collection, err)
	}
}

// Count returns the number of matching documents in a collection.
func Count(t *testing.T, db *mongo.Database, collection string, filter any) int64 {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	count, err := db.Collection(collection).CountDocuments(ctx, filter)
	if err != nil {
		t.Fatalf("count %s: %v", collection, err)
	}
	return count
}

// TextIndex creates a Mongo text index across the supplied fields.
func TextIndex(t *testing.T, db *mongo.Database, collection string, fields ...string) {
	t.Helper()
	keys := bson.D{}
	for _, field := range fields {
		keys = append(keys, bson.E{Key: field, Value: "text"})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if _, err := db.Collection(collection).Indexes().CreateOne(ctx, mongo.IndexModel{Keys: keys}); err != nil {
		t.Fatalf("create text index on %s: %v", collection, err)
	}
}

// AscIndex creates a simple ascending index.
func AscIndex(t *testing.T, db *mongo.Database, collection string, fields ...string) {
	t.Helper()
	keys := bson.D{}
	for _, field := range fields {
		keys = append(keys, bson.E{Key: field, Value: 1})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if _, err := db.Collection(collection).Indexes().CreateOne(ctx, mongo.IndexModel{Keys: keys, Options: options.Index()}); err != nil {
		t.Fatalf("create index on %s: %v", collection, err)
	}
}

// Request builds an API Gateway request with optional JSON body and Cognito claims.
func Request(method, path string, query map[string]string, body any, uid string, admin bool) events.APIGatewayProxyRequest {
	reqBody := ""
	switch value := body.(type) {
	case nil:
	case string:
		reqBody = value
	default:
		data, err := json.Marshal(value)
		if err != nil {
			panic(err)
		}
		reqBody = string(data)
	}

	claims := map[string]any{}
	if uid != "" {
		claims["custom:uid"] = uid
	}
	if admin {
		claims["cognito:groups"] = "Admin"
	}
	return events.APIGatewayProxyRequest{
		HTTPMethod:            method,
		Path:                  path,
		QueryStringParameters: query,
		Body:                  reqBody,
		RequestContext: events.APIGatewayProxyRequestContext{
			Authorizer: map[string]any{"claims": claims},
		},
	}
}

// BodyMap decodes an API Gateway JSON response body into a map.
func BodyMap(t *testing.T, resp events.APIGatewayProxyResponse) map[string]any {
	t.Helper()
	var out map[string]any
	if err := json.Unmarshal([]byte(resp.Body), &out); err != nil {
		t.Fatalf("decode response %q: %v", resp.Body, err)
	}
	return out
}

// AssertOKSuccess verifies a standard successful JSON endpoint response.
func AssertOKSuccess(t *testing.T, resp events.APIGatewayProxyResponse) map[string]any {
	t.Helper()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("status = %d body = %s", resp.StatusCode, resp.Body)
	}
	body := BodyMap(t, resp)
	if body["success"] != true {
		t.Fatalf("success = %#v body = %#v", body["success"], body)
	}
	return body
}

// Call invokes a router-level Lambda handler and asserts it returned no Go error.
func Call(t *testing.T, handler func(context.Context, events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error), req events.APIGatewayProxyRequest) events.APIGatewayProxyResponse {
	t.Helper()
	resp, err := handler(context.Background(), req)
	if err != nil {
		t.Fatalf("handler error: %v", err)
	}
	return resp
}

// MockS3 implements common.S3API and records S3 calls made by tests.
type MockS3 struct {
	Copies        []S3ObjectCall
	Deletes       []S3ObjectCall
	Gets          []S3ObjectCall
	Puts          []S3PutCall
	GetObjectBody []byte
	Err           error
}

// S3ObjectCall records a bucket/key style S3 request.
type S3ObjectCall struct {
	Bucket     string
	Key        string
	CopySource string
}

// S3PutCall records an S3 PutObject request body.
type S3PutCall struct {
	Bucket string
	Key    string
	Body   []byte
}

// NewMockS3 returns a mock S3 client with image data suitable for watermarking.
func NewMockS3(t *testing.T) *MockS3 {
	t.Helper()
	t.Setenv("WATERMARK_PATH", writeWatermark(t))
	return &MockS3{GetObjectBody: smallJPEG(t)}
}

func (m *MockS3) CopyObject(ctx context.Context, input *s3.CopyObjectInput, optFns ...func(*s3.Options)) (*s3.CopyObjectOutput, error) {
	m.Copies = append(m.Copies, S3ObjectCall{
		Bucket:     aws.ToString(input.Bucket),
		Key:        aws.ToString(input.Key),
		CopySource: aws.ToString(input.CopySource),
	})
	return &s3.CopyObjectOutput{}, m.Err
}

func (m *MockS3) DeleteObject(ctx context.Context, input *s3.DeleteObjectInput, optFns ...func(*s3.Options)) (*s3.DeleteObjectOutput, error) {
	m.Deletes = append(m.Deletes, S3ObjectCall{
		Bucket: aws.ToString(input.Bucket),
		Key:    aws.ToString(input.Key),
	})
	return &s3.DeleteObjectOutput{}, m.Err
}

func (m *MockS3) GetObject(ctx context.Context, input *s3.GetObjectInput, optFns ...func(*s3.Options)) (*s3.GetObjectOutput, error) {
	m.Gets = append(m.Gets, S3ObjectCall{
		Bucket: aws.ToString(input.Bucket),
		Key:    aws.ToString(input.Key),
	})
	return &s3.GetObjectOutput{Body: io.NopCloser(bytes.NewReader(m.GetObjectBody))}, m.Err
}

func (m *MockS3) PutObject(ctx context.Context, input *s3.PutObjectInput, optFns ...func(*s3.Options)) (*s3.PutObjectOutput, error) {
	var body []byte
	if input.Body != nil {
		body, _ = io.ReadAll(input.Body)
	}
	m.Puts = append(m.Puts, S3PutCall{
		Bucket: aws.ToString(input.Bucket),
		Key:    aws.ToString(input.Key),
		Body:   body,
	})
	return &s3.PutObjectOutput{}, m.Err
}

// MockCognito implements common.CognitoAPI with function hooks and call recording.
type MockCognito struct {
	ListUsersFunc                func(context.Context, *cognito.ListUsersInput) (*cognito.ListUsersOutput, error)
	AdminAddUserToGroupFunc      func(context.Context, *cognito.AdminAddUserToGroupInput) (*cognito.AdminAddUserToGroupOutput, error)
	AdminLinkProviderForUserFunc func(context.Context, *cognito.AdminLinkProviderForUserInput) (*cognito.AdminLinkProviderForUserOutput, error)
	AdminRemoveUserFromGroupFunc func(context.Context, *cognito.AdminRemoveUserFromGroupInput) (*cognito.AdminRemoveUserFromGroupOutput, error)
	AdminUpdateAttributesFunc    func(context.Context, *cognito.AdminUpdateUserAttributesInput) (*cognito.AdminUpdateUserAttributesOutput, error)

	ListUsersCalls              []cognito.ListUsersInput
	AddUserToGroupCalls         []cognito.AdminAddUserToGroupInput
	LinkProviderForUserCalls    []cognito.AdminLinkProviderForUserInput
	RemoveUserFromGroupCalls    []cognito.AdminRemoveUserFromGroupInput
	UpdateUserAttributesCalls   []cognito.AdminUpdateUserAttributesInput
	DefaultUsers                []types.UserType
	DefaultListUsersReturnError error
}

func (m *MockCognito) ListUsers(ctx context.Context, input *cognito.ListUsersInput, optFns ...func(*cognito.Options)) (*cognito.ListUsersOutput, error) {
	m.ListUsersCalls = append(m.ListUsersCalls, *input)
	if m.ListUsersFunc != nil {
		return m.ListUsersFunc(ctx, input)
	}
	return &cognito.ListUsersOutput{Users: m.DefaultUsers}, m.DefaultListUsersReturnError
}

func (m *MockCognito) AdminAddUserToGroup(ctx context.Context, input *cognito.AdminAddUserToGroupInput, optFns ...func(*cognito.Options)) (*cognito.AdminAddUserToGroupOutput, error) {
	m.AddUserToGroupCalls = append(m.AddUserToGroupCalls, *input)
	if m.AdminAddUserToGroupFunc != nil {
		return m.AdminAddUserToGroupFunc(ctx, input)
	}
	return &cognito.AdminAddUserToGroupOutput{}, nil
}

func (m *MockCognito) AdminLinkProviderForUser(ctx context.Context, input *cognito.AdminLinkProviderForUserInput, optFns ...func(*cognito.Options)) (*cognito.AdminLinkProviderForUserOutput, error) {
	m.LinkProviderForUserCalls = append(m.LinkProviderForUserCalls, *input)
	if m.AdminLinkProviderForUserFunc != nil {
		return m.AdminLinkProviderForUserFunc(ctx, input)
	}
	return &cognito.AdminLinkProviderForUserOutput{}, nil
}

func (m *MockCognito) AdminRemoveUserFromGroup(ctx context.Context, input *cognito.AdminRemoveUserFromGroupInput, optFns ...func(*cognito.Options)) (*cognito.AdminRemoveUserFromGroupOutput, error) {
	m.RemoveUserFromGroupCalls = append(m.RemoveUserFromGroupCalls, *input)
	if m.AdminRemoveUserFromGroupFunc != nil {
		return m.AdminRemoveUserFromGroupFunc(ctx, input)
	}
	return &cognito.AdminRemoveUserFromGroupOutput{}, nil
}

func (m *MockCognito) AdminUpdateUserAttributes(ctx context.Context, input *cognito.AdminUpdateUserAttributesInput, optFns ...func(*cognito.Options)) (*cognito.AdminUpdateUserAttributesOutput, error) {
	m.UpdateUserAttributesCalls = append(m.UpdateUserAttributesCalls, *input)
	if m.AdminUpdateAttributesFunc != nil {
		return m.AdminUpdateAttributesFunc(ctx, input)
	}
	return &cognito.AdminUpdateUserAttributesOutput{}, nil
}

// InstallAWSMocks installs fresh S3 and Cognito mocks into common.
func InstallAWSMocks(t *testing.T) (*MockS3, *MockCognito) {
	t.Helper()
	common.ResetAWS()
	s3Mock := NewMockS3(t)
	cognitoMock := &MockCognito{}
	common.MockS3(s3Mock)
	common.MockCognito(cognitoMock)
	t.Setenv("BUCKET_NAME", "bucket.test")
	t.Setenv("BUCKET_REGION", "us-east-1")
	t.Setenv("CDN_DOMAIN", "cdn.example.test")
	t.Setenv("COGNITO_USER_POOL_ID", "pool-test")
	t.Cleanup(common.ResetAWS)
	return s3Mock, cognitoMock
}

func writeWatermark(t *testing.T) string {
	t.Helper()
	var buf bytes.Buffer
	img := image.NewRGBA(image.Rect(0, 0, 2, 2))
	for y := 0; y < 2; y++ {
		for x := 0; x < 2; x++ {
			img.Set(x, y, color.RGBA{R: 255, A: 255})
		}
	}
	if err := png.Encode(&buf, img); err != nil {
		t.Fatalf("encode watermark: %v", err)
	}
	path := t.TempDir() + "/wm.png"
	if err := writeFile(path, buf.Bytes()); err != nil {
		t.Fatalf("write watermark: %v", err)
	}
	return path
}

func smallJPEG(t *testing.T) []byte {
	t.Helper()
	var buf bytes.Buffer
	img := image.NewRGBA(image.Rect(0, 0, 4, 4))
	for y := 0; y < 4; y++ {
		for x := 0; x < 4; x++ {
			img.Set(x, y, color.RGBA{G: 200, B: 100, A: 255})
		}
	}
	if err := jpeg.Encode(&buf, img, &jpeg.Options{Quality: 80}); err != nil {
		t.Fatalf("encode jpeg: %v", err)
	}
	return buf.Bytes()
}

func writeFile(path string, data []byte) error {
	return os.WriteFile(path, data, 0o600)
}
