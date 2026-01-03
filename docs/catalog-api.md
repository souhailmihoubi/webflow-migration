# Catalog API Documentation

## Base URL

`http://localhost:3000/api/catalog`

## Categories

### 1. Get All Categories

**GET** `/categories`

**Response:**

```json
[
  {
    "id": "uuid",
    "name": "Paintings",
    "slug": "paintings",
    "image": "https://example.com/image.jpg",
    "showInHomePage": true,
    "createdAt": "2026-01-03T12:00:00.000Z",
    "_count": {
      "products": 15
    }
  }
]
```

---

### 2. Get Category by ID

**GET** `/categories/:id`

**Response:**

```json
{
  "id": "uuid",
  "name": "Paintings",
  "slug": "paintings",
  "image": "https://example.com/image.jpg",
  "showInHomePage": true,
  "createdAt": "2026-01-03T12:00:00.000Z",
  "products": [
    {
      "id": "uuid",
      "name": "Abstract Art",
      "slug": "abstract-art",
      "price": "299.99",
      "mainImage": "https://example.com/product.jpg"
    }
  ]
}
```

---

### 3. Get Category by Slug

**GET** `/categories/slug/:slug`

**Response:** Same as Get Category by ID

---

### 4. Create Category (Admin Only)

**POST** `/categories`

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Body:**

```json
{
  "name": "Paintings",
  "slug": "paintings",
  "image": "https://example.com/image.jpg",
  "showInHomePage": true
}
```

**Response:**

```json
{
  "id": "uuid",
  "name": "Paintings",
  "slug": "paintings",
  "image": "https://example.com/image.jpg",
  "showInHomePage": true,
  "createdAt": "2026-01-03T12:00:00.000Z"
}
```

---

### 5. Update Category (Admin Only)

**PUT** `/categories/:id`

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Body:**

```json
{
  "name": "Modern Paintings",
  "showInHomePage": false
}
```

**Response:** Updated category object

---

### 6. Delete Category (Admin Only)

**DELETE** `/categories/:id`

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Response:**

```json
{
  "message": "Category deleted successfully"
}
```

**Note:** Cannot delete categories with existing products.

---

## Products

### 1. Get All Products (with Search & Filters)

**GET** `/products`

**Query Parameters:**

- `search` (optional): Search by product name or description
- `categoryId` (optional): Filter by category UUID
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `visible` (optional): `true` to show only visible products (showInMenu=true), `false` for hidden only

**Examples:**

Search for "painting":

```
GET /api/catalog/products?search=painting
```

Filter by category:

```
GET /api/catalog/products?categoryId=uuid-here
```

Price range (100-500):

```
GET /api/catalog/products?minPrice=100&maxPrice=500
```

Visible products only:

```
GET /api/catalog/products?visible=true
```

Combined filters:

```
GET /api/catalog/products?search=abstract&categoryId=uuid&minPrice=200&visible=true
```

**Response:**

```json
[
  {
    "id": "uuid",
    "name": "Abstract Art Painting",
    "slug": "abstract-art-painting",
    "mainImage": "https://example.com/main.jpg",
    "multiImages": ["https://example.com/img1.jpg"],
    "priceDetails": "Original artwork on canvas",
    "productDescription": "Beautiful abstract painting...",
    "caracteristiques": "Size: 60x80cm, Medium: Acrylic",
    "price": "299.99",
    "discountPrice": "249.99",
    "showInMenu": true,
    "videoLink": "https://instagram.com/reel/abc123",
    "createdAt": "2026-01-03T12:00:00.000Z",
    "updatedAt": "2026-01-03T12:00:00.000Z",
    "category": {
      "id": "uuid",
      "name": "Paintings",
      "slug": "paintings"
    },
    "categoryId": "uuid"
  }
]
```

---

### 2. Get Product by ID

**GET** `/products/:id`

**Response:** Single product object with category included

---

### 3. Get Product by Slug

**GET** `/products/slug/:slug`

**Response:** Single product object with category included

---

### 4. Create Product (Admin Only)

**POST** `/products`

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Body:**

```json
{
  "name": "Abstract Art Painting",
  "slug": "abstract-art-painting",
  "mainImage": "https://example.com/main.jpg",
  "multiImages": ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
  "priceDetails": "Original artwork on canvas",
  "productDescription": "Beautiful abstract painting with vibrant colors...",
  "caracteristiques": "Size: 60x80cm\nMedium: Acrylic\nFrame: Included",
  "price": 299.99,
  "discountPrice": 249.99,
  "showInMenu": true,
  "videoLink": "https://instagram.com/reel/abc123",
  "categoryId": "uuid-of-category"
}
```

**Response:** Created product object with category

---

### 5. Update Product (Admin Only)

**PUT** `/products/:id`

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Body:**

```json
{
  "price": 279.99,
  "discountPrice": 229.99,
  "showInMenu": false
}
```

**Response:** Updated product object with category

---

### 6. Delete Product (Admin Only)

**DELETE** `/products/:id`

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Response:**

```json
{
  "message": "Product deleted successfully"
}
```

---

## Authorization

### Public Endpoints (No Auth Required)

- GET all categories
- GET category by ID/slug
- GET all products
- GET product by ID/slug

### Admin-Only Endpoints (Requires Admin JWT)

- POST/PUT/DELETE categories
- POST/PUT/DELETE products

**Getting Admin Access:**

1. Register a user with `"role": "ADMIN"`
2. Login to get JWT token
3. Include `Authorization: Bearer <token>` header in protected requests

---

## Error Responses

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Product not found"
}
```

### 409 Conflict

```json
{
  "statusCode": 409,
  "message": "Product with this slug already exists"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Admin access required"
}
```

### 409 Cannot Delete

```json
{
  "statusCode": 409,
  "message": "Cannot delete category with existing products"
}
```
