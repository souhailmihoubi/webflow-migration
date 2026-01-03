# Admin Dashboard API Documentation

## Base URL

`http://localhost:3000/api/admin`

## Overview

All admin endpoints require **Admin authentication** (JWT + Admin role).

---

## Dashboard & Statistics

### Get Dashboard Statistics

**GET** `/dashboard/stats`

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Response:**

```json
{
  "stats": {
    "totalProducts": 45,
    "totalCategories": 8,
    "totalUsers": 120,
    "totalOrders": 89,
    "totalRevenue": "15450.75",
    "pendingOrders": 5
  },
  "recentOrders": [
    {
      "id": "uuid",
      "totalAmount": "299.99",
      "status": "PENDING",
      "createdAt": "2026-01-03T12:00:00.000Z",
      "user": {
        "id": "uuid",
        "email": "customer@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      "items": [
        {
          "id": "uuid",
          "quantity": 1,
          "priceAtTime": "299.99",
          "product": {
            "id": "uuid",
            "name": "Abstract Painting",
            "mainImage": "http://localhost:3000/uploads/products/img.jpg"
          }
        }
      ]
    }
  ],
  "recentProducts": [
    {
      "id": "uuid",
      "name": "New Artwork",
      "price": "450.00",
      "mainImage": "http://localhost:3000/uploads/products/img.jpg",
      "showInMenu": true
    }
  ]
}
```

**Usage:**
Display on admin dashboard homepage with key metrics, recent activity, and quick access to pending orders.

---

## User Management

### Get All Users

**GET** `/users`

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Response:**

```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+1234567890",
    "role": "CUSTOMER",
    "createdAt": "2026-01-01T10:00:00.000Z",
    "_count": {
      "orders": 3
    }
  },
  {
    "id": "uuid",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "phone": null,
    "role": "ADMIN",
    "createdAt": "2025-12-01T10:00:00.000Z",
    "_count": {
      "orders": 0
    }
  }
]
```

---

### Get User By ID

**GET** `/users/:id`

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Response:**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1234567890",
  "role": "CUSTOMER",
  "createdAt": "2026-01-01T10:00:00.000Z",
  "orders": [
    {
      "id": "uuid",
      "totalAmount": "299.99",
      "status": "DELIVERED",
      "createdAt": "2026-01-02T15:30:00.000Z",
      "items": [
        {
          "quantity": 1,
          "priceAtTime": "299.99",
          "product": {
            "name": "Abstract Painting",
            "mainImage": "http://localhost:3000/uploads/products/img.jpg"
          }
        }
      ]
    }
  ]
}
```

---

### Update User Role

**PUT** `/users/:id/role`

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "role": "ADMIN"
}
```

**Valid Roles:**

- `"ADMIN"` - Grant admin privileges
- `"CUSTOMER"` - Regular customer role

**Response:**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "ADMIN"
}
```

**Use Case:** Promote a customer to admin or demote an admin to customer.

---

## Complete Admin Dashboard Endpoints Summary

### Dashboard

- `GET /api/admin/dashboard/stats` - Dashboard statistics

### User Management

- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id/role` - Update user role

### Product Management (via Catalog)

- `GET /api/catalog/products` - List products
- `GET /api/catalog/products/:id` - Get product
- `POST /api/catalog/products` - Create product
- `PUT /api/catalog/products/:id` - Update product
- `DELETE /api/catalog/products/:id` - Delete product

### Category Management (via Catalog)

- `GET /api/catalog/categories` - List categories
- `GET /api/catalog/categories/:id` - Get category
- `POST /api/catalog/categories` - Create category
- `PUT /api/catalog/categories/:id` - Update category
- `DELETE /api/catalog/categories/:id` - Delete category

### Order Management (via Order)

- `GET /api/order/admin/orders` - List all orders
- `PUT /api/order/admin/orders/:id/status` - Update order status

### Image Upload

- `POST /api/upload/product-image` - Upload product image
- `POST /api/upload/product-images` - Upload multiple product images
- `POST /api/upload/category-image` - Upload category image

---

## Error Responses

**403 Forbidden** (Not an admin):

```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```

**401 Unauthorized** (No token or invalid):

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

**404 Not Found** (User doesn't exist):

```json
{
  "message": "User not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## Frontend Integration Tips

**Dashboard Homepage:**

1. Call `/admin/dashboard/stats` on load
2. Display stats in cards (Total Revenue, Orders, Products, Users)
3. Show recent orders table with status badges
4. Show recent products with quick edit links

**User Management Page:**

1. Call `/admin/users` to list all users
2. Display in table with: Email, Role, Order Count, Join Date
3. Add "View Details" button → calls `/admin/users/:id`
4. Add "Change Role" dropdown → calls `PUT /admin/users/:id/role`

**Order Management:**

- Link to `/api/order/admin/orders` (already implemented)
- Filter by status, update status inline

**Product/Category CRUD:**

- Use existing catalog endpoints
- Upload images first, then attach URLs when creating/updating
