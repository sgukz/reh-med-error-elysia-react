#!/bin/bash

echo "🔄 Detect changes all file and Rebuilding..."

echo "⬇️ Pulling latest changes..."
git pull origin master


docker compose up -d --build --force-recreate

echo "⏳ Cleaning up old images..."
docker image prune -f

echo "✅ Code Updated & Running!"
docker compose ps