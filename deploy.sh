#!/bin/bash
set -e

cd ~/app
git fetch origin development

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/development)

if [ "$LOCAL" = "$REMOTE" ]; then
  echo "[$(date)] Already up to date, skipping deploy."
  exit 0
fi

echo "[$(date)] New commit detected, deploying..."

git pull origin development
npm install

# Stop app before wiping .next so PM2 releases file handles
pm2 stop course3d || true
rm -rf .next

npm run build

pm2 start course3d || pm2 reload course3d

echo "[$(date)] Done" >> ~/deploy.log
