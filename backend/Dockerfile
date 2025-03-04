FROM node:20

# Install Python and virtual environment
RUN apt-get update && apt-get install -y python3 python3-venv

# Set up pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy dependency files
COPY backend/package.json .
COPY backend/requirements.txt .

# Install Node.js dependencies
RUN pnpm install

# Create Python virtual environment
RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/src ./src

EXPOSE 3000
CMD ["node", "src/server.js"]
