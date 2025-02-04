package main

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func CaptureHandler(c *gin.Context) {
	var req CaptureRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, CaptureResponse{
			Error: fmt.Sprintf("Invalid request: %v", err),
		})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), time.Duration(15*len(req.Timeframes))*time.Second)
	defer cancel()

	client, err := NewTradingViewClient(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, CaptureResponse{
			Error: fmt.Sprintf("Failed to create client: %v", err),
		})
		return
	}

	mChartUrl, err := client.TradingViewCaptureChartWithTimeframes(req.Symbol, req.Timeframes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, CaptureResponse{
			Error: fmt.Sprintf("Failed to capture charts: %v", err),
		})
		return
	}

	filePaths, err := handleUploadCaptureS3(req.Symbol, mChartUrl)
	if err != nil {
		c.JSON(http.StatusInternalServerError, CaptureResponse{
			Error: fmt.Sprintf("Failed to capture charts: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, CaptureResponse{
		Screenshots: filePaths,
	})
}

func handleUploadCaptureS3(symbol string, mCharUrl map[string][]byte) ([]string, error) {
	resUrl := []string{}
	for chart, pic := range mCharUrl {
		filename := fmt.Sprintf("%s_%s.png", symbol, chart)
		url, err := storage.UploadFileFromBytes(context.Background(), pic, filename)
		if err != nil {
			return resUrl, err
		}
		resUrl = append(resUrl, url)
	}
	return resUrl, nil
}
