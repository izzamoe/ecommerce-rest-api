import Joi from "joi";
import db from "../models/index.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { OrderStatus, OrderStatusList } from "../constants/order.js";

const { Order } = db;

const createOrderSchema = Joi.object({
  customer_name: Joi.string().required().messages({
    "any.required": "customer_name is required",
    "string.empty": "customer_name is required",
  }),
  product_name: Joi.string().required().messages({
    "any.required": "product_name is required",
    "string.empty": "product_name is required",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "any.required": "quantity is required",
    "number.base": "quantity must be a number",
    "number.integer": "quantity must be an integer",
    "number.min": "quantity must be greater than 0",
  }),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...OrderStatusList)
    .required()
    .messages({
      "any.required": "status is required",
      "any.only": `status must be one of: ${OrderStatusList.join(", ")}`,
    }),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "page must be a number",
    "number.integer": "page must be an integer",
    "number.min": "page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.base": "limit must be a number",
    "number.integer": "limit must be an integer",
    "number.min": "limit must be at least 1",
    "number.max": "limit must be at most 100",
  }),
});

function formatOrder(order) {
  return {
    id: order.id,
    customer_name: order.customerName || order.customer_name,
    product_name: order.productName || order.product_name,
    quantity: order.quantity,
    status: order.status,
    created_at: order.createdAt || order.created_at,
  };
}

export const createOrder = asyncHandler(async (req, res) => {
  const { error, value } = createOrderSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  const order = await Order.create({
    customerName: value.customer_name,
    productName: value.product_name,
    quantity: value.quantity,
    status: OrderStatus.PENDING,
  });

  res.status(201).json(formatOrder(order));
});

export const getAllOrders = asyncHandler(async (req, res) => {
  // Validate query params with defaults
  const { error, value } = paginationSchema.validate(req.query, {
    allowUnknown: true,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  const { page, limit } = value;
  const offset = (page - 1) * limit;

  const { count, rows: orders } = await Order.findAndCountAll({
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });

  const totalPages = Math.ceil(count / limit);

  res.status(200).json({
    data: orders.map(formatOrder),
    pagination: {
      current_page: page,
      total_pages: totalPages,
      total_items: count,
      items_per_page: limit,
      has_next_page: page < totalPages,
      has_prev_page: page > 1,
    },
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { error, value } = updateStatusSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  const order = await Order.findByPk(id);

  if (!order) {
    return res.status(404).json({
      statusCode: 404,
      message: "Order not found",
    });
  }

  if (!order.canTransitionTo(value.status)) {
    return res.status(400).json({
      statusCode: 400,
      message: `Invalid status transition from ${order.status} to ${value.status}`,
    });
  }

  await order.update({ status: value.status });

  res.status(200).json(formatOrder(order));
});
