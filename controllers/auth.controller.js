import Joi from 'joi';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

const { User } = db;

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

export const login = asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.details[0].message
    });
  }

  const user = await User.scope('withPassword').findOne({
    where: { email: value.email }
  });

  if (!user) {
    return res.status(401).json({
      statusCode: 401,
      message: 'Invalid credentials'
    });
  }

  const isValidPassword = await user.validatePassword(value.password);

  if (!isValidPassword) {
    return res.status(401).json({
      statusCode: 401,
      message: 'Invalid credentials'
    });
  }

  const access_token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  res.status(200).json({
    access_token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
});
