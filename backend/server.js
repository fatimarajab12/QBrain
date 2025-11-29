import express from "express";
import connectDB from "./config/database.js";
import dotenv from "dotenv";
import authRouter from "./routes/auth.routes.js";
import { emailService } from "./utils/emailService.js";
import projectsRouter from "./routes/projects.routes.js";
import featuresRouter from "./routes/features.routes.js";
import testCasesRouter from "./routes/testCases.routes.js";
dotenv.config();
const app = express();
connectDB();
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));