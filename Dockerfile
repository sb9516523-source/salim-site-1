# Use Node.js runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose port (Cloud Run requirement)
EXPOSE 8080

# Set environment
ENV PORT=8080 NODE_ENV=production

# Start application
CMD ["node", "server.js"]
