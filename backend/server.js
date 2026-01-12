require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/dbConfig');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require("./routes/profileRoutes");
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const therapyRoutes = require('./routes/therapyRoutes');
const treatmentRoutes = require('./routes/treatmentRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const billingRoutes = require('./routes/billingRoutes');
const reportRoutes = require('./routes/reportRoutes');
const metaRoutes = require('./routes/doctorMetaRoutes');
const searchRoutes = require("./routes/searchRoutes");
const medicalZoneRoutes = require('./routes/medicalZoneRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

/* ===================== DB ===================== */
connectDB();

/* ===================== CORS ===================== */
const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:5173',
  'https://your-frontend.vercel.app' // ✅ add frontend URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));

/* ===================== Middlewares ===================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===================== Static (Local only) ===================== */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ===================== Routes ===================== */
app.get("/", (req, res) => {
  res.send("Backend running on Vercel 🚀");
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/doctors', metaRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/therapies', therapyRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/medical-zone', medicalZoneRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/notifications', notificationRoutes);

/* ===================== Error Handler ===================== */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server Error' });
});

module.exports = app;
