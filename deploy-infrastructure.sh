#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting CDK deployment...${NC}"

# Check if CDK is installed
if ! command -v cdk &> /dev/null; then
    echo -e "${RED}Error: AWS CDK is not installed. Please install it first:${NC}"
    echo -e "${YELLOW}npm install -g aws-cdk${NC}"
    exit 1
fi

# Navigate to CDK directory
cd cdk

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${GREEN}Installing CDK dependencies...${NC}"
    npm install
fi

# Build the CDK app
echo -e "${GREEN}Building CDK app...${NC}"
npm run build

# Deploy the stack
echo -e "${GREEN}Deploying infrastructure...${NC}"
cdk deploy

echo -e "${GREEN}Infrastructure deployment completed!${NC}"
echo -e "${YELLOW}Check the outputs above for important information like:${NC}"
echo -e "${YELLOW}- Load Balancer DNS name${NC}"
echo -e "${YELLOW}- ECR Repository URI${NC}"
echo -e "${YELLOW}- Bastion Host IP${NC}"
echo -e "${YELLOW}- Database Endpoint${NC}"
