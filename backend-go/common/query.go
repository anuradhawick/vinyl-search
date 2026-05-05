package common

import (
	"encoding/json"
	"strconv"
)

// IntQuery reads an integer query parameter or returns the fallback value.
func IntQuery(params map[string]string, key string, fallback int64) int64 {
	if params == nil || params[key] == "" {
		return fallback
	}
	value, err := strconv.ParseInt(params[key], 10, 64)
	if err != nil {
		return fallback
	}
	return value
}

// StringQuery reads a string query parameter or returns the fallback value.
func StringQuery(params map[string]string, key string, fallback string) string {
	if params == nil || params[key] == "" {
		return fallback
	}
	return params[key]
}

// StringArrayQuery reads a JSON-encoded string array query parameter.
func StringArrayQuery(params map[string]string, key string) []string {
	if params == nil || params[key] == "" {
		return nil
	}
	var values []string
	if err := json.Unmarshal([]byte(params[key]), &values); err != nil {
		return nil
	}
	return values
}
