# Specify the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port on which the application will run
EXPOSE 8081

ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI
# Start the application
CMD [ "npm", "start" ]

