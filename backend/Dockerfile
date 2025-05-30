# backend/Dockerfile
# Use an official Node.js runtime as a parent image
FROM node:18-alpine As development

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE ${PORT}

# --- Production Build ---
FROM node:18-alpine As production

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=development /app /app

EXPOSE ${PORT}

# Command to run the application
CMD ["node", "server.js"]