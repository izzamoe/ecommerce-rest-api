import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { OrderStatus } from '../constants/order.js';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

let app;
let db;
let adminToken;
let staffToken;
let adminUserId = '550e8400-e29b-41d4-a716-446655440001';
let staffUserId = '550e8400-e29b-41d4-a716-446655440002';

beforeAll(async () => {
  // Dynamic import to ensure env vars are set first
  const appModule = await import('../index.js');
  app = appModule.app || appModule.default;
  
  const dbModule = await import('../models/index.js');
  db = dbModule.default;

  // Wait for DB sync
  await db.sequelize.sync({ force: true });

  const { User } = db;

  // Create users
  await User.create({
    id: adminUserId,
    email: 'admin@example.com',
    password: 'admin123',
    role: 'ADMIN'
  });

  await User.create({
    id: staffUserId,
    email: 'staff@example.com',
    password: 'staff123',
    role: 'STAFF'
  });

  // Generate tokens
  adminToken = jwt.sign({ userId: adminUserId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  staffToken = jwt.sign({ userId: staffUserId }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  if (db?.sequelize) {
    await db.sequelize.close();
  }
});

// ============================================
// AUTH TESTS
// ============================================
describe('POST /auth/login', () => {
  it('should login successfully with valid ADMIN credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('admin@example.com');
    expect(res.body.user.role).toBe('ADMIN');
    expect(res.body.user).toHaveProperty('id');
    // Should NOT have password in response
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should login successfully with valid STAFF credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'staff@example.com', password: 'staff123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token');
    expect(res.body.user.role).toBe('STAFF');
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('statusCode', 401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should return 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'password' });

    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should return 400 for missing email', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('should return 400 for missing password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('should return 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });
});

// ============================================
// AUTHORIZATION TESTS
// ============================================
describe('Authorization', () => {
  it('should return 401 when no token provided', async () => {
    const res = await request(app).get('/orders');

    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('should return 401 for invalid token', async () => {
    const res = await request(app)
      .get('/orders')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('should return 401 for expired token', async () => {
    const expiredToken = jwt.sign(
      { userId: adminUserId },
      process.env.JWT_SECRET,
      { expiresIn: '0s' }
    );

    // Small delay to ensure token is expired
    await new Promise(resolve => setTimeout(resolve, 100));

    const res = await request(app)
      .get('/orders')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
  });

  it('should return 403 when STAFF tries to create order', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        customer_name: 'Test',
        product_name: 'Test Product',
        quantity: 1
      });

    expect(res.status).toBe(403);
    expect(res.body.statusCode).toBe(403);
  });

  it('should return 403 when STAFF tries to update order status', async () => {
    // First create an order as admin
    const createRes = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customer_name: 'Test',
        product_name: 'Test Product',
        quantity: 1
      });

    const orderId = createRes.body.id;

    const res = await request(app)
      .patch(`/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: OrderStatus.PAID });

    expect(res.status).toBe(403);
    expect(res.body.statusCode).toBe(403);
  });
});

// ============================================
// CREATE ORDER TESTS
// ============================================
describe('POST /orders', () => {
  it('should create order successfully as ADMIN', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customer_name: 'John Doe',
        product_name: 'Laptop Gaming',
        quantity: 2
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.customer_name).toBe('John Doe');
    expect(res.body.product_name).toBe('Laptop Gaming');
    expect(res.body.quantity).toBe(2);
    expect(res.body.status).toBe(OrderStatus.PENDING);
    expect(res.body).toHaveProperty('created_at');
  });

  it('should return 400 when customer_name is missing', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        product_name: 'Laptop',
        quantity: 1
      });

    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('should return 400 when product_name is missing', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customer_name: 'John',
        quantity: 1
      });

    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('should return 400 when quantity is missing', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customer_name: 'John',
        product_name: 'Laptop'
      });

    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('should return 400 when quantity is 0', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customer_name: 'John',
        product_name: 'Laptop',
        quantity: 0
      });

    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('should return 400 when quantity is negative', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customer_name: 'John',
        product_name: 'Laptop',
        quantity: -1
      });

    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('should return 400 when quantity is not integer', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customer_name: 'John',
        product_name: 'Laptop',
        quantity: 2.5
      });

    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });
});

// ============================================
// GET ORDERS TESTS
// ============================================
describe('GET /orders', () => {
  it('should get all orders as ADMIN', async () => {
    const res = await request(app)
      .get('/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Check structure of each order
    if (res.body.length > 0) {
      const order = res.body[0];
      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('customer_name');
      expect(order).toHaveProperty('product_name');
      expect(order).toHaveProperty('quantity');
      expect(order).toHaveProperty('status');
      expect(order).toHaveProperty('created_at');
    }
  });

  it('should get all orders as STAFF', async () => {
    const res = await request(app)
      .get('/orders')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ============================================
// UPDATE ORDER STATUS TESTS
// ============================================
describe('PATCH /orders/:id/status', () => {
  let pendingOrderId;

  beforeEach(async () => {
    // Create a fresh PENDING order for each test
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customer_name: 'Test Customer',
        product_name: 'Test Product',
        quantity: 1
      });

    pendingOrderId = res.body.id;
  });

  it('should update status from PENDING to PAID', async () => {
    const res = await request(app)
      .patch(`/orders/${pendingOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: OrderStatus.PAID });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(pendingOrderId);
    expect(res.body.status).toBe(OrderStatus.PAID);
    expect(res.body).toHaveProperty('customer_name');
    expect(res.body).toHaveProperty('product_name');
    expect(res.body).toHaveProperty('quantity');
    expect(res.body).toHaveProperty('created_at');
  });

  it('should update status from PENDING to CANCELLED', async () => {
    const res = await request(app)
      .patch(`/orders/${pendingOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: OrderStatus.CANCELLED });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(OrderStatus.CANCELLED);
  });

  it('should NOT allow PAID to CANCELLED', async () => {
    // First set to PAID
    await request(app)
      .patch(`/orders/${pendingOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: OrderStatus.PAID });

    // Try to set to CANCELLED
    const res = await request(app)
      .patch(`/orders/${pendingOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: OrderStatus.CANCELLED });

    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
    expect(res.body.message).toContain('Invalid status transition');
  });

  it('should NOT allow PAID to PENDING', async () => {
    // First set to PAID
    await request(app)
      .patch(`/orders/${pendingOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: OrderStatus.PAID });

    // Try to set to PENDING
    const res = await request(app)
      .patch(`/orders/${pendingOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: OrderStatus.PENDING });

    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('should NOT allow CANCELLED to PAID', async () => {
    // First set to CANCELLED
    await request(app)
      .patch(`/orders/${pendingOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: OrderStatus.CANCELLED });

    // Try to set to PAID
    const res = await request(app)
      .patch(`/orders/${pendingOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: OrderStatus.PAID });

    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('should NOT allow CANCELLED to PENDING', async () => {
    // First set to CANCELLED
    await request(app)
      .patch(`/orders/${pendingOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: OrderStatus.CANCELLED });

    // Try to set to PENDING
    const res = await request(app)
      .patch(`/orders/${pendingOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: OrderStatus.PENDING });

    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('should return 404 for non-existent order', async () => {
    const res = await request(app)
      .patch('/orders/00000000-0000-0000-0000-000000000000/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: OrderStatus.PAID });

    expect(res.status).toBe(404);
    expect(res.body.statusCode).toBe(404);
    expect(res.body.message).toBe('Order not found');
  });

  it('should return 400 for invalid status value', async () => {
    const res = await request(app)
      .patch(`/orders/${pendingOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'INVALID' });

    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('should return 400 when status field is missing', async () => {
    const res = await request(app)
      .patch(`/orders/${pendingOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });
});
