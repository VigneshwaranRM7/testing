# Use official slim version of Node.js
FROM node:18-slim

# Create and set working directory
WORKDIR /app

# Copy only package files first (for caching)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy rest of the application code
COPY . .

# Expose the port Cloud Run will listen on
EXPOSE 8080

# Start the app using the production script
CMD ["npm", "start"]
