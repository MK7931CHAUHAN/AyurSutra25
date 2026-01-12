const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const {
  getPatients,
  getPatientStats,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientById,
  uploadPatientPhoto,
  bulkUpdatePatients,
  getMedicalRecords,
  createMedicalRecord,
  deleteMedicalRecord,
} = require('../controllers/patientController');

const { protect, authorize } = require('../middleware/authMiddleware');


// ======================
// ✅ ENSURE UPLOAD DIR
// ======================
const uploadDir = path.join('uploads', 'profile');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


// ======================
// MULTER CONFIG
// ======================
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});


// ======================
// 🔓 PUBLIC / PROTECTED
// ======================
router.use(protect);


// ======================
// ✅ STATS (KEEP ABOVE :id)
// ======================
router.get(
  '/stats',
  authorize('admin', 'doctor'),
  getPatientStats
);


// ======================
// MEDICAL RECORDS
// ======================
router.get('/:id/medical-records', getMedicalRecords);
router.post('/:id/medical-records', createMedicalRecord);
router.delete('/:id/medical-records/:recordId', deleteMedicalRecord);


// ======================
// PATIENT CRUD
// ======================
router.route('/')
  .get(authorize('admin', 'doctor', 'therapist'), getPatients)
  .post(authorize('admin', 'doctor'), createPatient);

router.route('/:id')
  .get(authorize('admin', 'doctor', 'therapist'), getPatientById)
  .put(authorize('admin', 'doctor'), updatePatient)
  .delete(authorize('admin'), deletePatient);


// ======================
// BULK UPDATE
// ======================
router.put('/bulk-update', authorize('admin'), bulkUpdatePatients);


// ======================
// PHOTO UPLOAD
// ======================
router.post(
  '/:id/upload-photo',
  authorize('therapist', 'patient'),
  upload.single('photo'),
  uploadPatientPhoto
);

module.exports = router;
