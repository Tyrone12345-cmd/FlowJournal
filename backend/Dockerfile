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

# Build TypeScript
RUN npm install -D typescript tsx
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads/screenshots

# Expose port
EXPOSE 3001

# Start the app
CMD ["npm", "start"]
