FROM node:22-alpine
RUN apk update && apk add --no-cache openssl
WORKDIR /app

# Copy pruned package config from local build
COPY dist/apps/api/package.json ./

# Install production dependencies and specific prisma version in one go to avoid caching issues
RUN npm install --omit=dev && npm install @prisma/client && npm install prisma@5.22.0

# Generate Prisma Client for the container OS
COPY prisma ./prisma
RUN npx prisma generate

# Copy built application code
COPY dist/apps/api ./dist

# Run the application
CMD ["node", "dist/main.js"]
