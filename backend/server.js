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
import chatbotRouter from "./routes/chatbot.routes.js";
import adminRouter from "./routes/admin.routes.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";
import { trackUsage } from "./middleware/usageMetrics.middleware.js";
dotenv.config();
const app = express();

// Initialize database connection
(async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
})();

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
app.use(trackUsage);

// Serve static files from uploads directory
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
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
app.use("/api/chatbot", chatbotRouter);
app.use("/api/admin", adminRouter);

// Error handler middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));