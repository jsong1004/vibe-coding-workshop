#!/bin/bash

# Deployment script for Google Cloud Run via Cloud Build
echo "Starting deployment..."

PROJECT_ID="cloud-66c6b"
REGION="us-west1"
SERVICE_NAME="ai-idea-generator-ko"
IMAGE_TAG=${1:-$(git rev-parse --short HEAD)}

# Submit build to Cloud Build
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions=SHORT_SHA=$IMAGE_TAG \
  --project $PROJECT_ID

echo "Deployment triggered for $SERVICE_NAME with image tag $IMAGE_TAG in project $PROJECT_ID ($REGION)" 