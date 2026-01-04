# Pack API Documentation

## Overview

The Pack API allows managing product bundles that combine exactly 3 products from specific categories:

- **SAM** (slug: "sam")
- **CAC** (slug: "cac")
- **Salon/Séjour** (slug: "salon-sejour")

Pack prices are automatically calculated as **95% of the sum of the 3 products' discount prices** (5% discount).

---

## Public Endpoints

### Get All Packs

**GET** `/api/catalog/packs`

Returns all packs that are visible in the menu.

**Response:**

```json
[
  {
    "id": "uuid",
    "name": "Pack Complet Maison",
    "slug": "pack-complet-maison",
    "description": "Pack complet pour meubler votre maison",
    "mainImage": "https://...",
    "price": 2850.0,
    "showInMenu": true,
    "productSam": {
      "id": "uuid",
      "name": "Canapé SAM",
      "slug": "canape-sam",
      "mainImage": "https://...",
      "price": 1200.0,
      "discountPrice": 1000.0,
      "category": {
        "id": "uuid",
        "name": "SAM",
        "slug": "sam"
      }
    },
    "productCac": {
      "id": "uuid",
      "name": "Table CAC",
      "slug": "table-cac",
      "mainImage": "https://...",
      "price": 800.0,
      "discountPrice": 700.0,
      "category": {
        "id": "uuid",
        "name": "CAC",
        "slug": "cac"
      }
    },
    "productSalon": {
      "id": "uuid",
      "name": "Meuble TV Salon",
      "slug": "meuble-tv-salon",
      "mainImage": "https://...",
      "price": 1500.0,
      "discountPrice": 1300.0,
      "category": {
        "id": "uuid",
        "name": "Salon/Séjour",
        "slug": "salon-sejour"
      }
    },
    "createdAt": "2026-01-04T14:00:00.000Z",
    "updatedAt": "2026-01-04T14:00:00.000Z"
  }
]
```

**Price Calculation:**

```
Sum = 1000 + 700 + 1300 = 3000
Pack Price = 3000 * 0.95 = 2850
```

---

### Get Pack by Slug

**GET** `/api/catalog/packs/:slug`

Returns a single pack by its slug.

**Parameters:**

- `slug` (path): Pack slug

**Response:** Same as single pack object above

**Error Responses:**

- `404 Not Found`: Pack with slug not found

---

## Admin Endpoints

🔒 **Requires Authentication & Admin Role**

### Create Pack

**POST** `/api/admin/packs`

Creates a new pack with automatic price calculation.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "name": "Pack Complet Maison",
  "slug": "pack-complet-maison",
  "description": "Pack complet pour meubler votre maison",
  "mainImage": "https://...",
  "productSamId": "uuid-of-sam-product",
  "productCacId": "uuid-of-cac-product",
  "productSalonId": "uuid-of-salon-product",
  "showInMenu": true
}
```

**Validation:**

- All 3 product IDs must exist
- `productSamId` must reference a product from category "sam"
- `productCacId` must reference a product from category "cac"
- `productSalonId` must reference a product from category "salon-sejour"
- `slug` must be unique

**Response:** Created pack object (same structure as GET)

**Error Responses:**

- `400 Bad Request`: Invalid product categories or missing products
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User is not an admin

---

### Update Pack

**PUT** `/api/admin/packs/:id`

Updates an existing pack. Price is automatically recalculated if products change.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Parameters:**

- `id` (path): Pack ID

**Request Body:** (all fields optional)

```json
{
  "name": "Pack Complet Maison Updated",
  "description": "Description mise à jour",
  "mainImage": "https://...",
  "productSamId": "new-uuid",
  "productCacId": "new-uuid",
  "productSalonId": "new-uuid",
  "showInMenu": false
}
```

**Validation:**

- If any product ID is changed, all 3 products are re-validated
- Category validation applies (same as create)

**Response:** Updated pack object

**Error Responses:**

- `400 Bad Request`: Invalid product categories
- `404 Not Found`: Pack not found
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User is not an admin

---

### Delete Pack

**DELETE** `/api/admin/packs/:id`

Deletes a pack.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Parameters:**

- `id` (path): Pack ID

**Response:**

```json
{
  "id": "uuid",
  "name": "Pack Complet Maison",
  "slug": "pack-complet-maison"
}
```

**Error Responses:**

- `404 Not Found`: Pack not found
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User is not an admin

---

## Business Logic

### Price Calculation

Pack prices are automatically calculated using this formula:

```typescript
packPrice = (productSam.discountPrice + productCac.discountPrice + productSalon.discountPrice) * 0.95;
```

- Uses `discountPrice` if available, otherwise falls back to `price`
- Applies 5% discount (multiplies by 0.95)
- Price is recalculated whenever pack products are updated

### Category Validation

The system enforces that each pack must have exactly one product from each required category:

| Product Field    | Required Category Slug |
| ---------------- | ---------------------- |
| `productSamId`   | `sam`                  |
| `productCacId`   | `cac`                  |
| `productSalonId` | `salon-sejour`         |

Attempting to create or update a pack with products from wrong categories will result in a `400 Bad Request` error.

---

## Usage Examples

### Example 1: Create a Pack

```bash
curl -X POST http://localhost:3000/api/admin/packs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pack Salon Complet",
    "slug": "pack-salon-complet",
    "description": "Tout pour votre salon",
    "productSamId": "abc-123",
    "productCacId": "def-456",
    "productSalonId": "ghi-789"
  }'
```

### Example 2: Get All Packs (Public)

```bash
curl http://localhost:3000/api/catalog/packs
```

### Example 3: Update Pack Price by Changing Products

```bash
curl -X PUT http://localhost:3000/api/admin/packs/pack-uuid \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productSamId": "new-product-uuid"
  }'
```

The price will be automatically recalculated based on the new product combination.
