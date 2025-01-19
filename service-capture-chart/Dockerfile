# Build stage
FROM golang:1.23.4-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

# Copy and download dependencies separately to leverage Docker cache
COPY go.mod go.sum ./
RUN go mod download

# Copy source code and build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main -ldflags="-w -s" .

# Final stage
FROM alpine:3.19

# Install Chromium and ChromeDriver
RUN apk add --no-cache chromium chromium-chromedriver

WORKDIR /app

# Copy binary from builder stage
COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]