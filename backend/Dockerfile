FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy TypeScript config
COPY tsconfig.json ./

# Copy source code
COPY src ./src

# Install TypeScript and tsx for runtime execution
RUN npm install -D typescript tsx

# Create uploads directory
RUN mkdir -p uploads/screenshots

# Expose port
EXPOSE 3001

# Start the app with tsx (TypeScript runtime)
CMD ["npx", "tsx", "src/server.ts"]
