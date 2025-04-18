FROM node:16-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Set environment variables
ENV NODE_ENV=test

# Define entrypoint
ENTRYPOINT ["npm", "run", "test:sauce"]