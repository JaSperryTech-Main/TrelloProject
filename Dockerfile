# Stage 1: Build frontend
FROM node:20 AS frontend-builder

WORKDIR /app

# Copy frontend files
COPY frontend/package*.json ./frontend/
COPY frontend/ ./frontend/

# Set backend URL for frontend build
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Stage 2: Main image
FROM node:20

# Install Python
RUN apt-get update && apt-get install -y python3 python3-venv

# Set up pnpm
RUN npm install -g pnpm

WORKDIR /app

# Backend dependencies
COPY backend/package.json ./backend/
COPY backend/requirements.txt ./backend/

WORKDIR /app/backend
RUN pnpm install

# Set up Python virtual environment
RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/src ./src

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 3000

CMD ["node", "src/server.js"]
