
// routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorStats,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  updateAvailability,
  getDoctorByUserId,
  getDoctorSchedule,
  exportDoctorSchedule
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadUserImage } = require("../controllers/uploadControllers");
const upload = require("../middleware/upload");

// Upload Image for Doctor Profile
router.post(
  '/upload-image/:doctorId',
  protect,
  authorize('doctor'),
  upload.single('photo'),
  uploadUserImage
);

// Protected routes
router.route('/')
  .get(protect, getDoctors)
  .post(protect, authorize('admin'), createDoctor);

router.route('/stats')
  .get(protect, authorize('admin', 'doctor'), getDoctorStats);

router.route('/:id')
  .put(protect, authorize('admin'), updateDoctor)
  .delete(protect, authorize('admin'), deleteDoctor);


router.route('/:id/availability')
  .put(protect, authorize('admin', 'doctor'), updateAvailability);

  
// ✅ Schedule route
router.get('/:id/schedule', protect, authorize('admin', 'doctor'), getDoctorSchedule);
router.get('/:id/schedule/export', protect, authorize('admin', 'doctor'), exportDoctorSchedule);

router.get('/user/:userId', protect, getDoctorByUserId);
module.exports = router;
