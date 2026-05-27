# ArthSaathi API Documentation

> Current mobile prototype note: the active Expo app is local-first and does not call these APIs from `src/app`, `src/components`, or `src/store`. Keep this file as the future backend contract for integration work.

**Base URL:** `http://localhost:3000/api`  
**Authentication:** Bearer JWT token in `Authorization` header  
**Content-Type:** `application/json` (except file upload endpoints)

---

## Response Format

All endpoints return a consistent JSON structure:

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... } | null,
  "errors": [ ... ] | null
}
```

---

## 1. Health Check

### `GET /api/health`
Check if the server is running.

**Auth required:** No

**Response:**
```json
{
  "success": true,
  "message": "ArthSaathi API is running.",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

---

## 2. Auth Endpoints

### `POST /api/auth/register`
Register a new user.

**Auth required:** No

**Request Body:**
```json
{
  "name": "Ramesh Kumar",
  "phone": "9876543210",
  "password": "securepass123",
  "language": "kn",
  "village": "Hosur",
  "district": "Tumkur"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "user": {
      "id": "uuid",
      "name": "Ramesh Kumar",
      "phone": "9876543210",
      "language": "kn",
      "village": "Hosur",
      "district": "Tumkur",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### `POST /api/auth/login`
Login with phone and password.

**Auth required:** No

**Request Body:**
```json
{
  "phone": "9876543210",
  "password": "securepass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "uuid",
      "name": "Ramesh Kumar",
      "phone": "9876543210"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### `GET /api/auth/me`
Get the currently authenticated user.

**Auth required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Authenticated user fetched.",
  "data": {
    "id": "uuid",
    "name": "Ramesh Kumar",
    "phone": "9876543210",
    "language": "kn"
  }
}
```

---

## 3. User Endpoints

### `GET /api/users/profile`
Get user profile.

**Auth required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Profile fetched successfully.",
  "data": {
    "id": "uuid",
    "name": "Ramesh Kumar",
    "phone": "9876543210",
    "language": "kn",
    "village": "Hosur",
    "district": "Tumkur"
  }
}
```

---

### `PUT /api/users/profile`
Update user profile.

**Auth required:** Yes

**Request Body (any updatable field):**
```json
{
  "name": "Ramesh K",
  "language": "hi",
  "village": "Nelamangala"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": { ... }
}
```

---

## 4. Transaction Endpoints

### `POST /api/transactions`
Add a new transaction.

**Auth required:** Yes

**Request Body:**
```json
{
  "amount": 5000,
  "type": "income",
  "category": "Farming",
  "note": "Wheat harvest payment",
  "date": "2024-01-15"
}
```

**`type` values:** `income` | `expense` | `saving`

**Response (201):**
```json
{
  "success": true,
  "message": "Transaction added successfully.",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "amount": 5000,
    "type": "income",
    "category": "Farming",
    "note": "Wheat harvest payment",
    "date": "2024-01-15T00:00:00.000Z"
  }
}
```

---

### `GET /api/transactions`
Get all transactions for the authenticated user.

**Auth required:** Yes

**Query Parameters (optional):**
| Param | Type | Example |
|-------|------|---------|
| type | string | `income` / `expense` / `saving` |
| category | string | `Farming` |
| startDate | date | `2024-01-01` |
| endDate | date | `2024-01-31` |

**Response (200):**
```json
{
  "success": true,
  "message": "Transactions fetched successfully.",
  "data": [ { ...transaction }, ... ]
}
```

---

### `GET /api/transactions/:id`
Get a single transaction by ID.

**Auth required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Transaction fetched successfully.",
  "data": { ...transaction }
}
```

---

### `PUT /api/transactions/:id`
Update a transaction.

**Auth required:** Yes

**Request Body (any updatable field):**
```json
{
  "amount": 6000,
  "note": "Updated payment"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Transaction updated successfully.",
  "data": { ...updatedTransaction }
}
```

---

### `DELETE /api/transactions/:id`
Delete a transaction.

**Auth required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Transaction deleted successfully.",
  "data": null
}
```

---

## 5. Dashboard Endpoint

### `GET /api/dashboard`
Get complete financial dashboard data.

**Auth required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Dashboard data fetched successfully.",
  "data": {
    "totalIncome": 25000,
    "totalExpenses": 12000,
    "totalSavings": 5000,
    "netBalance": 8000,
    "monthly": {
      "income": 8000,
      "expense": 3500,
      "saving": 1500
    },
    "recentTransactions": [ { ...transaction }, ... ],
    "financialSummary": {
      "status": "healthy",
      "savingsRate": "20.0%",
      "message": "Great job! You are saving well this month."
    }
  }
}
```

---

## 6. AI Endpoints

### `POST /api/ai/financial-guidance`
Get AI-powered financial advice.

**Auth required:** Yes

**Request Body:**
```json
{
  "query": "How should I save money during the off-season?",
  "language": "kn"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Financial guidance generated.",
  "data": {
    "reportId": "uuid",
    "result": {
      "guidance": "...",
      "tips": ["...", "..."]
    }
  }
}
```

---

### `POST /api/ai/scam-detection`
Detect if a message or offer is a scam.

**Auth required:** Yes

**Request Body:**
```json
{
  "message": "You have won Rs 10 lakh lottery. Send Rs 500 processing fee to claim."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Scam detection completed.",
  "data": {
    "reportId": "uuid",
    "result": {
      "isScam": true,
      "confidence": 0.98,
      "reason": "Classic advance fee fraud pattern detected.",
      "warningLevel": "HIGH"
    }
  }
}
```

---

### `POST /api/ai/loan-analysis`
Analyze loan risk and safety.

**Auth required:** Yes

**Request Body:**
```json
{
  "loanAmount": 100000,
  "interestRate": 12.5,
  "tenureMonths": 24,
  "monthlyIncome": 15000
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Loan analysis completed.",
  "data": {
    "reportId": "uuid",
    "result": {
      "emi": 4717,
      "totalRepayment": 113208,
      "riskLevel": "MEDIUM",
      "debtToIncomeRatio": "31.4%",
      "recommendation": "EMI is 31% of income. Manageable but leave little room for emergencies."
    }
  }
}
```

---

## 7. RTC Upload Endpoints

### `POST /api/rtc/upload`
Upload an RTC document (image or PDF) for OCR extraction.

**Auth required:** Yes  
**Content-Type:** `multipart/form-data`

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | Image (JPEG/PNG/WEBP) or PDF |

**Max file size:** 10 MB

**Flow:**
