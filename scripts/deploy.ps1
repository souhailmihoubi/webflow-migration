$ErrorActionPreference = "Stop"

Write-Host "1. Building API..." -ForegroundColor Cyan
npx nx build api --configuration=production --skip-nx-cache
if ($LASTEXITCODE -ne 0) { Write-Error "Build API failed"; exit 1 }

Write-Host "2. Building Client..." -ForegroundColor Cyan
npx nx build client --configuration=production --skip-nx-cache
if ($LASTEXITCODE -ne 0) { Write-Error "Build Client failed"; exit 1 }

Write-Host "3. Logging into ECR..." -ForegroundColor Cyan
aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin 173763384580.dkr.ecr.eu-west-3.amazonaws.com
if ($LASTEXITCODE -ne 0) { Write-Error "Docker login failed"; exit 1 }

Write-Host "4. Syncing S3..." -ForegroundColor Cyan
aws s3 sync dist/apps/client/browser s3://webflow-migration-frontend --delete
if ($LASTEXITCODE -ne 0) { Write-Error "S3 sync failed"; exit 1 }

Write-Host "5. Invalidating CloudFront..." -ForegroundColor Cyan
aws cloudfront create-invalidation --distribution-id E21DPUJSSE7IEO --paths "/*"
if ($LASTEXITCODE -ne 0) { Write-Error "CloudFront invalidation failed"; exit 1 }

Write-Host "6. Building Docker Image..." -ForegroundColor Cyan
docker build -f apps/api/Dockerfile -t webflow-migration-api . --no-cache
if ($LASTEXITCODE -ne 0) { Write-Error "Docker build failed"; exit 1 }

Write-Host "7. Tagging Docker Image..." -ForegroundColor Cyan
docker tag webflow-migration-api:latest 173763384580.dkr.ecr.eu-west-3.amazonaws.com/webflow-migration-api:latest
if ($LASTEXITCODE -ne 0) { Write-Error "Docker tag failed"; exit 1 }

Write-Host "8. Pushing Docker Image..." -ForegroundColor Cyan
docker push 173763384580.dkr.ecr.eu-west-3.amazonaws.com/webflow-migration-api:latest
if ($LASTEXITCODE -ne 0) { Write-Error "Docker push failed"; exit 1 }

Write-Host "Deployment completed successfully!" -ForegroundColor Green
