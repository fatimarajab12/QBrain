import express from "express";
import connectDB from "./config/database.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

connectDB();

app.get("/", (req, res) => {
  res.send("QBrain Backend Connected Successfully!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
