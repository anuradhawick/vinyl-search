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

	client, err := mongo.Connect(options.Client().ApplyURI(cfg.MongoURI))
	if err != nil {
		return nil, err
	}

	// Ping before caching the client so later handlers do not reuse a dead connection.
	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	if err := client.Ping(pingCtx, nil); err != nil {
		_ = client.Disconnect(context.Background())
		return nil, err
	}

	dbClient = client
	db = client.Database("vinyl")
	return db, nil
}
