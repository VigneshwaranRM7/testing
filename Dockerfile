# Use official Node.js image
FROM node:18-slim

# Create app directory
WORKDIR /app

# Install app dependencies
# Only copy package.json first to leverage Docker layer caching
COPY package*.json ./

RUN npm ci --omit=dev

# Bundle app source
COPY . .

# Expose the port (adjust if needed)
EXPOSE 8080

# Start your app (adjust based on your start script)
CMD [ "npm", "start" ]
