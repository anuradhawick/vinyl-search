package common

import (
	"context"
	"crypto"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"strings"
	"sync"
	"time"
)

var (
	jwksMu    sync.Mutex
	jwksCache map[string]jwk
)

type jwksResponse struct {
	Keys []jwk `json:"keys"`
}

type jwk struct {
	Kid string `json:"kid"`
	Kty string `json:"kty"`
	Alg string `json:"alg"`
	Use string `json:"use"`
	N   string `json:"n"`
	E   string `json:"e"`
}

// ClaimsFromAuthorizationHeader validates a Cognito bearer token and returns its claims.
func ClaimsFromAuthorizationHeader(ctx context.Context, headers map[string]string) (map[string]any, error) {
	token := bearerToken(headers)
	if token == "" {
		return nil, errors.New("missing bearer token")
	}
	return validateCognitoJWT(ctx, token)
}

func bearerToken(headers map[string]string) string {
	for name, value := range headers {
		if strings.EqualFold(name, "authorization") {
			prefix := "Bearer "
			if strings.HasPrefix(value, prefix) {
				return strings.TrimSpace(strings.TrimPrefix(value, prefix))
			}
		}
	}
	return ""
}

func validateCognitoJWT(ctx context.Context, token string) (map[string]any, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, errors.New("invalid jwt")
	}

	var header map[string]any
	if err := decodeJWTPart(parts[0], &header); err != nil {
		return nil, err
	}
	if header["alg"] != "RS256" {
		return nil, errors.New("unsupported jwt algorithm")
	}
	kid, _ := header["kid"].(string)
	if kid == "" {
		return nil, errors.New("missing jwt kid")
	}

	var claims map[string]any
	if err := decodeJWTPart(parts[1], &claims); err != nil {
		return nil, err
	}
	if err := validateClaims(claims); err != nil {
		return nil, err
	}

	key, err := publicKey(ctx, kid)
	if err != nil {
		return nil, err
	}

	signed := []byte(parts[0] + "." + parts[1])
	hash := sha256.Sum256(signed)
	signature, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return nil, err
	}
	if err := rsa.VerifyPKCS1v15(key, crypto.SHA256, hash[:], signature); err != nil {
		return nil, err
	}

	return claims, nil
}

func decodeJWTPart(part string, target any) error {
	data, err := base64.RawURLEncoding.DecodeString(part)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, target)
}

func validateClaims(claims map[string]any) error {
	cfg := LoadConfig()
	if cfg.CognitoUserPoolID == "" {
		return errors.New("COGNITO_USER_POOL_ID is not set")
	}

	if issuer, _ := claims["iss"].(string); issuer != cognitoIssuer(cfg.CognitoUserPoolID) {
		return errors.New("invalid token issuer")
	}

	now := time.Now().Unix()
	if exp, ok := numericClaim(claims, "exp"); !ok || exp <= now {
		return errors.New("expired token")
	}
	if nbf, ok := numericClaim(claims, "nbf"); ok && nbf > now {
		return errors.New("token not valid yet")
	}
	return nil
}

func numericClaim(claims map[string]any, name string) (int64, bool) {
	switch value := claims[name].(type) {
	case float64:
		return int64(value), true
	case json.Number:
		number, err := value.Int64()
		return number, err == nil
	default:
		return 0, false
	}
}

func publicKey(ctx context.Context, kid string) (*rsa.PublicKey, error) {
	keys, err := jwks(ctx)
	if err != nil {
		return nil, err
	}
	key, ok := keys[kid]
	if !ok {
		return nil, errors.New("jwt kid not found")
	}

	modulus, err := base64.RawURLEncoding.DecodeString(key.N)
	if err != nil {
		return nil, err
	}
	exponent, err := base64.RawURLEncoding.DecodeString(key.E)
	if err != nil {
		return nil, err
	}

	e := 0
	for _, b := range exponent {
		e = e<<8 + int(b)
	}
	return &rsa.PublicKey{N: new(big.Int).SetBytes(modulus), E: e}, nil
}

func jwks(ctx context.Context) (map[string]jwk, error) {
	jwksMu.Lock()
	defer jwksMu.Unlock()

	if jwksCache != nil {
		return jwksCache, nil
	}

	cfg := LoadConfig()
	issuer := cognitoIssuer(cfg.CognitoUserPoolID)
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, issuer+"/.well-known/jwks.json", nil)
	if err != nil {
		return nil, err
	}
	response, err := http.DefaultClient.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("jwks request returned %s", response.Status)
	}

	var decoded jwksResponse
	if err := json.NewDecoder(response.Body).Decode(&decoded); err != nil {
		return nil, err
	}

	jwksCache = map[string]jwk{}
	for _, key := range decoded.Keys {
		jwksCache[key.Kid] = key
	}
	return jwksCache, nil
}

func cognitoIssuer(userPoolID string) string {
	region, _, _ := strings.Cut(userPoolID, "_")
	return "https://cognito-idp." + region + ".amazonaws.com/" + userPoolID
}
