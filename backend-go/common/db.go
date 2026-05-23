package common

import (
	"context"
	"errors"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var (
	dbMu     sync.Mutex
	dbClient *mongo.Client
	db       *mongo.Database
)

const (
	mockMongoURI     = "mongodb://localhost:27017"
	mockDatabaseName = "vinyl_test"
)

// DB returns the shared Mongo database connection for the Lambda process.
func DB(ctx context.Context) (*mongo.Database, error) {
	dbMu.Lock()
	defer dbMu.Unlock()

	if db != nil {
		return db, nil
	}

	cfg := LoadConfig()
	if cfg.MongoURI == "" {
		return nil, errors.New("MONGODB_ATLAS_CLUSTER_URI is not set")
	}
	if cfg.MongoDatabaseName == "" {
		return nil, errors.New("MONGODB_DATABASE_NAME is not set")
	}

	client, database, err := connectMongo(ctx, cfg.MongoURI, cfg.MongoDatabaseName)
	if err != nil {
		return nil, err
	}

	dbClient = client
	db = database
	return db, nil
}

// MockDB connects the shared DB handle to localhost MongoDB for integration tests.
func MockDB(ctx context.Context, dbName ...string) (*mongo.Database, error) {
	name := mockDatabaseName
	if len(dbName) > 0 && dbName[0] != "" {
		name = dbName[0]
	}

	client, database, err := connectMongo(ctx, mockMongoURI, name)
	if err != nil {
		return nil, err
	}

	dbMu.Lock()
	defer dbMu.Unlock()
	replaceDBLocked(client, database)
	return db, nil
}

// ResetDB disconnects the cached Mongo client and clears the shared DB handle.
func ResetDB(ctx context.Context) error {
	dbMu.Lock()
	defer dbMu.Unlock()

	var err error
	if dbClient != nil {
		err = dbClient.Disconnect(ctx)
	}
	dbClient = nil
	db = nil
	return err
}

// connectMongo creates and pings a Mongo database handle before it is cached.
func connectMongo(ctx context.Context, uri, dbName string) (*mongo.Client, *mongo.Database, error) {
	if uri == "" {
		return nil, nil, errors.New("mongo uri is not set")
	}
	if dbName == "" {
		return nil, nil, errors.New("mongo database name is not set")
	}

	client, err := mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		return nil, nil, err
	}

	// Ping before caching the client so later handlers do not reuse a dead connection.
	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	if err := client.Ping(pingCtx, nil); err != nil {
		_ = client.Disconnect(context.Background())
		return nil, nil, err
	}

	return client, client.Database(dbName), nil
}

// replaceDBLocked swaps the process DB handle, disconnecting any previous client.
func replaceDBLocked(client *mongo.Client, database *mongo.Database) {
	if dbClient != nil {
		_ = dbClient.Disconnect(context.Background())
	}
	dbClient = client
	db = database
}
