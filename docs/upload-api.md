# Image Upload API Documentation - Local Storage

## Base URL

`http://localhost:3000/api/upload`

## Overview

All upload endpoints require **Admin authentication**. Images are stored locally in the `/uploads` directory with automatic optimization.

**Image Optimization:**

- Max dimensions: 1200x1200px
- Auto-compression (85% quality JPEG)
- Max file size: 5MB per image

**Storage:**

- **FREE!** No cloud costs
- Images stored in `/uploads/products/` and `/uploads/categories/`
- Accessible at `http://localhost:3000/uploads/{folder}/{filename}`

**Migration Path:**

- Start with local storage (free)
- Later migrate to AWS S3 (just update UploadService)
- Image URLs stored in database make migration seamless

---

## Endpoints

### 1. Upload Product Image (Single)

**POST** `/product-image`

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
Content-Type: multipart/form-data
```

**Body (Form Data):**

- `file`: Image file (JPG, JPEG, PNG, GIF, WebP)

**Response:**

```json
{
  "url": "http://localhost:3000/uploads/products/abc123-uuid.jpg"
}
```

---

### 2. Upload Multiple Product Images

**POST** `/product-images`

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
Content-Type: multipart/form-data
```

**Body (Form Data):**

- `files`: Multiple image files (up to 5 images)

**Response:**

```json
{
  "urls": ["http://localhost:3000/uploads/products/img1-uuid.jpg", "http://localhost:3000/uploads/products/img2-uuid.jpg"]
}
```

---

### 3. Upload Category Image

**POST** `/category-image`

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
Content-Type: multipart/form-data
```

**Body (Form Data):**

- `file`: Image file

**Response:**

```json
{
  "url": "http://localhost:3000/uploads/categories/category-uuid.jpg"
}
```

---

## Setup (Already Done!)

**No setup required!** 🎉

The `/uploads` directory is created automatically when you upload the first image.

**In your `.env`:**

```env
API_BASE_URL=http://localhost:3000
```

For production, change to your domain:

```env
API_BASE_URL=https://api.lartistou.com
```

---

## File Structure

```
webflow-migration/
├── uploads/              # Created automatically
│   ├── products/        # Product images
│   │   ├── uuid1.jpg
│   │   └── uuid2.jpg
│   └── categories/      # Category images
│       └── uuid3.jpg
└── apps/
    └── api/
```

---

## Usage Workflow

### Creating a Product with Images

1. **Upload images first:**

   ```
   POST /api/upload/product-image
   → Get URL: http://localhost:3000/uploads/products/abc.jpg

   POST /api/upload/product-images
   → Get URLs: [img1.jpg, img2.jpg]
   ```

2. **Create product with URLs:**
   ```json
   POST /api/catalog/products
   {
     "name": "Abstract Painting",
     "mainImage": "http://localhost:3000/uploads/products/abc.jpg",
     "multiImages": [
       "http://localhost:3000/uploads/products/img1.jpg"
     ],
     "price": 299.99,
     "categoryId": "uuid"
   }
   ```

---

## Testing with Postman

1. **Get admin token:**
   - POST `/api/auth/login` with admin credentials
   - Copy `accessToken`

2. **Upload image:**
   - POST `/api/upload/product-image`
   - Headers: `Authorization: Bearer <token>`
   - Body → form-data → `file` → select image
   - Send

3. **Copy URL from response**

4. **Test URL:**
   - Open `http://localhost:3000/uploads/products/{filename}` in browser
   - Image should load!

---

## Production Deployment

### Option 1: Keep Local Storage

**Pros:**

- Free
- Simple

**Cons:**

- Not ideal for multiple servers (need shared storage)
- Server restart might affect uploads

### Option 2: Migrate to AWS S3 (Recommended when traffic grows)

**When to migrate:**

- High traffic (100GB+/month bandwidth)
- Multiple servers/containers
- Want CDN for faster worldwide delivery

**Migration steps:**

1. Update `UploadService` to use S3 SDK
2. Set AWS credentials in `.env`
3. No database changes needed! (URLs stored as strings)

**Cost:** ~$8/month for 100GB bandwidth

---

## Docker Deployment

**Add to `.dockerignore`:**

```
uploads/
```

**Mount uploads as volume in `docker-compose.yml`:**

```yaml
services:
  api:
    volumes:
      - ./uploads:/app/uploads
```

This persists uploaded images even when container restarts.

---

## Git

**Already configured in `.gitignore`:**

```
uploads/
```

Uploaded images won't be committed to Git (good practice).

---

## Advantages of This Approach

✅ **FREE** - No cloud costs
✅ **Simple** - No AWS/Cloudinary setup
✅ **Fast** - Local disk I/O is fast
✅ **Easy migration** - Switch to S3 anytime by updating UploadService
✅ **MVP-ready** - Perfect for launch

---

## When to Migrate to S3

Migrate when you have:

- Multiple servers/containers (need shared storage)
- High bandwidth (100GB+/month)
- International users (benefit from CDN)
- Money to invest in infrastructure 💰

Until then, **local storage is perfect!**
