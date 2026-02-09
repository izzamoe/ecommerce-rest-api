import Joi from 'joi';
import db from '../models/index.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

const { Order } = db;

const createOrderSchema = Joi.object({
  customer_name: Joi.string().required().messages({
    'any.required': 'customer_name is required',
    'string.empty': 'customer_name is required'
  }),
  product_name: Joi.string().required().messages({
    'any.required': 'product_name is required',
    'string.empty': 'product_name is required'
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'any.required': 'quantity is required',
    'number.base': 'quantity must be a number',
    'number.integer': 'quantity must be an integer',
    'number.min': 'quantity must be greater than 0'
  })
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'PAID', 'CANCELLED').required().messages({
    'any.required': 'status is required',
    'any.only': 'status must be one of: PENDING, PAID, CANCELLED'
  })
});

function formatOrder(order) {
  return {
    id: order.id,
    customer_name: order.customerName || order.customer_name,
    product_name: order.productName || order.product_name,
    quantity: order.quantity,
    status: order.status,
    created_at: order.createdAt || order.created_at
  };
}

export const createOrder = asyncHandler(async (req, res) => {
  const { error, value } = createOrderSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.details[0].message
    });
  }

  const order = await Order.create({
    customerName: value.customer_name,
    productName: value.product_name,
    quantity: value.quantity,
    status: 'PENDING'
  });

  res.status(201).json(formatOrder(order));
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    order: [['created_at', 'DESC']]
  });

  res.status(200).json(orders.map(formatOrder));
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { error, value } = updateStatusSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.details[0].message
    });
  }

  const order = await Order.findByPk(id);

  if (!order) {
    return res.status(404).json({
      statusCode: 404,
      message: 'Order not found'
    });
  }

  if (!order.canTransitionTo(value.status)) {
    return res.status(400).json({
      statusCode: 400,
      message: `Invalid status transition from ${order.status} to ${value.status}`
    });
  }

  await order.update({ status: value.status });

  res.status(200).json(formatOrder(order));
});
