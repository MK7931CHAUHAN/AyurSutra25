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
const { uploadUserImage } = require("../controllers/uploadControllers");
const upload = require("../middleware/upload");

// Upload Image for Doctor Profile
router.post(
  '/upload-image/:patientId',
  protect,
  authorize('patient'),
  upload.single('photo'),
  uploadUserImage
);

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

module.exports = router;
