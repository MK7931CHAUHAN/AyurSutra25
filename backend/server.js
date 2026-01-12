require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/dbConfig");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

/* favicon ignore */
app.get("/favicon.ico", (req, res) => res.status(204).end());

/* DB */
connectDB();

/* CORS */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/* Middlewares */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Routes */
app.get("/", (req, res) => {
  res.send("Backend running on Vercel 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

/* Error handler */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server Error" });
});

module.exports = app;
