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

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Minute)
	defer cancel()

	client, err := NewTradingViewClient(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, CaptureResponse{
			Error: fmt.Sprintf("Failed to create client: %v", err),
		})
		return
	}
	defer client.Close()

	if err := client.NavigateToChart(req.Symbol); err != nil {
		c.JSON(http.StatusInternalServerError, CaptureResponse{
			Error: fmt.Sprintf("Failed to navigate to chart: %v", err),
		})
		return
	}

	screenshots, err := client.CaptureTimeframes(req.Timeframes)
	if err != nil {
		if len(screenshots) > 0 {
			c.JSON(http.StatusPartialContent, CaptureResponse{
				Screenshots: screenshots,
				Error:       fmt.Sprintf("Some captures failed: %v", err),
			})
			return
		}

		c.JSON(http.StatusInternalServerError, CaptureResponse{
			Error: fmt.Sprintf("Failed to capture charts: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, CaptureResponse{
		Screenshots: screenshots,
	})
}
