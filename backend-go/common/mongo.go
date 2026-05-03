package common

import (
	"encoding/json"
	"errors"
	"net/url"
	"path"
	"reflect"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

func ParseOID(value string) (bson.ObjectID, error) {
	if value == "" {
		return bson.NilObjectID, errors.New("empty object id")
	}
	return bson.ObjectIDFromHex(value)
}

func OIDFromAny(value any) (bson.ObjectID, error) {
	switch typed := value.(type) {
	case bson.ObjectID:
		return typed, nil
	case string:
		return ParseOID(typed)
	default:
		return bson.NilObjectID, errors.New("invalid object id value")
	}
}

func DecodeBody(body string) (bson.M, error) {
	if body == "" {
		return bson.M{}, nil
	}
	var doc bson.M
	err := json.Unmarshal([]byte(body), &doc)
	return doc, err
}

func NormalizeMongoJSON(value any) any {
	return normalize(reflect.ValueOf(value))
}

func normalize(v reflect.Value) any {
	if !v.IsValid() {
		return nil
	}
	if v.Kind() == reflect.Pointer || v.Kind() == reflect.Interface {
		if v.IsNil() {
			return nil
		}
		return normalize(v.Elem())
	}
	value := v.Interface()
	switch typed := value.(type) {
	case bson.ObjectID:
		if typed == bson.NilObjectID {
			return ""
		}
		return typed.Hex()
	case bson.DateTime:
		return typed.Time().UTC().Format(time.RFC3339Nano)
	case time.Time:
		return typed.UTC().Format(time.RFC3339Nano)
	case bson.M:
		out := map[string]any{}
		for key, val := range typed {
			out[key] = NormalizeMongoJSON(val)
		}
		return out
	case bson.D:
		out := map[string]any{}
		for _, elem := range typed {
			out[elem.Key] = NormalizeMongoJSON(elem.Value)
		}
		return out
	case bson.A:
		out := make([]any, len(typed))
		for i, val := range typed {
			out[i] = NormalizeMongoJSON(val)
		}
		return out
	}

	switch v.Kind() {
	case reflect.Map:
		out := map[string]any{}
		iter := v.MapRange()
		for iter.Next() {
			out[iter.Key().String()] = NormalizeMongoJSON(iter.Value().Interface())
		}
		return out
	case reflect.Slice, reflect.Array:
		out := make([]any, v.Len())
		for i := 0; i < v.Len(); i++ {
			out[i] = NormalizeMongoJSON(v.Index(i).Interface())
		}
		return out
	default:
		return value
	}
}

func CDNURL(prefix, variant, image string) string {
	name := strings.TrimSuffix(path.Base(imagePath(image)), path.Ext(imagePath(image)))
	return "https://" + LoadConfig().CDNDomain + "/" + prefix + "/" + variant + "/" + name + ".jpeg"
}

func imagePath(image string) string {
	if parsed, err := url.Parse(image); err == nil && parsed.Path != "" {
		return parsed.Path
	}
	return image
}

func Filename(image string) string {
	return path.Base(imagePath(image))
}

func FirstPathSegment(image string) string {
	clean := strings.Trim(imagePath(image), "/")
	if clean == "" {
		return ""
	}
	return strings.Split(clean, "/")[0]
}

func PreviousPathSegment(image string) string {
	clean := strings.Trim(imagePath(image), "/")
	if clean == "" {
		return ""
	}
	parts := strings.Split(clean, "/")
	if len(parts) < 2 {
		return ""
	}
	return parts[len(parts)-2]
}

func RewriteImages(doc bson.M, prefix, variant string) {
	raw, ok := doc["images"].(bson.A)
	if !ok {
		if list, ok := doc["images"].([]any); ok {
			raw = bson.A(list)
		} else {
			return
		}
	}
	images := make(bson.A, 0, len(raw))
	for _, image := range raw {
		if s, ok := image.(string); ok {
			images = append(images, CDNURL(prefix, variant, s))
		}
	}
	doc["images"] = images
}

func RewriteImageList(container bson.M, key, prefix, variant string) {
	for _, doc := range Docs(container[key]) {
		RewriteImages(doc, prefix, variant)
	}
}

func Docs(value any) []bson.M {
	switch typed := value.(type) {
	case []bson.M:
		return typed
	case bson.A:
		out := make([]bson.M, 0, len(typed))
		for _, item := range typed {
			if doc, ok := item.(bson.M); ok {
				out = append(out, doc)
			}
		}
		return out
	case []any:
		out := make([]bson.M, 0, len(typed))
		for _, item := range typed {
			if doc, ok := item.(bson.M); ok {
				out = append(out, doc)
			}
		}
		return out
	default:
		return nil
	}
}

func StringSlice(value any) []string {
	switch typed := value.(type) {
	case []string:
		return typed
	case bson.A:
		out := make([]string, 0, len(typed))
		for _, item := range typed {
			if s, ok := item.(string); ok {
				out = append(out, s)
			}
		}
		return out
	case []any:
		out := make([]string, 0, len(typed))
		for _, item := range typed {
			if s, ok := item.(string); ok {
				out = append(out, s)
			}
		}
		return out
	default:
		return nil
	}
}

func UniqueStrings(values []string) []string {
	seen := map[string]bool{}
	out := make([]string, 0, len(values))
	for _, value := range values {
		if seen[value] {
			continue
		}
		seen[value] = true
		out = append(out, value)
	}
	return out
}

func StringArray(values []string) bson.A {
	out := make(bson.A, len(values))
	for i, value := range values {
		out[i] = value
	}
	return out
}
