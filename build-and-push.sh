#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ECR_REPOSITORY_NAME="url-shortener"

echo -e "${GREEN}Starting build and push process...${NC}"

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to get AWS account ID. Make sure AWS CLI is configured.${NC}"
    exit 1
fi

if [ -z "${AWS_REGION}"]; then
    echo -e "${RED}Error: AWS_REGION is not set.${NC}"
    exit 1
fi

ECR_REPOSITORY_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shortener/${ECR_REPOSITORY_NAME}"

echo -e "${YELLOW}AWS Account ID: ${AWS_ACCOUNT_ID}${NC}"
echo -e "${YELLOW}AWS Region: ${AWS_REGION}${NC}"
echo -e "${YELLOW}ECR Repository URI: ${ECR_REPOSITORY_URI}${NC}"

# Login to ECR
echo -e "${GREEN}Logging in to Amazon ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPOSITORY_URI}

# Build the Docker image
echo -e "${GREEN}Building Docker image...${NC}"
docker build -t ${ECR_REPOSITORY_NAME}:latest .

# Tag the image for ECR
echo -e "${GREEN}Tagging image for ECR...${NC}"
docker tag ${ECR_REPOSITORY_NAME}:latest ${ECR_REPOSITORY_URI}:latest

# Push the image to ECR
echo -e "${GREEN}Pushing image to ECR...${NC}"
docker push ${ECR_REPOSITORY_URI}:latest

echo -e "${GREEN}Build and push completed successfully!${NC}"
echo -e "${YELLOW}Image URI: ${ECR_REPOSITORY_URI}:latest${NC}"
