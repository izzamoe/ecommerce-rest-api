import express from 'express';
import {
  createOrder,
  getAllOrders,
  updateOrderStatus
} from '../controllers/order.controller.js';
import {
  authenticate,
  requireRole
} from '../middlewares/auth.middleware.js';

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// POST /orders - Create order (ADMIN only)
router.post('/',
  requireRole('ADMIN'),
  createOrder
);

// GET /orders - Get all orders (ADMIN and STAFF)
router.get('/',
  requireRole('ADMIN', 'STAFF'),
  getAllOrders
);

// PATCH /orders/:id/status - Update order status (ADMIN only)
router.patch('/:id/status',
  requireRole('ADMIN'),
  updateOrderStatus
);

export default router;
