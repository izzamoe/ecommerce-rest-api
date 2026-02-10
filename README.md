# E-Commerce REST API

REST API sederhana untuk mengelola pesanan customer.

## Teknologi

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT (JSON Web Token)
- bcrypt

## Cara Menjalankan

### 1. Install dependencies
```bash
npm install
```

### 2. Jalankan PostgreSQL
```bash
docker-compose up -d db
```

### 3. Jalankan migrasi
```bash
npm run migrate
```

### 4. Jalankan seeder
```bash
npm run seed
```

### 5. Jalankan aplikasi
```bash
npm start
```

Server berjalan di `http://localhost:3000`.

## Swagger API Documentation

API ini dilengkapi dengan dokumentasi interaktif menggunakan Swagger UI. Anda dapat mengaksesnya di:

```
http://localhost:3000/api-docs
```

### Cara Menggunakan Swagger UI

1. Jalankan aplikasi: `npm start`
2. Buka browser dan akses `http://localhost:3000/api-docs`
3. Klik pada endpoint yang ingin Anda test
4. Klik tombol **Try it out**
5. Masukkan parameter/request body yang diperlukan
6. Klik **Execute** untuk menjalankan request

### Autentikasi di Swagger UI

1. Klik tombol **Authorize** di bagian atas
2. Masukkan JWT token yang didapat dari endpoint `/auth/login`
3. Klik **Authorize** - token akan自动 terpasang di semua request

### Contoh Alur Testing

1. **Login** → POST `/auth/login` dengan email `admin@example.com` dan password `admin123`
2. **Authorize** dengan access_token yang didapat
3. **Create Order** → POST `/orders` (ADMIN only)
4. **Get Orders** → GET `/orders`
5. **Update Status** → PATCH `/orders/{id}/status` (ADMIN only)

## Demo Users

- **ADMIN**: admin@example.com / admin123
- **STAFF**: staff@example.com / staff123

## Struktur Data

### Tabel Users

| Field | Type | Constraint |
|-------|------|------------|
| id | UUID | PRIMARY KEY |
| email | VARCHAR | UNIQUE, NOT NULL |
| password | VARCHAR | NOT NULL (hashed) |
| role | ENUM | 'ADMIN' \| 'STAFF' |
| created_at | TIMESTAMP | DEFAULT NOW() |

### Tabel Orders

| Field | Type | Constraint |
|-------|------|------------|
| id | UUID | PRIMARY KEY |
| customer_name | VARCHAR | NOT NULL |
| product_name | VARCHAR | NOT NULL |
| quantity | INTEGER | NOT NULL, > 0 |
| status | ENUM | 'PENDING' \| 'PAID' \| 'CANCELLED' |
| created_at | TIMESTAMP | DEFAULT NOW() |

## API Endpoints

### POST /auth/login

Request:
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Response Success (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

Response Error (401):
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

### POST /orders

Akses: ADMIN only

Headers: `Authorization: Bearer <token>`

Request:
```json
{
  "customer_name": "John Doe",
  "product_name": "Laptop Gaming",
  "quantity": 2
}
```

Response Success (201):
```json
{
  "id": "uuid",
  "customer_name": "John Doe",
  "product_name": "Laptop Gaming",
  "quantity": 2,
  "status": "PENDING",
  "created_at": "2024-02-05T10:30:00Z"
}
```

### GET /orders

Akses: ADMIN dan STAFF

Headers: `Authorization: Bearer <token>`

Response Success (200):
```json
[
  {
    "id": "uuid",
    "customer_name": "John Doe",
    "product_name": "Laptop Gaming",
    "quantity": 2,
    "status": "PENDING",
    "created_at": "2024-02-05T10:30:00Z"
  }
]
```

### PATCH /orders/:id/status

Akses: ADMIN only

Headers: `Authorization: Bearer <token>`

Request:
```json
{
  "status": "PAID"
}
```

Response Success (200):
```json
{
  "id": "uuid",
  "customer_name": "John Doe",
  "product_name": "Laptop Gaming",
  "quantity": 2,
  "status": "PAID",
  "created_at": "2024-02-05T10:30:00Z"
}
```

Response Error (404):
```json
{
  "statusCode": 404,
  "message": "Order not found"
}
```

## Role & Access Control

| Role   | POST /orders | GET /orders | PATCH /orders/:id/status |
|--------|-------------|-------------|-------------------------|
| ADMIN  | ✓           | ✓           | ✓                       |
| STAFF  | ✗           | ✓           | ✗                       |

## Aturan Transisi Status

| Transisi | Valid? |
|----------|--------|
| PENDING → PAID | ✓ |
| PENDING → CANCELLED | ✓ |
| PAID → CANCELLED | ✗ |
| PAID → PENDING | ✗ |
| CANCELLED → PAID | ✗ |
| CANCELLED → PENDING | ✗ |

## Validasi

- `customer_name`: wajib diisi, string
- `product_name`: wajib diisi, string
- `quantity`: wajib diisi, integer, > 0
- Validasi gagal: 400 Bad Request

## Error Responses

Format: `{ statusCode: <code>, message: <message> }`

| Status | Keterangan |
|--------|------------|
| 400 | Validasi gagal |
| 401 | Token tidak ada/invalid/expired |
| 403 | Role tidak memiliki akses |
| 404 | Resource tidak ditemukan |

## Testing

```bash
npm test
```

30 test cases mencakup:
- Authentication (login, validasi input)
- Authorization (token, role-based access)
- CRUD Orders (create, get all)
- Status transitions (valid & invalid)

## Struktur Project

```
project/
├── config/          # Database configuration
├── controllers/     # Request handlers
├── middlewares/      # Auth & error handling
├── migrations/      # Database migrations
├── models/          # Sequelize models (User, Order)
├── routes/          # Route definitions
├── seeders/         # Seed data
├── tests/           # Integration tests
├── index.js         # Entry point
└── package.json
```

## Docker Deployment

### Development

```bash
docker-compose up -d
```

Akses: http://localhost:3000

### Production

1. Buat file `.env.production`:
```env
DB_NAME=app_db
DB_USER=postgres
DB_PASSWORD=secure-password-here
JWT_SECRET=very-long-random-secret-key
```

2. Jalankan production stack:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

3. Jalankan migrations:
```bash
docker-compose -f docker-compose.prod.yml exec app npm run migrate
docker-compose -f docker-compose.prod.yml exec app npm run seed
```

### Production Features

- Multi-stage build (smaller image)
- Non-root user for security
- Health checks
- Auto-restart policies
- No development volumes mounted
