# Use official Node.js base image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install dependencies for Chromium (used by Puppeteer)
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use system-installed Chromium (if needed)
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy dependency files early for caching
COPY package*.json ./

# Install dependencies (includes Puppeteer)
RUN npm ci

# Copy the rest of your application
COPY . .

# Build the app (if needed)
RUN npm run build

# Cloud Run listens on port 8080
EXPOSE 8080

# Run the app
CMD ["npm", "start"]
