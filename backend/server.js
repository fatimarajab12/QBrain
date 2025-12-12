import express from "express";
import connectDB from "./config/database.js";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import { emailService } from "./utils/emailService.js";
import projectsRouter from "./routes/projects.routes.js";
import featuresRouter from "./routes/features.routes.js";
import testCasesRouter from "./routes/testCases.routes.js";
import bugsRouter from "./routes/bugs.routes.js";
import aiRouter from "./routes/ai.routes.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";
dotenv.config();
const app = express();
connectDB();

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173', 'http://localhost:8080', 'http://127.0.0.1:8080'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
(async () => {
  try {
    await emailService.initialize();
    console.log("Email service ready");
  } catch (err) {
    console.error(" Failed to initialize email service:", err.message);
  }
})();

app.get("/", (req, res) => {
  res.send("QBrain Backend Connected Successfully!");
});

app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/features", featuresRouter);
app.use("/api/test-cases", testCasesRouter);
app.use("/api/bugs", bugsRouter);
app.use("/api/ai", aiRouter);

// Error Handler Middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));