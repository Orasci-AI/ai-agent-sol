package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/chromedp/chromedp"
)

type TradingViewClient struct{}

func NewTradingViewClient(ctx context.Context) (*TradingViewClient, error) {
	return &TradingViewClient{}, nil
}

func (c *TradingViewClient) TradingViewCaptureChartWithTimeframes(url string, timeframes []string) (map[string][]byte, error) {
	log.Printf("[Debug] Starting capture for timeframes: %v", timeframes)

	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("enable-automation", false),
		chromedp.Flag("headless", true),
	)

	allocCtx, cancel := chromedp.NewExecAllocator(context.Background(), opts...)
	defer cancel()

	ctx, cancel := chromedp.NewContext(allocCtx,
		chromedp.WithLogf(log.Printf),
	)
	defer cancel()

	ctx, cancel = context.WithTimeout(ctx, time.Duration(len(timeframes))*30*time.Second)
	defer cancel()

	// Map to store screenshots for each timeframe
	screenshots := make(map[string][]byte)

	// Navigate once and then switch timeframes
	err := chromedp.Run(ctx,
		chromedp.Navigate(fmt.Sprintf("https://www.tradingview.com/chart/?symbol=%s", url)),

		chromedp.WaitReady("body", chromedp.ByQuery),

		chromedp.Evaluate(`
            (() => {
                return new Promise((resolve) => {
                    console.log("Waiting for page to fully load...");
                    const checkReady = setInterval(() => {
                        const chart = document.querySelector('.chart-container');
                        if (chart) {
                            console.log("Chart container found");
                            clearInterval(checkReady);
                            setTimeout(resolve, 5000);
                        }
                    }, 500);
                });
            })();
        `, nil),
		chromedp.Evaluate(`
            (() => {
                console.log("Clicking fullscreen button...");
                const fullscreenBtn = document.querySelector('#header-toolbar-fullscreen');
                if (fullscreenBtn) {
                    fullscreenBtn.click();
                    console.log("Fullscreen button clicked");
                    return true;
                }
                console.error("Fullscreen button not found");
                return false;
            })();
        `, nil),
	)

	if err != nil {
		return nil, fmt.Errorf("initial navigation error: %v", err)
	}

	// Capture each timeframe
	for _, timeframe := range timeframes {
		log.Printf("[Debug] Processing timeframe: %s", timeframe)

		var buf []byte
		err := chromedp.Run(ctx,
			// Click timeframe
			chromedp.Evaluate(fmt.Sprintf(`
                (() => {
                    console.log("Attempting to click timeframe: %s");
                    const selectors = [
                        'button[data-name="date-range-tab-%s"]',
                        'button[value="%s"]',
                        '.item-SqYYy1zF[data-name="date-range-tab-%s"]'
                    ];

                    for (const selector of selectors) {
                        const button = document.querySelector(selector);
                        if (button) {
                            console.log("Found timeframe button with selector:", selector);
                            button.click();
                            return true;
                        }
                    }
                    console.error("No timeframe button found");
                    return false;
                })();
            `, timeframe, timeframe, timeframe, timeframe), nil),

			// Wait for chart to update
			chromedp.Sleep(5*time.Second),

			// Hide unwanted elements
			chromedp.Evaluate(`
                (() => {
                    const elementsToHide = document.querySelectorAll('.toast-wrapper, .tv-dialog, [data-dialog-name="gopro"]');
                    elementsToHide.forEach(el => {
                        if(el) el.style.display = 'none';
                    });
                })();
            `, nil),

			// Take screenshot
			chromedp.CaptureScreenshot(&buf),
		)

		if err != nil {
			log.Printf("[Debug] Error capturing timeframe %s: %v", timeframe, err)
			continue
		}

		if len(buf) > 0 {
			screenshots[timeframe] = buf
			log.Printf("[Debug] Successfully captured screenshot for timeframe: %s", timeframe)
		}
	}

	if len(screenshots) == 0 {
		return nil, fmt.Errorf("failed to capture any screenshots")
	}

	return screenshots, nil
}
