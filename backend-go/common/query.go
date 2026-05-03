package common

import (
	"encoding/json"
	"strconv"
)

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

func StringQuery(params map[string]string, key string, fallback string) string {
	if params == nil || params[key] == "" {
		return fallback
	}
	return params[key]
}

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
