# Order & Cart API Documentation

## Base URL

`http://localhost:3000/api/orders`

## Cart Management (All require JWT authentication)

### 1. Get Cart

**GET** `/cart`

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "id": "cart-uuid",
  "userId": "user-uuid",
  "updatedAt": "2026-01-03T14:00:00.000Z",
  "items": [
    {
      "id": "item-uuid",
      "productId": "product-uuid",
      "quantity": 2,
      "product": {
        "id": "product-uuid",
        "name": "Abstract Art",
        "slug": "abstract-art",
        "mainImage": "https://example.com/image.jpg",
        "price": "299.99",
        "discountPrice": "249.99",
        "category": {
          "name": "Paintings"
        }
      }
    }
  ],
  "subtotal": 499.98,
  "itemCount": 2
}
```

---

### 2. Add Item to Cart

**POST** `/cart/items`

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Body:**

```json
{
  "productId": "product-uuid",
  "quantity": 2
}
```

**Response:** Updated cart object

**Note:** If product already exists in cart, quantities are added together.

---

### 3. Update Cart Item Quantity

**PUT** `/cart/items/:itemId`

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Body:**

```json
{
  "quantity": 3
}
```

**Response:** Updated cart object

---

### 4. Remove Item from Cart

**DELETE** `/cart/items/:itemId`

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:** Updated cart object

---

### 5. Clear Cart

**DELETE** `/cart`

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "message": "Cart cleared successfully"
}
```

---

## Order Management

### 1. Place Order (Requires JWT)

**POST** `/`

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "shippingAddress": "123 Main St, Apt 4",
  "city": "Casablanca",
  "remarks": "Please call before delivery"
}
```

**Response:**

```json
{
  "id": "order-uuid",
  "userId": "user-uuid",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "shippingAddress": "123 Main St, Apt 4",
  "city": "Casablanca",
  "totalPrice": "499.98",
  "remarks": "Please call before delivery",
  "status": "PENDING",
  "createdAt": "2026-01-03T14:00:00.000Z",
  "updatedAt": "2026-01-03T14:00:00.000Z",
  "items": [
    {
      "id": "item-uuid",
      "productId": "product-uuid",
      "quantity": 2,
      "priceAtTime": "249.99",
      "product": {
        "id": "product-uuid",
        "name": "Abstract Art",
        "mainImage": "https://example.com/image.jpg",
        "category": {
          "name": "Paintings"
        }
      }
    }
  ]
}
```

**Order Flow:**

1. Cart items are converted to order items
2. Prices are locked in at current value (`priceAtTime`)
3. Total is calculated
4. Cart is automatically cleared
5. Order status starts as `PENDING`

---

### 2. Get User Orders (Requires JWT)

**GET** `/`

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
[
  {
    "id": "order-uuid",
    "userId": "user-uuid",
    "firstName": "John",
    "lastName": "Doe",
    "totalPrice": "499.98",
    "status": "PENDING",
    "createdAt": "2026-01-03T14:00:00.000Z",
    "items": [
      {
        "id": "item-uuid",
        "quantity": 2,
        "priceAtTime": "249.99",
        "product": {
          "name": "Abstract Art"
        }
      }
    ]
  }
]
```

---

### 3. Get Order by ID (Requires JWT)

**GET** `/:id`

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:** Single order object with all details

---

## Admin Order Management

### 1. Get All Orders (Admin Only)

**GET** `/admin/all`

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Response:**

```json
[
  {
    "id": "order-uuid",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "shippingAddress": "123 Main St, Apt 4",
    "city": "Casablanca",
    "totalPrice": "499.98",
    "remarks": "Please call before delivery",
    "status": "PENDING",
    "createdAt": "2026-01-03T14:00:00.000Z",
    "user": {
      "id": "user-uuid",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "items": [
      {
        "id": "item-uuid",
        "quantity": 2,
        "priceAtTime": "249.99",
        "product": {
          "name": "Abstract Art",
          "slug": "abstract-art"
        }
      }
    ]
  }
]
```

---

### 2. Update Order Status (Admin Only)

**PATCH** `/:id/status`

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Body:**

```json
{
  "status": "CONFIRMED"
}
```

**Valid Statuses:**

- `PENDING` - Order received, awaiting confirmation
- `CONFIRMED` - Order confirmed by admin
- `SHIPPED` - Order has been shipped
- `DELIVERED` - Order delivered to customer
- `CANCELLED` - Order cancelled

**Response:** Updated order object

---

## Order Workflow

1. **Customer browses** products (Public endpoints)
2. **Customer adds to cart** (JWT required)
3. **Customer reviews cart** and updates quantities
4. **Customer places order** with shipping details
5. **Admin reviews** order in admin panel
6. **Admin calls customer** to confirm and process payment
7. **Admin updates status** to CONFIRMED → SHIPPED → DELIVERED

---

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Cart is empty"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Cart item not found"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Admin access required"
}
```
