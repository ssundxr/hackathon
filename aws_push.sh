#!/bin/bash
# Helper script to build and push the CV Analyzer Docker image to AWS ECR

# Exit on any error
set -e

# Configuration - Update these with your actual AWS details
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="YOUR_ACCOUNT_ID"
ECR_REPO_NAME="cvanalyzer"
IMAGE_TAG="latest"

echo "🚀 Preparing to push CV Analyzer to AWS ECR..."

# 1. Authenticate Docker to your Amazon ECR registry
echo "🔑 Logging into AWS ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# 2. Build the Docker image
echo "📦 Building the Docker image..."
docker build -t $ECR_REPO_NAME .

# 3. Tag the image
echo "🏷️ Tagging the image..."
docker tag $ECR_REPO_NAME:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG

# 4. Push the image to AWS ECR
echo "☁️ Pushing to AWS ECR..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG

echo "✅ Successfully pushed to AWS ECR!"
echo "You can now deploy this image using AWS App Runner, ECS (Fargate), or EC2."
