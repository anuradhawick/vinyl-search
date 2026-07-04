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

// ParseOID parses a non-empty hex string into a Mongo ObjectID.
func ParseOID(value string) (bson.ObjectID, error) {
	if value == "" {
		return bson.NilObjectID, errors.New("empty object id")
	}
	return bson.ObjectIDFromHex(value)
}

// OIDFromAny converts a string or ObjectID value into a Mongo ObjectID.
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

// DecodeBody decodes an API Gateway JSON body into a BSON map.
func DecodeBody(body string) (bson.M, error) {
	if body == "" {
		return bson.M{}, nil
	}
	var doc bson.M
	err := json.Unmarshal([]byte(body), &doc)
	return doc, err
}

// NormalizeMongoJSON converts Mongo-specific values into JSON-friendly values.
func NormalizeMongoJSON(value any) any {
	return normalize(reflect.ValueOf(value))
}

// normalize recursively converts BSON, time, map, and slice values for JSON encoding.
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

	// Fall back to reflection so ordinary maps and slices from handlers normalize too.
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

// CDNURL builds a CDN URL for an image variant from an original image path.
func CDNURL(prefix, variant, image string) string {
	name := strings.TrimSuffix(path.Base(imagePath(image)), path.Ext(imagePath(image)))
	return "https://" + LoadConfig().CDNDomain + "/" + prefix + "/" + variant + "/" + name + ".jpeg"
}

// imagePath returns the path portion of a URL or the original image string.
func imagePath(image string) string {
	if parsed, err := url.Parse(image); err == nil && parsed.Path != "" {
		return parsed.Path
	}
	return image
}

// Filename returns the final path segment from an image URL or key.
func Filename(image string) string {
	return path.Base(imagePath(image))
}

// FirstPathSegment returns the first path segment from an image URL or key.
func FirstPathSegment(image string) string {
	clean := strings.Trim(imagePath(image), "/")
	if clean == "" {
		return ""
	}
	return strings.Split(clean, "/")[0]
}

// PreviousPathSegment returns the path segment immediately before the filename.
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

// RewriteImages rewrites a document's image list to CDN URLs for the requested variant.
func RewriteImages(doc bson.M, prefix, variant string) {
	raw := StringSlice(doc["images"])
	if len(raw) == 0 {
		return
	}

	images := make(bson.A, 0, len(raw))
	for _, image := range raw {
		images = append(images, CDNURL(prefix, variant, image))
	}
	doc["images"] = images
}

// RewriteImageList rewrites image lists on every child document in a container field.
func RewriteImageList(container bson.M, key, prefix, variant string) {
	switch typed := container[key].(type) {
	case []bson.M:
		for i := range typed {
			RewriteImages(typed[i], prefix, variant)
		}
	case []map[string]any:
		for i := range typed {
			doc := bson.M(typed[i])
			RewriteImages(doc, prefix, variant)
			typed[i] = map[string]any(doc)
		}
	case bson.A:
		for i, item := range typed {
			if doc, ok := Doc(item); ok {
				RewriteImages(doc, prefix, variant)
				typed[i] = doc
			}
		}
	case []any:
		for i, item := range typed {
			if doc, ok := Doc(item); ok {
				RewriteImages(doc, prefix, variant)
				typed[i] = doc
			}
		}
	}
}

// Docs converts supported BSON slice shapes into a slice of BSON maps.
func Docs(value any) []bson.M {
	switch typed := value.(type) {
	case []bson.M:
		return typed
	case []map[string]any:
		out := make([]bson.M, 0, len(typed))
		for _, item := range typed {
			out = append(out, bson.M(item))
		}
		return out
	case bson.A:
		out := make([]bson.M, 0, len(typed))
		for _, item := range typed {
			if doc, ok := Doc(item); ok {
				out = append(out, doc)
			}
		}
		return out
	case []any:
		out := make([]bson.M, 0, len(typed))
		for _, item := range typed {
			if doc, ok := Doc(item); ok {
				out = append(out, doc)
			}
		}
		return out
	default:
		return nil
	}
}

// Doc converts supported document shapes into a BSON map.
func Doc(value any) (bson.M, bool) {
	switch typed := value.(type) {
	case bson.M:
		return typed, true
	case map[string]any:
		return bson.M(typed), true
	case bson.D:
		out := bson.M{}
		for _, elem := range typed {
			out[elem.Key] = elem.Value
		}
		return out, true
	default:
		return nil, false
	}
}

// StringSlice converts supported string slice shapes into a native string slice.
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

// UniqueStrings returns values in first-seen order with duplicates removed.
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

// StringArray converts a native string slice into a BSON array.
func StringArray(values []string) bson.A {
	out := make(bson.A, len(values))
	for i, value := range values {
		out[i] = value
	}
	return out
}
