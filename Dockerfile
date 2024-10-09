# Use the official Node.js image.
FROM node:18-alpine


# Create and change to the app directory.
WORKDIR /usr/src

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install production dependencies.
RUN npm install 

# Copy the rest of your application code.
COPY . .

# Build the NestJS application (if needed)
RUN npm run build

# Run the web service on container startup.
CMD ["npm", "run", "start:dev"]
