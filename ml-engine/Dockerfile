# ml-engine/Dockerfile
# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Install system dependencies (if any are needed for your ML libraries)
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     build-essential \
#     && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Expose the port the app runs on (should match .env and docker-compose)
EXPOSE ${ML_ENGINE_PORT}

# Command to run the application using Gunicorn
# The number of workers can be tuned based on your server resources
# For development, you might run Flask directly: CMD ["python", "app.py"]
CMD ["gunicorn", "--bind", "0.0.0.0:${ML_ENGINE_PORT}", "app:app"]
