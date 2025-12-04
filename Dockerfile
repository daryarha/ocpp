FROM node:18-alpine

# Install bash (optional, sometimes helps with scripts)
RUN apk add --no-cache bash

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./ 

# Install dependencies
RUN npm install

# Expose API port (if server runs on 3000)
EXPOSE 3000

# Use npm scripts via npx to ensure ts-node-dev is found
CMD ["npx", "ts-node-dev", "-r", "tsconfig-paths/register", "src/index.ts"]
