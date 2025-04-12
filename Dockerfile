FROM node:20-buster
# Set the working directory in the container
WORKDIR /app

# Install dependencies for Chromium and Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libfreetype6 \
    fontconfig \
    ttf-dejavu \
    libx11-6 \
    libxkbfile1 \
    libsecret-1-0 \
    libxss1 \
    dbus \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    pango1.0-0 \
    libgdk-pixbuf2.0-0 \
    libcups2 \
    libxtst6 \
    && apt-get clean

# Set the environment variable for Puppeteer to know where to find Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm","start"]