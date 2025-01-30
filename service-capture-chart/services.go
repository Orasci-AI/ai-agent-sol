package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/go-rod/rod"
	"github.com/go-rod/rod/lib/launcher"
	"github.com/go-rod/rod/lib/proto"
)

type TradingViewClient struct {
	browser *rod.Browser
	page    *rod.Page
	ctx     context.Context
}

func NewTradingViewClient(ctx context.Context) (*TradingViewClient, error) {
	browser := rod.New().
		ControlURL(
			launcher.New().
				Headless(true).
				Set("disable-extensions", "true").
				Set("disable-notifications", "true").
				Set("disable-popup-blocking", "true").
				Set("disable-infobars", "true").
				Set("disable-gpu", "true").
				Set("no-sandbox", "true").
				Set("disable-dev-shm-usage", "true").
				Set("disable-translate", "true").
				Set("disable-background-networking", "true").
				Set("disable-prompt-on-repost", "true").
				Set("disable-hang-monitor", "true").
				Set("disable-client-side-phishing-detection", "true").
				Delete("use-mock-keychain").
				MustLaunch(),
		).
		MustConnect().
		MustIgnoreCertErrors(true).
		Context(ctx)

	page := browser.MustPage("")

	page.MustSetUserAgent(&proto.NetworkSetUserAgentOverride{
		UserAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
	})

	return &TradingViewClient{
		browser: browser,
		page:    page,
		ctx:     ctx,
	}, nil
}

func (c *TradingViewClient) Close() {
	if c.page != nil {
		c.page.MustClose()
	}
	if c.browser != nil {
		c.browser.MustClose()
	}
}
func (c *TradingViewClient) NavigateToChart(symbol string) error {
	baseURL := fmt.Sprintf("https://www.tradingview.com/chart/?symbol=%s", symbol)
	if err := navigateWithRetry(c.page, baseURL); err != nil {
		return fmt.Errorf("failed to navigate: %v", err)
	}

	c.page.MustWaitLoad()
	c.page.MustWaitIdle()

	if err := waitForChartElement(c.page); err != nil {
		return fmt.Errorf("chart not found: %v", err)
	}

	time.Sleep(5 * time.Second)
	return nil
}

func (c *TradingViewClient) CaptureTimeframes(timeframes []string) ([]string, error) {
	totalTasks := len(timeframes)
	results := make(chan CaptureResult, totalTasks)
	errors := make(chan error, totalTasks)
	progress := make(chan int, totalTasks)

	go trackProgress(progress, totalTasks)

	for _, timeframe := range timeframes {
		log.Printf("[Task Started] Processing timeframe: %s", timeframe)
		screenshot, err := TradingViewCaptureChartWithTimeframe(c.page, timeframe)

		if err != nil {
			log.Printf("[Error] Failed to capture timeframe %s: %v", timeframe, err)
			errors <- err
		} else {
			results <- CaptureResult{
				Timeframe:  timeframe,
				Screenshot: screenshot,
				Error:      nil,
			}
		}
		progress <- 1
	}

	filePaths, err := processResults(results, errors, totalTasks)

	close(results)
	close(errors)
	close(progress)

	return filePaths, err
}

func trackProgress(progress chan int, totalTasks int) {
	completed := 0
	for range progress {
		completed++
		percentage := (float64(completed) / float64(totalTasks)) * 100
		log.Printf("[Progress] %.2f%% (%d/%d tasks completed)", percentage, completed, totalTasks)
	}
}

func processResults(results chan CaptureResult, errors chan error, totalTasks int) ([]string, error) {
	successCount := 0
	failCount := 0

	var filePaths []string

	for i := 0; i < totalTasks; i++ {
		select {
		case result := <-results:
			filename := fmt.Sprintf("tradingview_chart_%s.png", result.Timeframe)
			if filePath, err := storage.UploadFileFromBytes(context.Background(), result.Screenshot, filename); err != nil {
				log.Printf("[Error] Failed to upload file %s: %v", filename, err)
				failCount++
			} else {
				log.Printf("[Success] Upload screenshot: %s", filePath)
				successCount++
				filePaths = append(filePaths, filePath)

			}

		case err := <-errors:
			log.Printf("[Error] %v", err)
			failCount++
		}
	}

	log.Printf("[Complete] Tasks finished. Success: %d, Failed: %d", successCount, failCount)

	if failCount > 0 {
		return filePaths, fmt.Errorf("%d captures failed", failCount)
	}
	return filePaths, nil
}

type CaptureResult struct {
	Timeframe  string
	Screenshot []byte
	Error      error
}

func CapturePage(url string) ([]byte, error) {
	browser := rod.New().MustConnect()
	defer browser.MustClose()

	page := browser.MustPage(url)
	defer page.MustClose()

	page.MustWaitStable()

	quality := 100
	screenshot, err := page.Screenshot(true, &proto.PageCaptureScreenshot{
		Format:  proto.PageCaptureScreenshotFormatPng,
		Quality: &quality,
	})

	if err != nil {
		return nil, fmt.Errorf("failed to capture screenshot: %v", err)
	}

	return screenshot, nil
}

func CMCCaptureChartWithTimeframe(coinURL string, timeframe string) ([]byte, error) {
	browser := rod.New().
		MustConnect().
		MustIgnoreCertErrors(true)
	defer browser.MustClose()

	page := browser.MustPage(coinURL).
		MustSetViewport(1920, 1080, 1.0, false)
	defer page.MustClose()

	page.MustWaitLoad().MustWaitIdle()
	time.Sleep(5 * time.Second)

	timeframeMap := map[string]string{
		"1d": "tab-0",
		"7d": "tab-1",
		"1m": "tab-2",
	}

	if tabIndex, ok := timeframeMap[timeframe]; ok {
		selector := fmt.Sprintf(`li.Tab_base__W83LS[data-role="Tab"][data-index="%s"]`, tabIndex)

		err := rod.Try(func() {
			button := page.MustElement(selector)
			button.MustClick()
		})
		if err != nil {
			altSelector := fmt.Sprintf(`[data-index="%s"]`, tabIndex)
			err = rod.Try(func() {
				button := page.MustElement(altSelector)
				button.MustClick()
			})
			if err != nil {
				return nil, fmt.Errorf("failed to click timeframe button: %v", err)
			}
		}
	}

	time.Sleep(3 * time.Second)

	quality := 100
	screenshot, err := page.Screenshot(true, &proto.PageCaptureScreenshot{
		Format:  proto.PageCaptureScreenshotFormatPng,
		Quality: &quality,
	})

	if err != nil {
		return nil, fmt.Errorf("failed to capture screenshot: %v", err)
	}

	return screenshot, nil
}

func waitForChartElement(page *rod.Page) error {
	maxRetries := 5
	chartSelectors := []string{
		"div[id^='chart-container']",
		"div[class*='chart-container']",
		"div[data-name='chart']",
		"div[class*='chart-markup-table']",
		"div[class*='chart']",
	}

	for retry := 0; retry < maxRetries; retry++ {
		for _, selector := range chartSelectors {
			err := rod.Try(func() {
				log.Printf("[Debug] Trying selector: %s (attempt %d)", selector, retry+1)
				hasChart := page.MustHas(selector)
				if hasChart {
					// Wait for chart to be visible
					el := page.MustElement(selector)
					el.MustWaitVisible()
					log.Printf("[Debug] Found chart with selector: %s", selector)
					return
				}
			})
			if err == nil {
				return nil
			}
		}
		log.Printf("[Debug] Chart not found, waiting before retry %d/%d", retry+1, maxRetries)
		time.Sleep(2 * time.Second)
	}
	return fmt.Errorf("chart element not found after %d retries", maxRetries)
}
func navigateWithRetry(page *rod.Page, url string) error {
	maxRetries := 3
	for i := 0; i < maxRetries; i++ {
		err := rod.Try(func() {
			page.MustNavigate(url).MustWaitLoad()
		})

		if err == nil {
			return nil
		}

		log.Printf("[Debug] Navigation attempt %d failed: %v", i+1, err)
		time.Sleep(2 * time.Second)
	}
	return fmt.Errorf("failed to navigate after %d attempts", maxRetries)
}

func TradingViewCaptureChartWithTimeframe(page *rod.Page, timeframe string) ([]byte, error) {
	ctx := page.GetContext()

	log.Printf("[Debug] Starting capture for timeframe: %s", timeframe)

	// Click timeframe
	log.Printf("[Debug] Attempting to click timeframe: %s", timeframe)
	timeframeSelectors := []string{
		fmt.Sprintf(`button[data-name="date-range-tab-%s"]`, timeframe),
		fmt.Sprintf(`button[value="%s"]`, timeframe),
		fmt.Sprintf(`.item-SqYYy1zF[data-name="date-range-tab-%s"]`, timeframe),
	}

	clicked := false
	for _, selector := range timeframeSelectors {
		err := rod.Try(func() {
			button := page.MustElement(selector)
			button.MustClick()
			clicked = true
			log.Printf("[Debug] Successfully clicked timeframe with selector: %s", selector)
		})
		if err == nil {
			break
		}
	}

	if !clicked {
		return nil, fmt.Errorf("failed to click timeframe button")
	}

	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	case <-time.After(5 * time.Second):
	}

	_ = page.MustEval(`() => {
        const elementsToHide = document.querySelectorAll('.toast-wrapper, .tv-dialog, [data-dialog-name="gopro"]');
        elementsToHide.forEach(el => {
            if(el) el.style.display = 'none';
        });
    }`)

	log.Print("[Debug] Taking screenshot")
	var screenshot []byte
	maxRetries := 3

	for retry := 0; retry < maxRetries; retry++ {
		err := rod.Try(func() {
			quality := 100
			screenshot, _ = page.Screenshot(true, &proto.PageCaptureScreenshot{
				Format:  proto.PageCaptureScreenshotFormatPng,
				Quality: &quality,
			})
		})

		if err == nil && len(screenshot) > 0 {
			log.Printf("[Debug] Screenshot captured successfully")
			return screenshot, nil
		}

		log.Printf("[Debug] Screenshot attempt %d failed, retrying...", retry+1)
		time.Sleep(2 * time.Second)
	}

	return nil, fmt.Errorf("failed to capture screenshot after %d attempts", maxRetries)
}
