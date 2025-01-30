package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

var storage *S3Storage

type Config struct {
	Region     string
	AccessKey  string
	SecretKey  string
	BucketName string
}

// LoadConfig loads environment variables from .env file
func LoadConfig() (*Config, error) {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		return nil, fmt.Errorf("error loading .env file: %w", err)
	}

	config := &Config{
		Region:     os.Getenv("Region"),
		AccessKey:  os.Getenv("AccessKey"),
		SecretKey:  os.Getenv("SecretKey"),
		BucketName: os.Getenv("BucketName"),
	}

	// Validate required fields
	if config.Region == "" || config.AccessKey == "" || config.SecretKey == "" || config.BucketName == "" {
		return nil, fmt.Errorf("missing required environment variables")
	}

	return config, nil
}
func main() {
	router := gin.Default()
	config, err := LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}
	storage = NewS3Storage(config.Region, config.AccessKey, config.SecretKey, config.BucketName)

	router.POST("/api/v1/capture", CaptureHandler)

	if err := router.Run(":8081"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
