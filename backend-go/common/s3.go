package common

import (
	"bytes"
	"context"
	"errors"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"net/url"
	"os"
	"path"
	"sync"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/disintegration/imaging"
)

var (
	awsOnce      sync.Once
	awsCfg       aws.Config
	awsErr       error
	s3Client     *s3.Client
	cognito      *cognitoidentityprovider.Client
	watermarkMu  sync.Mutex
	watermarkImg image.Image
)

func AWSConfig(ctx context.Context) (aws.Config, error) {
	awsOnce.Do(func() {
		cfg := LoadConfig()
		opts := []func(*config.LoadOptions) error{}
		if cfg.BucketRegion != "" {
			opts = append(opts, config.WithRegion(cfg.BucketRegion))
		}
		awsCfg, awsErr = config.LoadDefaultConfig(ctx, opts...)
		if awsErr == nil {
			s3Client = s3.NewFromConfig(awsCfg)
			cognito = cognitoidentityprovider.NewFromConfig(awsCfg)
		}
	})
	return awsCfg, awsErr
}

func S3(ctx context.Context) (*s3.Client, error) {
	if _, err := AWSConfig(ctx); err != nil {
		return nil, err
	}
	return s3Client, nil
}

func Cognito(ctx context.Context) (*cognitoidentityprovider.Client, error) {
	if _, err := AWSConfig(ctx); err != nil {
		return nil, err
	}
	return cognito, nil
}

func CopyFromTemp(ctx context.Context, filename, targetPrefix string) error {
	client, err := S3(ctx)
	if err != nil {
		return err
	}
	cfg := LoadConfig()
	source := url.PathEscape(path.Join(cfg.BucketName, "temp", filename))
	_, err = client.CopyObject(ctx, &s3.CopyObjectInput{
		Bucket:     aws.String(cfg.BucketName),
		CopySource: aws.String(source),
		Key:        aws.String(path.Join(targetPrefix, filename)),
	})
	return err
}

func DeleteObject(ctx context.Context, key string) error {
	client, err := S3(ctx)
	if err != nil {
		return err
	}
	cfg := LoadConfig()
	_, err = client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(cfg.BucketName),
		Key:    aws.String(key),
	})
	return err
}

func CreateWatermarks(ctx context.Context, key string) error {
	client, err := S3(ctx)
	if err != nil {
		return err
	}
	cfg := LoadConfig()
	if cfg.BucketName == "" {
		return errors.New("BUCKET_NAME is not set")
	}

	obj, err := client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(cfg.BucketName),
		Key:    aws.String(key),
	})
	if err != nil {
		return err
	}
	defer obj.Body.Close()

	source, err := imaging.Decode(obj.Body, imaging.AutoOrientation(true))
	if err != nil {
		return err
	}
	watermark, err := watermarkImage()
	if err != nil {
		return err
	}

	scaled := imaging.Fit(watermark, source.Bounds().Dx(), source.Bounds().Dy(), imaging.Lanczos)
	thumb := imaging.Resize(source, 100, 0, imaging.Lanczos)
	watermarked := imaging.OverlayCenter(source, scaled, 0.22)

	thumbBuf, err := encodeJPEG(thumb)
	if err != nil {
		return err
	}
	wmBuf, err := encodeJPEG(watermarked)
	if err != nil {
		return err
	}

	dir := path.Dir(key)
	base := stringsTrimExt(path.Base(key))
	_, err = client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(cfg.BucketName),
		Key:    aws.String(path.Join(dir, "watermarked", base+".jpeg")),
		Body:   bytes.NewReader(wmBuf),
	})
	if err != nil {
		return err
	}
	_, err = client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(cfg.BucketName),
		Key:    aws.String(path.Join(dir, "thumbnails", base+".jpeg")),
		Body:   bytes.NewReader(thumbBuf),
	})
	return err
}

func encodeJPEG(img image.Image) ([]byte, error) {
	var buf bytes.Buffer
	err := jpeg.Encode(&buf, img, &jpeg.Options{Quality: 90})
	return buf.Bytes(), err
}

func watermarkImage() (image.Image, error) {
	watermarkMu.Lock()
	defer watermarkMu.Unlock()

	if watermarkImg != nil {
		return watermarkImg, nil
	}

	for _, candidate := range []string{os.Getenv("WATERMARK_PATH"), "wm.png", "/var/task/wm.png"} {
		if candidate == "" {
			continue
		}
		f, err := os.Open(candidate)
		if err != nil {
			continue
		}
		defer f.Close()
		img, _, err := image.Decode(f)
		if err != nil {
			return nil, err
		}
		watermarkImg = img
		return watermarkImg, nil
	}
	return nil, errors.New("wm.png not found")
}

func stringsTrimExt(name string) string {
	return name[:len(name)-len(path.Ext(name))]
}

func ReadAllAndClose(r io.ReadCloser) ([]byte, error) {
	defer r.Close()
	return io.ReadAll(r)
}

func init() {
	image.RegisterFormat("png", "\x89PNG\r\n\x1a\n", png.Decode, png.DecodeConfig)
}
