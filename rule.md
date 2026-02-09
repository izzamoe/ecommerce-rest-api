# TEST BACKEND DEVELOPER

### E-Commerce REST API

## Instruksi Umum:

1. Baca seluruh requirement dengan teliti sebelum memulai
2. Implementasikan semua endpoint yang diminta
3. Pastikan semua validasi dan error handling berjalan dengan baik
4. Siapkan dokumentasi API sederhana (README.md)
5. Submit source code dalam bentuk repository Git (GitHub/GitLab)
6. Sertakan instruksi untuk menjalankan aplikasi
7. Bonus poin untuk unit testing dan integration testing

## Deskripsi Kasus

Sebuah layanan e-commerce membutuhkan REST API sederhana untuk mengelola
pesanan customer. Anda diminta untuk membangun backend API dengan spesifikasi
yang telah ditentukan.

## Teknologi yang Harus Digunakan

```
● Node.js - Runtime environment
● Express atau NestJS - Framework (pilih salah satu)
● PostgreSQL atau MongoDB - Database (pilih salah satu)
● JWT (JSON Web Token) - Untuk authentication
● Library tambahan sesuai kebutuhan (bcrypt, validator, dll)
```
## Struktur Data

### Tabel Users:

**Field Type Constraint
id** UUID^ /^ SERIAL^ PRIMARY^ KEY^
**email** VARCHAR UNIQUE, NOT NULL
**password** VARCHAR NOT NULL (hashed)
**role** ENUM 'ADMIN' | 'STAFF'
**created_at** TIMESTAMP DEFAULT NOW()


### Tabel Orders:

**Field Type Constraint
id** UUID / SERIAL PRIMARY KEY
**customer_name** VARCHAR^ NOT^ NULL^
**product_name** VARCHAR^ NOT^ NULL^
**quantity** INTEGER NOT NULL, > 0
**status** ENUM 'PENDING' | 'PAID' |
'CANCELLED'
**created_at** TIMESTAMP DEFAULT NOW()

## Endpoint yang Harus Diimplementasikan

### 1. POST /auth/login

Fungsi: Login user dan mendapatkan JWT token
Request Body:
**_{
"email": "admin@example.com",
"password": "password123"
}_**
Response Success (200):
**_{
"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"user": {
"id": "uuid",
"email": "admin@example.com",
"role": "ADMIN"
}
}_**
Response Error (401):
**_{
"statusCode": 401,
"message": "Invalid credentials"
}_**

### 2. POST /orders

Fungsi: Membuat order baru
Akses: Hanya role ADMIN


Authorization: Bearer Token
Request Body:
**_{
"customer_name": "John Doe",
"product_name": "Laptop Gaming",
"quantity": 2
}_**
Response Success (201):
**_{
"id": "uuid",
"customer_name": "John Doe",
"product_name": "Laptop Gaming",
"quantity": 2,
"status": "PENDING",
"created_at": "2024-02-05T10:30:00Z"
}_**
Validasi yang Harus Diterapkan:
● customer_name: wajib diisi, string
● product_name: wajib diisi, string
● quantity: wajib diisi, integer, harus > 0
● Jika validasi gagal, return 400 Bad Request

### 3. GET /orders

Fungsi: Mendapatkan semua orders
Akses: Role ADMIN dan STAFF
Authorization: Bearer Token
Response Success (200):
**_[
{
"id": "uuid-1",
"customer_name": "John Doe",
"product_name": "Laptop Gaming",
"quantity": 2,
"status": "PENDING",
"created_at": "2024-02-05T10:30:00Z"
},_**


#### {

```
"id": "uuid-2",
"customer_name": "Jane Smith",
"product_name": "Mouse Wireless",
"quantity": 5,
"status": "PAID",
"created_at": "2024-02-05T11:00:00Z"
}
]
```
### 4. PATCH /orders/:id/status

Fungsi: Update status order
Akses: Hanya role ADMIN
Authorization: Bearer Token
Request Body:
**_{
"status": "PAID"
}_**
Response Success (200):
**_{
"id": "uuid",
"customer_name": "John Doe",
"product_name": "Laptop Gaming",
"quantity": 2,
"status": "PAID",
"created_at": "2024-02-05T10:30:00Z"
}_**
Response Error (404):
**_{
"statusCode": 404,
"message": "Order not found"
}_**


## Role & Kontrol Akses

**Role POST /orders GET /orders PATCH
/orders/:id/status**

**ADMIN** (^) ✓ ✓ ✓
**STAFF** (^) ✗ ✓ ✗

## Aturan Autorisasi

**1. Tanpa Token (401 Unauthorized):**
● Request tidak menyertakan header Authorization
● Token tidak valid atau sudah expired
**2. Role Tidak Sesuai (403 Forbidden):**
● Token valid tetapi role user tidak memiliki akses ke endpoint tersebut
● Contoh: STAFF mencoba mengakses POST /orders

## Aturan Transisi Status

Status order hanya dapat diubah sesuai dengan aturan berikut:
**Transisi Valid? Keterangan
PENDING → PAID** ✓^ Diizinkan^
**PENDING → CANCELLED** ✓^ Diizinkan^
**PAID → CANCELLED** ✗ Tidak diizinkan
**PAID → PENDING** ✗ Tidak diizinkan
**CANCELLED → PAID** ✗ Tidak diizinkan
**CANCELLED → PENDING** ✗ Tidak diizinkan
**Jika transisi tidak valid, return error 400 dengan message yang sesuai.**

## Requirement Teknis

### 1. Authentication & Security

● Implementasi JWT untuk authentication
● Password harus di-hash menggunakan bcrypt atau algoritma sejenis
● JWT secret harus disimpan di environment variable
● Token expiration: 1 hari (atau sesuai kebutuhan)

### 2. Validation

● Validasi semua input sebelum diproses
● Return error message yang jelas untuk setiap validation error
● Validasi format email yang benar


● Validasi quantity harus integer dan > 0

### 3. Error Handling

● Implementasi global error handler
● Return HTTP status code yang sesuai (200, 201, 400, 401, 403, 404, 500)
● Error response harus konsisten dengan format JSON
● Tangani semua error yang mungkin terjadi (database error, validation error, dll)

### 4. Database

● Gunakan PostgreSQL atau MongoDB
● Implementasi database migration (jika menggunakan PostgreSQL)
● Buat seed data untuk testing (minimal 1 ADMIN dan 1 STAFF user)

## Tips Pengerjaan

✓ Mulai dari yang paling sederhana (setup project, database, entities)
✓ Test setiap endpoint setelah selesai mengimplementasikannya
✓ Gunakan Postman atau tools sejenis untuk testing
✓ Commit secara berkala dengan message yang jelas
✓ Pastikan semua credential ada di .env, bukan hardcoded
✓ Tulis README yang jelas agar mudah dipahami reviewer

## Selamat mengerjakan! Good luck! 🚀
