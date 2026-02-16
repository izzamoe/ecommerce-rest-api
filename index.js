import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import db from "./models/index.js";
import authRoutes from "./routes/auth.routes.js";
import orderRoutes from "./routes/order.routes.js";
import {
  errorHandler,
  notFoundHandler,
  asyncHandler,
} from "./middlewares/error.middleware.js";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Body parser
app.use(express.json());

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use("/auth", authRoutes);
app.use("/orders", orderRoutes);

// ✅ TEST ERROR AMAN - Pakai asyncHandler (tertangkap error handler)
app.get(
  "/test-error-safe",
  asyncHandler(async (req, res) => {
    console.log("🛡️ Safe endpoint hit, akan throw error tapi tertangkap...");
    await new Promise((resolve) => setTimeout(resolve, 500));
    throw new Error("🛡️ ERROR AMAN! Tertangkap asyncHandler!");
  }),
);

// 💥 TEST ERROR CRASH - Tanpa asyncHandler (server akan mati!)
// WARNING: Hanya untuk demo! Setelah test, server crash dan harus restart!
app.get("/test-error-crash", async (req, res) => {
  console.log("💥 Crash endpoint hit, server akan MATI dalam 1 detik...");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  throw new Error("💥 BOOM! Server crash! Unhandled Promise Rejection!");
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

export { app };

const startServer = async () => {
  try {
    await db.sequelize.sync({ force: false });
    console.log("Database synced successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Unable to sync database:", err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
