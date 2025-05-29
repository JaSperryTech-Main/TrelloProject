# Stage 1: Build the Vite app
FROM node:20 AS build

WORKDIR /app

# Declare VITE_BACKEND_URL as a build argument
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the app (Vite will read VITE_BACKEND_URL from ENV)
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Use custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files to Nginx's HTML dir
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
