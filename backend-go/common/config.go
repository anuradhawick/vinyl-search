package common

import "os"

// Config mirrors the Lambda environment variables used by the original Node services.
type Config struct {
	MongoURI          string
	BucketName        string
	BucketRegion      string
	CDNDomain         string
	CognitoUserPoolID string
}

func LoadConfig() Config {
	return Config{
		MongoURI:          os.Getenv("MONGODB_ATLAS_CLUSTER_URI"),
		BucketName:        os.Getenv("BUCKET_NAME"),
		BucketRegion:      os.Getenv("BUCKET_REGION"),
		CDNDomain:         os.Getenv("CDN_DOMAIN"),
		CognitoUserPoolID: firstNonEmpty(os.Getenv("COGNITO_USER_POOL_ID"), os.Getenv("user_pool_id")),
	}
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return ""
}
