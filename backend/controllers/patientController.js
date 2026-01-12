const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../models/userModels');
const Patient = require('../models/patientModels');
const cloudinary = require('cloudinary').v2;
const {generatePatientCode} = require('../utils/generatePatientId');


/* ===================== STATS ===================== */
const getPatientStats = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [total, active, inactive, critical, newThisMonth] =
    await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'patient', status: 'active' }),
      User.countDocuments({ role: 'patient', status: 'inactive' }),
      User.countDocuments({ role: 'patient', status: 'critical' }),
      User.countDocuments({
        role: 'patient',
        createdAt: { $gte: startOfMonth }
      })
    ]);

  res.json({
    success: true,
    stats: { total, active, inactive, critical, newThisMonth }
  });
});


/* ===================== CREATE PATIENT (CORRECT VERSION) ===================== */
const createPatient = asyncHandler(async (req, res) => {
  const {
    userId, phone, email, gender, dateOfBirth, bloodGroup,
    address, allergies, emergencyContact, occupation, maritalStatus, referredBy
  } = req.body;

  // Validate required fields
  if (!userId || !phone || !gender || !dateOfBirth) {
    return res.status(400).json({ success: false, message: 'User, phone, gender and date of birth are required' });
  }

  // Validate phone
  const cleanPhone = phone.replace(/\D/g, '');
  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    return res.status(400).json({ success: false, message: 'Invalid Indian mobile number' });
  }

  // Fetch user
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  // Prevent duplicate Patient
  const existingPatient = await Patient.findOne({ user: userId });
  if (existingPatient) {
    return res.status(409).json({ success: false, message: 'Patient profile already exists' });
  }

  // Only admin-created patients get patientCode
  let patientCode = null;
  if (req.user && req.user.role === 'admin') {
    patientCode = `PAT${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  }

  const patient = await Patient.create({
    user: userId,
    patientCode,
    phone: cleanPhone,
    email: email || undefined,
    dateOfBirth: new Date(dateOfBirth),
    gender: gender.toLowerCase(),
    bloodGroup: bloodGroup || 'Not Specified',
    address: address || {},
    allergies: allergies || [],
    emergencyContact: emergencyContact || {},
    occupation: occupation || '',
    maritalStatus: maritalStatus || '',
    notes: referredBy || '',
    createdBy: req.user?._id || user._id
  });

  user.patientProfile = patient._id;
  await user.save();

  res.status(201).json({ success: true, message: 'Patient created successfully', patient });
});

///* ===================== GET PATIENT BY ID ===================== */
const getPatientById = asyncHandler(async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('user', 'name email phone photo status')
      .populate('createdBy', 'name role')
      .lean();

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Calculate age
    let age = patient.age;
    if (!age && patient.dateOfBirth) {
      const birthDate = new Date(patient.dateOfBirth);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    const fullName = `${patient.firstName} ${patient.lastName}`;

    res.json({
      success: true,
      data: {
        _id: patient._id,
        patientId: patient.patientCode,
        patientCode: patient.patientCode,
        userId: patient.user?._id,
        fullName: patient.fullName || patient.user?.name || fullName,
        email: patient.email || patient.user?.email || '',
        phone: patient.phone || patient.user?.phone || '',
        photo: patient.photo || patient.user?.photo || 
          `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=667eea&color=fff`,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup || 'Not Specified',
        status: patient.status || 'active',
        age: age || 'N/A',
        dateOfBirth: patient.dateOfBirth,
        allergies: patient.allergies || [],
        medicalHistory: patient.medicalHistory || [],
        currentMedications: patient.currentMedications || [],
        address: patient.address || {},
        emergencyContact: patient.emergencyContact || {},
        occupation: patient.occupation || '',
        maritalStatus: patient.maritalStatus || '',
        createdAt: patient.createdAt,
        medicalRecords: patient.medicalRecords || [],
        createdBy: patient.createdBy?.name || 'System',
        user: patient.user || {}
      }
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

///* ===================== GET PATIENTS WITH AGGREGATION ===================== */
const getPatients = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || '';

  const [patients, users] = await Promise.all([
    Patient.find().populate('user').lean(),
    User.find({ role: 'patient' }).lean()
  ]);

  const usersWithNoPatient = users.filter(u => !patients.some(p => p.user?._id.toString() === u._id.toString()));

  let finalList = [
    ...patients.map(p => ({
      _id: p._id,
      patientCode: p.patientCode,
      name: p.user?.name,
      phone: p.phone || p.user?.phone,
      email: p.email || p.user?.email,
      gender: p.gender,
      age: p.age,
      bloodGroup: p.bloodGroup,
      status: p.status,
      photo: p.photo || p.user?.photo,
      createdAt: p.createdAt,
      createdBy: p.createdBy,
      userId: p.user?._id
    })),
    ...usersWithNoPatient.map(u => ({
      _id: null,
      patientCode: null,
      name: u.name,
      phone: u.phone,
      email: u.email,
      gender: null,
      age: null,
      bloodGroup: null,
      status: u.status,
      photo: u.photo,
      createdAt: u.createdAt,
      createdBy: u._id,
      userId: u._id
    }))
  ];

  if (search) {
    const regex = new RegExp(search, 'i');
    finalList = finalList.filter(item => regex.test(item.name || '') || regex.test(item.phone || '') || regex.test(item.email || '') || regex.test(item.patientCode || ''));
  }

  const total = finalList.length;
  const paginatedList = finalList.slice((page - 1) * limit, page * limit);

  res.json({ success: true, total, page, totalPages: Math.ceil(total / limit), patients: paginatedList });
});





/* ===================== UPDATE PATIENT ===================== */

const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age < 0 ? 0 : age;
};

const updatePatient = asyncHandler(async (req, res) => {
  try {
    const idOrTemp = req.params.id;
    const { fullName, phone, email, gender, medicalHistory, notes, photo, dateOfBirth } = req.body;

    /* ================= FIND USER ================= */
    let user = null;

    if (mongoose.Types.ObjectId.isValid(idOrTemp)) {
      user = await User.findById(idOrTemp);
    }
    if (!user && email) {
      user = await User.findOne({ email });
    }
    if (!user) {
      user = await User.findOne({ tempId: idOrTemp });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    /* ================= FIND / CREATE PATIENT ================= */
    let patient = null;

    if (user.patientProfile) {
      patient = await Patient.findById(user.patientProfile);
    } else {
      patient = await Patient.findOne({ user: user._id });

      if (!patient) {
        patient = await Patient.create({
          user: user._id,
          patientCode: generatePatientCode(),   // ✅ FIX
          phone: user.phone || '',
          email: user.email || '',
          gender: gender ? gender.toLowerCase() : 'other',
          createdBy: user._id,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('2000-01-01'),
          age: dateOfBirth ? calculateAge(dateOfBirth) : 0
        });

        user.patientProfile = patient._id;
        await user.save();
      }
    }

    /* ================= UPDATE USER ================= */
    if (fullName) user.name = fullName;

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        return res.status(400).json({ success: false, message: 'Invalid phone number' });
      }

      const exists = await User.findOne({ phone: cleanPhone, _id: { $ne: user._id } });
      if (exists) {
        return res.status(409).json({ success: false, message: 'Phone already in use' });
      }

      user.phone = cleanPhone;
      patient.phone = cleanPhone;
    }

    if (email) {
      user.email = email;
      patient.email = email;
    }

    /* ================= UPDATE PATIENT ================= */
    patient.gender = gender ? gender.toLowerCase() : patient.gender || 'other';
    if (medicalHistory) patient.medicalHistory = medicalHistory;
    if (notes) patient.notes = notes;
    if (photo) patient.photo = photo;

    if (dateOfBirth) {
      patient.dateOfBirth = new Date(dateOfBirth);
      patient.age = calculateAge(dateOfBirth);
    }

    await patient.save();
    await user.save();

    res.json({
      success: true,
      message: 'User/Patient updated successfully',
      user,
      patient
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});




/* ================= GET MEDICAL RECORDS ================= */
const getMedicalRecords = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient record not found'
    });
  }

  res.json({
    success: true,
    records: patient.medicalRecords || []
  });
});

/* ================= CREATE MEDICAL RECORD ================= */
const createMedicalRecord = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient record not found'
    });
  }

  const record = {
    ...req.body,
    doctor: req.user._id,
    date: new Date()
  };

  patient.medicalRecords.unshift(record);
  await patient.save();

  res.status(201).json({
    success: true,
    message: 'Medical record added successfully',
    record: patient.medicalRecords[0]
  });
});

/* ================= DELETE MEDICAL RECORD ================= */
const deleteMedicalRecord = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient record not found'
    });
  }

  patient.medicalRecords = patient.medicalRecords.filter(
    r => r._id.toString() !== req.params.recordId
  );

  await patient.save();

  res.json({
    success: true,
    message: 'Medical record deleted successfully'
  });
});


/* ===================== BULK UPDATE ===================== */
const bulkUpdatePatients = asyncHandler(async (req, res) => {
  const { ids, status } = req.body;

  if (!Array.isArray(ids) || !status) {
    return res.status(400).json({ success: false });
  }

  await User.updateMany(
    { _id: { $in: ids }, role: 'patient' },
    { status }
  );

  res.json({ success: true, message: 'Patients updated' });
});

/* ===================== UPLOAD PHOTO ===================== */
const uploadPatientPhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  // ✅ Upload directly from buffer to Cloudinary
  const result = await cloudinary.uploader.upload(
    `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
    {
      folder: "patients",
      width: 400,
      height: 400,
      crop: "fill",
    }
  );

  // ✅ Save Cloudinary URL only
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { photo: result.secure_url },
    { new: true }
  ).select("-password");

  res.status(200).json({
    success: true,
    photo: user.photo,
    public_id: result.public_id,
  });
});

/* ===================== DELETE PATIENT ===================== */
const deletePatient = asyncHandler(async (req, res) => {
  const id = req.params.id;

  let user = null;

  // 1️⃣ Try User _id
  if (mongoose.Types.ObjectId.isValid(id)) {
    user = await User.findById(id);
  }

  // 2️⃣ Try tempId
  if (!user) {
    user = await User.findOne({ tempId: id });
  }

  // 3️⃣ Try patientId → get user
  if (!user && mongoose.Types.ObjectId.isValid(id)) {
    const patient = await Patient.findById(id);
    if (patient) {
      user = await User.findById(patient.user);
    }
  }

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // 4️⃣ Delete Patient
  await Patient.deleteOne({ user: user._id });

  // 5️⃣ Delete User
  await User.findByIdAndDelete(user._id);

  res.json({ success: true, message: 'User & Patient deleted successfully' });
});


/* ===================== EXPORT ALL ===================== */
module.exports = {
  getPatients,
  getPatientStats,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientById,
  getMedicalRecords,
  createMedicalRecord,
  deleteMedicalRecord,
  bulkUpdatePatients,
  uploadPatientPhoto
};
