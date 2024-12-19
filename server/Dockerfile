FROM node:20-alpine

WORKDIR /app

# Copy only the package files for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Start the development server
CMD ["npm", "run", "start:dev"]