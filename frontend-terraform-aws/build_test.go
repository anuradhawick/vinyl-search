package main

import (
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestWriteEnvironmentFilesWritesProdEnvironmentFile(t *testing.T) {
	webappDir := filepath.Join("testdata", "placeholder-webapp")
	args := placeholderBuildArgs()

	if err := os.RemoveAll(webappDir); err != nil {
		t.Fatalf("os.RemoveAll(%q) error = %v", webappDir, err)
	}

	if err := writeEnvironmentFiles(webappDir, args, io.Discard); err != nil {
		t.Fatalf("writeEnvironmentFiles() error = %v", err)
	}

	envDir := filepath.Join(webappDir, "src", "environments")
	environmentPath := filepath.Join(envDir, "environment.ts")
	productionPath := filepath.Join(envDir, "environment.prod.ts")
	developmentPath := filepath.Join(envDir, "environment.development.ts")

	environmentContents := readFile(t, environmentPath)

	if _, err := os.Stat(developmentPath); !os.IsNotExist(err) {
		t.Fatalf("environment.development.ts should not be written for prod workspace, stat error = %v", err)
	}

	if _, err := os.Stat(productionPath); !os.IsNotExist(err) {
		t.Fatalf("environment.prod.ts should not be written for prod workspace, stat error = %v", err)
	}

	expectedSnippets := []string{
		"production: true",
		`identityPoolId: "placeholder-identity-pool-id"`,
		`region: "ap-southeast-1"`,
		`userPoolId: "placeholder-user-pool-id"`,
		`userPoolClientId: "placeholder-user-pool-client-id"`,
		`domain: "placeholder.auth.ap-southeast-1.amazoncognito.com"`,
		`bucket: "placeholder-storage-bucket"`,
		`"placeholder-api": {`,
		`endpoint: "https://api.placeholder.test/"`,
		`redirectSignIn: ["https://app.placeholder.test/","http://localhost:4200/"]`,
		`api_gateway: "https://api.placeholder.test/"`,
		`cdn_url: "https://cdn.placeholder.test/"`,
	}

	for _, snippet := range expectedSnippets {
		if !strings.Contains(environmentContents, snippet) {
			t.Fatalf("environment.ts missing expected snippet %q\n\n%s", snippet, environmentContents)
		}
	}
}

func TestWriteEnvironmentFilesWritesDevelopmentEnvironmentFiles(t *testing.T) {
	webappDir := filepath.Join("testdata", "placeholder-development-webapp")
	args := placeholderBuildArgs()
	args["workspace"] = "dev"
	args["production"] = "false"

	if err := os.RemoveAll(webappDir); err != nil {
		t.Fatalf("os.RemoveAll(%q) error = %v", webappDir, err)
	}

	if err := writeEnvironmentFiles(webappDir, args, io.Discard); err != nil {
		t.Fatalf("writeEnvironmentFiles() error = %v", err)
	}

	envDir := filepath.Join(webappDir, "src", "environments")
	environmentPath := filepath.Join(envDir, "environment.ts")
	developmentPath := filepath.Join(envDir, "environment.development.ts")
	productionPath := filepath.Join(envDir, "environment.prod.ts")

	environmentContents := readFile(t, environmentPath)
	developmentContents := readFile(t, developmentPath)

	if environmentContents != developmentContents {
		t.Fatalf("environment.ts and environment.development.ts contents differ")
	}

	if _, err := os.Stat(productionPath); !os.IsNotExist(err) {
		t.Fatalf("environment.prod.ts should not be written for development workspace, stat error = %v", err)
	}

	if !strings.Contains(environmentContents, "production: false") {
		t.Fatalf("environment.ts missing development production flag\n\n%s", environmentContents)
	}
}

func placeholderBuildArgs() buildArgs {
	return buildArgs{
		"workspace":             "prod",
		"production":            "true",
		"region":                "ap-southeast-1",
		"identity_pool_id":      "placeholder-identity-pool-id",
		"user_pool_id":          "placeholder-user-pool-id",
		"user_pool_client_id":   "placeholder-user-pool-client-id",
		"oauth_domain":          "placeholder.auth.ap-southeast-1.amazoncognito.com",
		"storage_bucket_name":   "placeholder-storage-bucket",
		"api_endpoint":          "https://api.placeholder.test",
		"cdn_url":               "https://cdn.placeholder.test",
		"application_urls_json": `["https://app.placeholder.test","http://localhost:4200/"]`,
		"application_api_name":  "placeholder-api",
	}
}

func readFile(t *testing.T, path string) string {
	t.Helper()

	contents, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("os.ReadFile(%q) error = %v", path, err)
	}

	return string(contents)
}
