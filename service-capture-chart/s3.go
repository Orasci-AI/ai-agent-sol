package main

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"path/filepath"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type S3Storage struct {
	client     *s3.Client
	bucketName string
}

type s3UploadProviderOptions struct {
	AwsConfig   aws.Config
	BucketName  string
	PathPrefix  string
	Concurrency int
}

func NewS3Storage(region, accessKey, secretKey, bucketName string) *S3Storage {
	cfg, err := config.LoadDefaultConfig(
		context.Background(),
		config.WithRegion(region),
		config.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(accessKey, secretKey, ""),
		),
	)
	if err != nil {
		fmt.Print("Error connect s3 client: %v", err)
	}

	client := s3.NewFromConfig(cfg)
	return &S3Storage{
		client:     client,
		bucketName: bucketName,
	}
}

func (s *S3Storage) UploadFileFromBytes(ctx context.Context, fileBytes []byte, filename string) (string, error) {
	reader := bytes.NewReader(fileBytes)
	return s.UploadFile(ctx, reader, filename)
}

func (s *S3Storage) UploadFile(ctx context.Context, file io.Reader, filename string) (string, error) {
	input := &s3.PutObjectInput{
		Bucket:      aws.String(s.bucketName),
		Key:         aws.String(filepath.Clean(filename)),
		Body:        file,
		ContentType: aws.String("image/png"),
	}

	_, err := s.client.PutObject(ctx, input)
	if err != nil {
		return "", fmt.Errorf("failed to upload file %s: %w", filename, err)
	}

	fileURL := fmt.Sprintf("https://%s.s3.amazonaws.com/%s", s.bucketName, filename)
	return fileURL, nil
}

func (s *S3Storage) DeleteFile(ctx context.Context, filename string) error {
	input := &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(filepath.Clean(filename)),
	}

	_, err := s.client.DeleteObject(ctx, input)
	if err != nil {
		return fmt.Errorf("failed to delete file %s: %w", filename, err)
	}

	return nil
}

func (s *S3Storage) GetFile(ctx context.Context, filename string) (io.ReadCloser, error) {
	input := &s3.GetObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(filepath.Clean(filename)),
	}

	result, err := s.client.GetObject(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("failed to get file %s: %w", filename, err)
	}

	return result.Body, nil
}

func (s *S3Storage) FileExists(ctx context.Context, filename string) (bool, error) {
	input := &s3.HeadObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(filepath.Clean(filename)),
	}

	_, err := s.client.HeadObject(ctx, input)
	if err != nil {
		return false, nil
	}

	return true, nil
}
