const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/dbConfig");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// Serve local uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/users", require("./routes/userRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
