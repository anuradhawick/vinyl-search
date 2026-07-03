package main

import (
	"bytes"
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
	"unicode"
)

var oauthScopes = []string{
	"phone",
	"email",
	"profile",
	"openid",
	"aws.cognito.signin.user.admin",
}

type buildArgs map[string]string

func (args buildArgs) require(key string) (string, error) {
	value := args[key]
	if value == "" {
		return "", fmt.Errorf("missing required build argument: %s", key)
	}
	return value, nil
}

func main() {
	if err := run(os.Stdin, os.Stdout, os.Stderr); err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: %v\n", err)
		os.Exit(1)
	}
}

func run(stdin io.Reader, stdout io.Writer, stderr io.Writer) error {
	args := buildArgs{}
	if err := json.NewDecoder(stdin).Decode(&args); err != nil {
		return err
	}

	webappDir, err := args.require("webapp_dir")
	if err != nil {
		return err
	}

	buildDestination, err := args.require("build_destination")
	if err != nil {
		return err
	}

	if err := writeEnvironmentFiles(webappDir, args, stderr); err != nil {
		return err
	}

	if err := runCommand(args["install_command"], webappDir, "install", stderr); err != nil {
		return err
	}

	buildCommand, err := args.require("build_command")
	if err != nil {
		return err
	}

	if err := runCommand(buildCommand, webappDir, "build", stderr); err != nil {
		return err
	}

	manifest, hash, err := buildManifest(buildDestination)
	if err != nil {
		return err
	}

	manifestJSON, err := json.Marshal(manifest)
	if err != nil {
		return err
	}

	return json.NewEncoder(stdout).Encode(map[string]string{
		"hash":              hash,
		"build_destination": buildDestination,
		"files_json":        string(manifestJSON),
	})
}

func writeEnvironmentFiles(webappDir string, args buildArgs, stderr io.Writer) error {
	workspace, err := args.require("workspace")
	if err != nil {
		return err
	}

	production := strings.EqualFold(args["production"], "true")
	contents, err := renderEnvironment(args, production)
	if err != nil {
		return err
	}

	envDir := filepath.Join(webappDir, "src", "environments")
	if err := os.MkdirAll(envDir, 0o755); err != nil {
		return err
	}

	targets := []string{filepath.Join(envDir, "environment.ts")}
	if workspace != "prod" {
		targets = append(targets, filepath.Join(envDir, "environment.development.ts"))
	}

	for _, target := range targets {
		if err := os.WriteFile(target, []byte(contents), 0o644); err != nil {
			return err
		}
		fmt.Fprintf(stderr, "updated %s\n", target)
	}

	return nil
}

func renderEnvironment(args buildArgs, production bool) (string, error) {
	applicationURLsJSON, err := args.require("application_urls_json")
	if err != nil {
		return "", err
	}

	var applicationURLs []string
	if err := json.Unmarshal([]byte(applicationURLsJSON), &applicationURLs); err != nil {
		return "", fmt.Errorf("invalid application_urls_json: %w", err)
	}

	for index, url := range applicationURLs {
		applicationURLs[index] = normalizeURL(url)
	}

	oauthRedirectURLsJSON, err := args.require("oauth_redirect_urls_json")
	if err != nil {
		return "", err
	}

	var oauthRedirectURLs []string
	if err := json.Unmarshal([]byte(oauthRedirectURLsJSON), &oauthRedirectURLs); err != nil {
		return "", fmt.Errorf("invalid oauth_redirect_urls_json: %w", err)
	}

	for index, url := range oauthRedirectURLs {
		oauthRedirectURLs[index] = normalizeURL(url)
	}

	apiEndpoint, err := requiredNormalizedURL(args, "api_endpoint")
	if err != nil {
		return "", err
	}

	cdnURL, err := requiredNormalizedURL(args, "cdn_url")
	if err != nil {
		return "", err
	}

	identityPoolID, err := args.require("identity_pool_id")
	if err != nil {
		return "", err
	}

	region, err := args.require("region")
	if err != nil {
		return "", err
	}

	userPoolID, err := args.require("user_pool_id")
	if err != nil {
		return "", err
	}

	userPoolClientID, err := args.require("user_pool_client_id")
	if err != nil {
		return "", err
	}

	oauthDomain, err := args.require("oauth_domain")
	if err != nil {
		return "", err
	}

	storageBucketName, err := args.require("storage_bucket_name")
	if err != nil {
		return "", err
	}

	applicationAPIName, err := args.require("application_api_name")
	if err != nil {
		return "", err
	}

	return fmt.Sprintf(`export const environment = {
  production: %t,
  aws_config: {
    Auth: {
      Cognito: {
        identityPoolId: %s,
        region: %s,
        userPoolId: %s,
        userPoolClientId: %s,
        mandatorySignIn: false,
        loginWith: {
          oauth: {
            domain: %s,
            scopes: %s,
            redirectSignIn: %s,
            redirectSignOut: %s,
            responseType: 'code' as any,
          },
        },
      },
    },
    Storage: {
      S3: {
        bucket: %s,
        region: %s,
      },
    },
    API: {
      REST: {
        %s: {
          endpoint: %s,
          region: %s,
        },
      },
    },
  },
  api_gateway: %s,
  cdn_url: %s,
};
`, production,
		ts(identityPoolID),
		ts(region),
		ts(userPoolID),
		ts(userPoolClientID),
		ts(oauthDomain),
		indentedTS(oauthScopes, 12),
		ts(oauthRedirectURLs),
		ts(oauthRedirectURLs),
		ts(storageBucketName),
		ts(region),
		ts(applicationAPIName),
		ts(apiEndpoint),
		ts(region),
		ts(apiEndpoint),
		ts(cdnURL),
	), nil
}

func requiredNormalizedURL(args buildArgs, key string) (string, error) {
	value, err := args.require(key)
	if err != nil {
		return "", err
	}
	return normalizeURL(value), nil
}

func normalizeURL(value string) string {
	if strings.HasSuffix(value, "/") {
		return value
	}
	return value + "/"
}

func ts(value any) string {
	var buffer bytes.Buffer
	encoder := json.NewEncoder(&buffer)
	encoder.SetEscapeHTML(false)
	_ = encoder.Encode(value)
	return strings.TrimSuffix(buffer.String(), "\n")
}

func indentedTS(value any, indent int) string {
	var buffer bytes.Buffer
	encoder := json.NewEncoder(&buffer)
	encoder.SetEscapeHTML(false)
	encoder.SetIndent("", "  ")
	_ = encoder.Encode(value)
	return strings.ReplaceAll(strings.TrimSuffix(buffer.String(), "\n"), "\n", "\n"+strings.Repeat(" ", indent))
}

func runCommand(command string, cwd string, label string, stderr io.Writer) error {
	if strings.TrimSpace(command) == "" {
		fmt.Fprintf(stderr, "skipping %s\n", label)
		return nil
	}

	parts, err := splitCommand(command)
	if err != nil {
		return fmt.Errorf("invalid %s command: %w", label, err)
	}

	fmt.Fprintf(stderr, "running %s: %s\n", label, command)
	process := exec.Command(parts[0], parts[1:]...)
	process.Dir = cwd
	process.Stdout = stderr
	process.Stderr = stderr

	if err := process.Run(); err != nil {
		var exitErr *exec.ExitError
		if errors.As(err, &exitErr) {
			return fmt.Errorf("%s returned non-zero exit code %d", label, exitErr.ExitCode())
		}
		return err
	}

	return nil
}

func splitCommand(command string) ([]string, error) {
	var args []string
	var current strings.Builder
	var quote rune
	escaped := false
	tokenStarted := false

	flush := func() {
		args = append(args, current.String())
		current.Reset()
		tokenStarted = false
	}

	for _, character := range command {
		if escaped {
			current.WriteRune(character)
			escaped = false
			tokenStarted = true
			continue
		}

		if character == '\\' && quote != '\'' {
			escaped = true
			tokenStarted = true
			continue
		}

		if quote != 0 {
			if character == quote {
				quote = 0
				tokenStarted = true
				continue
			}

			current.WriteRune(character)
			tokenStarted = true
			continue
		}

		if character == '\'' || character == '"' {
			quote = character
			tokenStarted = true
			continue
		}

		if unicode.IsSpace(character) {
			if tokenStarted {
				flush()
			}
			continue
		}

		current.WriteRune(character)
		tokenStarted = true
	}

	if escaped {
		return nil, fmt.Errorf("unfinished escape")
	}

	if quote != 0 {
		return nil, fmt.Errorf("unterminated quote")
	}

	if tokenStarted {
		flush()
	}

	return args, nil
}

func buildManifest(dirPath string) (map[string]string, string, error) {
	info, err := os.Stat(dirPath)
	if err != nil {
		if errors.Is(err, fs.ErrNotExist) {
			return nil, "", fmt.Errorf("build destination does not exist: %s", dirPath)
		}
		return nil, "", err
	}

	if !info.IsDir() {
		return nil, "", fmt.Errorf("build destination is not a directory: %s", dirPath)
	}

	var files []string
	if err := filepath.WalkDir(dirPath, func(path string, entry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if !entry.IsDir() {
			files = append(files, path)
		}

		return nil
	}); err != nil {
		return nil, "", err
	}

	sort.Strings(files)

	manifest := make(map[string]string, len(files))
	sha := sha1.New()
	for _, file := range files {
		fileHash, err := sha1OfFile(dirPath, file)
		if err != nil {
			return nil, "", err
		}

		relativePath, err := filepath.Rel(dirPath, file)
		if err != nil {
			return nil, "", err
		}

		manifest[filepath.ToSlash(relativePath)] = fileHash
		sha.Write([]byte(fileHash))
	}

	return manifest, hex.EncodeToString(sha.Sum(nil)), nil
}

func sha1OfFile(root string, path string) (string, error) {
	relativePath, err := filepath.Rel(root, path)
	if err != nil {
		return "", err
	}

	sha := sha1.New()
	sha.Write([]byte(filepath.ToSlash(relativePath)))

	file, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer file.Close()

	if _, err := io.Copy(sha, file); err != nil {
		return "", err
	}

	return hex.EncodeToString(sha.Sum(nil)), nil
}
