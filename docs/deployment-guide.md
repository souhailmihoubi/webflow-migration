# Production Deployment Guide

This guide outlines the steps to deploy changes to the production environment for both the Backend (AWS App Runner) and Frontend (AWS S3 + CloudFront).

### Prerequisites

- **Docker Desktop** must be running.
- **AWS CLI** must be configured with authorized credentials.

- **AWS CLI** must be configured with authorized credentials.

---

## 0. Database Configuration (Neon)

Before deploying the backend, ensure your production database is ready.

1.  **Create Project:** Go to [Neon.tech](https://neon.tech) and create a project.
2.  **Get Connection String:** Copy the "Pooled Connection String".
3.  **Configure App Runner:**
    - In your App Runner service configuration.
    - Add/Update the Environment Variable `DATABASE_URL`.
    - Paste the Neon connection string.

---

## 1. Backend Deployment (API)

The backend is hosted on **AWS App Runner**, which is configured to **automatically redeploy** whenever a new image is pushed to the Elastic Container Registry (ECR).

### Step 1: Build the API

Compile the NestJS application for production.

```powershell
npx nx build api --configuration=production --skip-nx-cache
```

### Step 2: Build Docker Image

Create a new Docker image from the built artifacts.

```powershell
docker build -f apps/api/Dockerfile -t webflow-migration-api . --no-cache
```

### Step 3: Tag & Push to ECR

Tag the image with your specific ECR repository URI and push it.

```powershell
# Tag
docker tag webflow-migration-api:latest 173763384580.dkr.ecr.eu-west-3.amazonaws.com/webflow-migration-api:latest


#login
aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin 173763384580.dkr.ecr.eu-west-3.amazonaws.com

# Push (Triggers App Runner Deployment)
docker push 173763384580.dkr.ecr.eu-west-3.amazonaws.com/webflow-migration-api:latest
```

> **Note:** Once the push completes, App Runner will detect the new image and start a deployment automatically. This usually takes 3-5 minutes.

---

## 2. Frontend Deployment (Angular)

The frontend is hosted on **AWS S3** as a static website and served via **AWS CloudFront** (CDN) for HTTPS and custom domain support.

### Step 1: Build the Client

Compile the Angular application for production.

```powershell
npx nx build client --configuration=production --skip-nx-cache
```

### Step 2: Upload to S3

Sync the build output folder (`dist/apps/client/browser`) to your S3 bucket.

```powershell
aws s3 sync dist/apps/client/browser s3://webflow-migration-frontend --delete
```

### Step 3: Invalidate CloudFront Cache

To ensure users see the changes immediately (instead of the cached version), you must invalidate the CloudFront cache.

```powershell
aws cloudfront create-invalidation --distribution-id E21DPUJSSE7IEO --paths "/*"
```

```powershell
#check i app runner status command:
aws apprunner list-services --region eu-west-3 --no-cli-pager
```

> **Note:** The invalidation can take a minute or two to fully propagate globally.
