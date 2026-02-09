import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import db from './models/index.js';
import authRoutes from './routes/auth.routes.js';
import orderRoutes from './routes/order.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/orders', orderRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

export { app };

const startServer = async () => {
  try {
    await db.sequelize.sync({ force: false });
    console.log('Database synced successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to sync database:', err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
