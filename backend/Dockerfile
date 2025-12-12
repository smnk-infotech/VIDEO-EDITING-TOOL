# Dockerfile for AVEA Backend (Cloud Run)
FROM python:3.11-slim

# Install system dependencies (including FFmpeg as backup)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables
ENV PORT=8080

# Expose port (Cloud Run requires 8080)
EXPOSE 8080

# Command to run the application (using shell form for PORT variable expansion)
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}