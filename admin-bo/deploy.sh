#!/bin/bash

# TzavRishon Admin BO - Docker Build and Push Script
# Usage: ./deploy.sh YOUR_DOCKERHUB_USERNAME

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker Hub username is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Docker Hub username not provided${NC}"
    echo "Usage: ./deploy.sh YOUR_DOCKERHUB_USERNAME"
    echo "Example: ./deploy.sh johndoe"
    exit 1
fi

DOCKERHUB_USERNAME=$1
IMAGE_NAME="tzavrishon-admin-bo"
FULL_IMAGE_NAME="${DOCKERHUB_USERNAME}/${IMAGE_NAME}:latest"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}TzavRishon Admin BO Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Docker Hub Username: ${YELLOW}${DOCKERHUB_USERNAME}${NC}"
echo -e "Image Name: ${YELLOW}${FULL_IMAGE_NAME}${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Check if logged in to Docker Hub
echo -e "${YELLOW}Checking Docker Hub login...${NC}"
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}Not logged in to Docker Hub. Please login:${NC}"
    docker login
fi

# Build the image
echo ""
echo -e "${YELLOW}Building Docker image for linux/amd64...${NC}"
docker build --platform linux/amd64 -t "${FULL_IMAGE_NAME}" .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

# Push to Docker Hub
echo ""
echo -e "${YELLOW}Pushing image to Docker Hub...${NC}"
docker push "${FULL_IMAGE_NAME}"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Push successful${NC}"
else
    echo -e "${RED}✗ Push failed${NC}"
    exit 1
fi

# Success message
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Image: ${YELLOW}${FULL_IMAGE_NAME}${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Go to https://dashboard.render.com"
echo "2. Create a new Web Service"
echo "3. Deploy from registry: ${FULL_IMAGE_NAME}"
echo "4. Set environment variables (see RENDER_DEPLOYMENT.md)"
echo "5. Deploy!"
echo ""
echo -e "${GREEN}For detailed instructions, see RENDER_DEPLOYMENT.md${NC}"

