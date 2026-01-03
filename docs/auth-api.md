# Authentication API Documentation

## Base URL

`http://localhost:3000/api/auth`

## Endpoints

### 1. Register

**POST** `/register`

**Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "CUSTOMER"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER"
  }
}
```

---

### 2. Login

**POST** `/login`

**Body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER"
  }
}
```

---

### 3. Get Profile (Protected)

**GET** `/profile`

**Headers:**

```
Authorization: Bearer <your-jwt-token>
```

**Response:**

```json
{
  "id": "uuid",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "CUSTOMER",
  "createdAt": "2026-01-03T12:00:00.000Z"
}
```

---

### 4. Update Profile (Protected)

**PUT** `/profile`

**Headers:**

```
Authorization: Bearer <your-jwt-token>
```

**Body:**

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+0987654321"
}
```

**Response:**

```json
{
  "id": "uuid",
  "email": "john@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+0987654321",
  "role": "CUSTOMER"
}
```

---

### 5. Change Password (Protected)

**POST** `/change-password`

**Headers:**

```
Authorization: Bearer <your-jwt-token>
```

**Body:**

```json
{
  "oldPassword": "currentPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response:**

```json
{
  "message": "Password changed successfully"
}
```

---

### 6. Forgot Password

**POST** `/forgot-password`

**Body:**

```json
{
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "message": "If an account with that email exists, a password reset link has been sent"
}
```

**How it works:**

1. Receives email address
2. Generates secure random reset token
3. Stores hashed token in database with 1-hour expiry
4. Sends password reset email with link containing token
5. Always returns the same message (security - doesn't reveal if email exists)

**Email sent to user:**

- Subject: "Password Reset Request"
- Contains clickable button with reset link
- Link format: `http://localhost:4200/reset-password?token=abc123...`
- Token expires in 1 hour

**Development Note:**

- Uses Ethereal Email (fake SMTP) in development
- Check console logs for email preview URL
- Configure real SMTP in production (Gmail, SendGrid, etc.)

---

### 7. Reset Password ✅ **FULLY IMPLEMENTED**

**POST** `/reset-password`

**Body:**

```json
{
  "token": "token-from-email-link",
  "newPassword": "newSecurePassword789"
}
```

**Response (Success):**

```json
{
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

**Response (Error):**

```json
{
  "statusCode": 400,
  "message": "Invalid or expired reset token"
}
```

**Security Features:**

- Token is hashed before storing in database
- Token has 1-hour expiration
- Token is single-use (cleared after successful reset)
- Constant-time comparison prevents timing attacks

---

## Authentication Flow

1. **Registration/Login**: Receive `accessToken`
2. **Store Token**: Save in localStorage/sessionStorage (client-side)
3. **Protected Requests**: Include in `Authorization: Bearer <token>` header
4. **Token Expiry**: 7 days (configurable in AuthModule)

## Testing with Postman

1. **Register or Login** → Copy the `accessToken`
2. **For protected endpoints:**
   - Add Header: `Authorization`
   - Value: `Bearer <paste-your-token-here>`
