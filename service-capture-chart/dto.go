package main

type CaptureRequest struct {
	Symbol     string   `json:"symbol" binding:"required"`
	Timeframes []string `json:"timeframes" binding:"required,dive,oneof=1D 5D 1M 3M 6M 1Y"`
}

type CaptureResponse struct {
	Screenshots []string `json:"screenshots"`
	Error       string   `json:"error,omitempty"`
}
