# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the app
COPY . .

# Build the NestJS app
RUN npm run build

# Expose REST API and gRPC ports
EXPOSE 3001 50051

# Start the app (make sure your main.ts handles both REST & gRPC)
CMD ["npm", "run", "start:dev"]