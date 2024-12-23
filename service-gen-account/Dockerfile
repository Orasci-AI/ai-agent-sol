# Sử dụng Node.js LTS làm base image
FROM node:18-alpine

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript thành JavaScript
RUN npm run build

# Expose port 3000 (port mặc định của ứng dụng)
EXPOSE 3000

# Khởi chạy ứng dụng
CMD ["npm", "start"]
