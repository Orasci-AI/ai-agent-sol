
FROM golang:1.23.4-bullseye
WORKDIR /app
RUN apt-get update && apt-get install -y \
   chromium \
   chromium-driver \
   && rm -rf /var/lib/apt/lists/*
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main .
EXPOSE 8080
CMD ["./main"]