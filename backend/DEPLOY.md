
# Deployment Guide

This guide explains how to deploy the API using Docker Compose and how to customize the configuration (Environment variables, Port).

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1.  **Clone the repository** (or ensure you have the project files).
2.  **Create/Update `.env` file**:
    You can use `.env.example` (if available) or create a new `.env` file.
    Ensure you set the `PORT` variable if you want to change the internal listening port.

    ```env
    PORT=8003
    MODE=PROD
    # ... other variables
    ```
3.  **Run with Docker Compose**:

    ```bash
    docker-compose up -d
    ```

## Customizing Configuration
The application now uses `env_file` to load configurations directly from `.env`.

1. **Port**: Set `PORT=8003` (or your desired port) in `.env`. The `docker-compose.yml` is configured to map `${PORT}:${PORT}`, so changing it in `.env` effectively changes both the container port and the exposed host port.
2. **Database**: Update `DB_HOST`, `DB_USER`, `DB_PASSWORD`, etc., in `.env`.
3. **Re-deploy**: After changing `.env`, run `docker-compose up -d` to apply changes.


## Updating Environment Variables

To update any environment variable (e.g., Database credentials):

1.  Modify your `.env` file.
2.  Recreate the container:
    ```bash
    docker-compose up -d --force-recreate
    ```
    This will pick up the new environment variables without rebuilding the image (unless you changed build arguments).

## Building the Image

If you modify the source code, you must rebuild the image:

```bash
docker-compose build
docker-compose up -d
```

## Building & Pushing to Docker Hub

To publish the image to Docker Hub so it can be deployed on other servers.

### 1. Build the Image
```bash
# Build with a specific version tag (e.g., 1.3.6)
docker build -t sgukz/api-med-error-node22-bun-elysia-prod:1.3.6 .

# Also tag as latest
docker tag sgukz/api-med-error-node22-bun-elysia-prod:1.3.6 sgukz/api-med-error-node22-bun-elysia-prod:latest
```

### 2. Login to Docker Hub
```bash
docker login
```

### 3. Push the Image
```bash
# Push both tags
docker push sgukz/api-med-error-node22-bun-elysia-prod:1.3.6
docker push sgukz/api-med-error-node22-bun-elysia-prod:latest
```

## Production Deployment on Server

To deploy on a real server using the built Docker image.

### 1. Prerequisites
- Server with **Docker** and **Docker Compose** installed.
- Access to the Docker Hub repository (if private).

### 2. File Preparation
Create a folder on your server (e.g., `/opt/med-error-api`) and create two files:

**`docker-compose.yml`**
**`docker-compose.yml`**
```yaml
services:
  api:
    image: sgukz/api-med-error-node22-bun-elysia-prod:latest # or specific tag like 1.3.6
    container_name: api-med-error-prod
    restart: always
    
    # Load all environment variables from .env file
    env_file:
      - .env

    environment:
      - PORT=${PORT:-8003}
      - MODE=PROD

    ports:
      - "${PORT:-8003}:8003"
    logging:
      driver: "json-file"
      options:
        max-size: "20m"
        max-file: "5"
```

**`.env`**
```env
PORT=8003
DB_HOST=192.168.x.x
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_db
# ... other variables from your config
```

### 3. Deploy/Verify

Run the following commands in the folder:

```bash
# 1. Login to Docker Hub (only needed once if private)
docker login

# 2. Pull the latest image
docker-compose pull

# 3. Start the service
docker-compose up -d

# 4. Check logs
docker-compose logs -f
```

### 4. How to Update

To update to a new version:

```bash
docker-compose pull      # Pull the new image
docker-compose up -d     # Recreate container with new image
docker image prune -f    # Clean up old images (optional)
```
