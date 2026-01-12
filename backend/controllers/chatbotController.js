const ChatBotConversation = require('../models/ChatBot');
const Medicine = require('../models/Medicine');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const User = require('../models/userModels');
const natural = require('natural');       // ✅ added this line
const TfIdf = natural.TfIdf;


// Create Medicine

exports.createMedicine = async (req, res) => {
  try {
    const {
      name,
      genericName,
      brandName,
      activeIngredient,
      category,
      requiresPrescription,
      status,
      description,
      dosage,
      availableForms,
      priceMin,   // <-- frontend sends priceMin
      priceMax,   // <-- frontend sends priceMax
      sideEffects,
      precautions,
      contraindications,
      interactions,
      storageInstructions,
    } = req.body;

    const medicine = new Medicine({
      name,
      genericName,
      brandName,
      activeIngredient,
      category,
      requiresPrescription,
      status,
      storageInstructions,

      description: {
        english: description?.english || '',
        hindi: description?.hindi || '',
        punjabi: description?.punjabi || '',
      },

      dosage: {
        english: dosage?.english || '',
        hindi: dosage?.hindi || '',
        punjabi: dosage?.punjabi || '',
      },

      availableForms: availableForms || [],

      // 🔹 FIXED: Use priceMin and priceMax from frontend
      priceRange: {
        min: Number(priceMin) || 0,
        max: Number(priceMax) || 0,
        currency: 'INR',
      },

      sideEffects: sideEffects || [],
      precautions: precautions || [],
      contraindications: contraindications || [],
      interactions: interactions || [],
    });

    await medicine.save();

    res.status(201).json({ success: true, medicine });
  } catch (error) {
    console.error("Failed to save medicine:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    const medicine = await Medicine.findByIdAndDelete(id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    res.json({
      success: true,
      message: `Medicine "${medicine.name}" deleted successfully`,
    });
  } catch (error) {
    console.error("Failed to delete medicine:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// UPDATE
exports.updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      medicine
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMedicines = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // 🔍 SEARCH
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { brandName: { $regex: search, $options: 'i' } },
        { activeIngredient: { $regex: search, $options: 'i' } }
      ];
    }

    // 🎯 FILTERS
    if (category) query.category = category;
    if (status) query.status = status;

    // 📄 PAGINATION
    const skip = (page - 1) * limit;

    const medicines = await Medicine.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Medicine.countDocuments(query);

    res.json({
      success: true,
      medicines,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


//--------------- Conversation Handlers ---------------//
// Helper function for symptom analysis
const analyzeSymptoms = async (text, language = 'english') => {
  const symptoms = extractSymptoms(text);
  const diagnosis = generateDiagnosis(symptoms);
  const severity = determineSeverity(symptoms);
  
  // Get medicines based on symptoms
  const medicines = await getMedicinesForSymptoms(symptoms, language);
  
  // Get doctor recommendations
  const doctors = await getDoctorsForSymptoms(symptoms);
  
  return {
    symptoms,
    diagnosis,
    severity,
    medicines,
    doctors
  };
};

// Get all medicine categories
exports.getMedicineCategories = async (req, res) => {
  try {
    const categories = await Medicine.distinct('category');
    
    res.json({
      success: true,
      categories: categories || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// Get medicine by ID
exports.getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }
    
    res.json({
      success: true,
      medicine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get doctors for symptoms
exports.getDoctorsForSymptoms = async (req, res) => {
  try {
    const { symptoms = '' } = req.query;
    const symptomList = symptoms.split(',').filter(s => s.trim());
    
    let doctors = [];
    
    if (symptomList.length > 0) {
      // Map symptoms to doctor specializations
      const symptomToSpecialization = {
        'fever': ['general', 'internal_medicine'],
        'headache': ['neurology', 'general'],
        'cough': ['pulmonology', 'general'],
        'vomiting': ['gastroenterology', 'general'],
        'allergy': ['allergology', 'immunology'],
        'pain': ['pain_management', 'orthopedics']
      };
      
      const specializations = [];
      symptomList.forEach(symptom => {
        if (symptomToSpecialization[symptom]) {
          specializations.push(...symptomToSpecialization[symptom]);
        }
      });
      
      const uniqueSpecializations = [...new Set(specializations)];
      
      if (uniqueSpecializations.length > 0) {
        doctors = await Doctor.find({
          specialization: { $in: uniqueSpecializations },
          isAvailable: true
        })
        .populate('user', 'name email phone')
        .limit(5);
      }
    }
    
    // If no specific doctors found or no symptoms, get general doctors
    if (doctors.length === 0) {
      doctors = await Doctor.find({ isAvailable: true })
        .populate('user', 'name email phone')
        .limit(5);
    }
    
    res.json({
      success: true,
      doctors: doctors.map(doc => ({
        _id: doc._id,
        name: doc.user?.name || 'Doctor',
        specialization: doc.specialization.join(', '),
        experience: doc.experience,
        consultationFee: doc.consultationFee,
        contact: doc.user?.phone || 'Not available',
        availableDays: doc.availableDays,
        workingHours: doc.workingHours,
        rating: doc.rating,
        isAvailable: doc.isAvailable
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get medicines by symptoms
exports.getMedicinesBySymptoms = async (req, res) => {
  try {
    const { symptoms = '', language = 'english', limit = 5 } = req.query;
    const symptomList = symptoms.split(',').filter(s => s.trim());
    
    let medicines = [];
    
    if (symptomList.length > 0) {
      medicines = await Medicine.find({
        category: { $in: symptomList },
        status: 'active'
      })
      .sort({ name: 1 })
      .limit(parseInt(limit));
    } else {
      medicines = await Medicine.find({ status: 'active' })
        .sort({ name: 1 })
        .limit(parseInt(limit));
    }
    
    // Format response with language-specific fields
    const formattedMedicines = medicines.map(med => ({
      _id: med._id,
      name: med.name,
      genericName: med.genericName,
      description: med.description[language] || med.description.english || '',
      dosage: med.dosage[language] || med.dosage.english || '',
      activeIngredient: med.activeIngredient,
      category: med.category,
      sideEffects: med.sideEffects,
      precautions: med.precautions,
      storageInstructions: med.storageInstructions,
      requiresPrescription: med.requiresPrescription,
      priceRange: med.priceRange,
      availableForms: med.availableForms,
      relatedSymptom: med.category
    }));
    
    res.json({
      success: true,
      medicines: formattedMedicines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Enhanced analyze symptoms API
exports.analyzeSymptoms = async (req, res) => {
  try {
    const { text, language = 'english' } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for symptom analysis'
      });
    }
    
    const analysis = await analyzeSymptoms(text, language);
    
    res.json({
      success: true,
      ...analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get chatbot statistics
exports.getChatbotStats = async (req, res) => {
  try {
    const { doctorId, patientId, startDate, endDate } = req.query;
    
    const query = {};
    
    if (doctorId) query.doctorId = doctorId;
    if (patientId) query.patientId = patientId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const stats = await ChatBotConversation.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalConversations: { $sum: 1 },
          activeConversations: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedConversations: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          avgMessages: { $avg: { $size: '$messages' } },
          totalPatients: { $addToSet: '$patientId' },
          totalDoctors: { $addToSet: '$doctorId' }
        }
      },
      {
        $project: {
          _id: 0,
          totalConversations: 1,
          activeConversations: 1,
          completedConversations: 1,
          avgMessages: { $round: ['$avgMessages', 2] },
          totalPatients: { $size: '$totalPatients' },
          totalDoctors: { $size: '$totalDoctors' }
        }
      }
    ]);
    
    // Get most common symptoms
    const commonSymptoms = await ChatBotConversation.aggregate([
      { $match: query },
      { $unwind: '$symptoms' },
      {
        $group: {
          _id: '$symptoms',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get most prescribed medicines
    const prescribedMedicines = await ChatBotConversation.aggregate([
      { $match: query },
      { $unwind: '$suggestedMedicines' },
      {
        $group: {
          _id: '$suggestedMedicines.name',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      success: true,
      stats: stats[0] || {
        totalConversations: 0,
        activeConversations: 0,
        completedConversations: 0,
        avgMessages: 0,
        totalPatients: 0,
        totalDoctors: 0
      },
      commonSymptoms,
      prescribedMedicines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Export conversation data
exports.exportConversation = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { format = 'json' } = req.query;
    
    const conversation = await ChatBotConversation.findOne({ sessionId })
      .populate('patientId', 'firstName lastName age gender phone')
      .populate('doctorId', 'name specialization consultationFee')
      .populate('doctorReferred', 'name specialization contact');
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    const exportData = {
      sessionId: conversation.sessionId,
      patient: {
        name: `${conversation.patientId?.firstName} ${conversation.patientId?.lastName}`,
        age: conversation.patientId?.age,
        gender: conversation.patientId?.gender,
        phone: conversation.patientId?.phone
      },
      doctor: {
        name: conversation.doctorId?.name,
        specialization: conversation.doctorId?.specialization,
        fee: conversation.doctorId?.consultationFee
      },
      conversation: {
        startTime: conversation.startedAt,
        endTime: conversation.endedAt,
        duration: conversation.endedAt ? 
          Math.round((conversation.endedAt - conversation.startedAt) / (1000 * 60)) + ' minutes' : 
          'Ongoing',
        language: conversation.language,
        status: conversation.status
      },
      medical: {
        symptoms: conversation.symptoms,
        diagnosis: conversation.diagnosis,
        severity: conversation.severity,
        suggestedMedicines: conversation.suggestedMedicines,
        doctorReferred: conversation.doctorReferred ? {
          name: conversation.doctorReferred.name,
          specialization: conversation.doctorReferred.specialization,
          contact: conversation.doctorReferred.contact
        } : null
      },
      messages: conversation.messages.map(msg => ({
        text: msg.text,
        sender: msg.sender,
        timestamp: msg.timestamp,
        metadata: msg.metadata
      }))
    };
    
    if (format === 'pdf') {
      // Generate PDF (you would implement PDF generation here)
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=conversation-${sessionId}.pdf`);
      // Return PDF buffer
      return res.send(generatePDF(exportData));
    } else if (format === 'csv') {
      // Generate CSV
      const csv = generateCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=conversation-${sessionId}.csv`);
      return res.send(csv);
    } else {
      // Default JSON
      res.json({
        success: true,
        data: exportData
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper functions for CSV/PDF generation
function generateCSV(data) {
  let csv = 'Session ID,Patient,Doctor,Start Time,End Time,Symptoms,Diagnosis,Severity\n';
  csv += `${data.sessionId},"${data.patient.name}","${data.doctor.name}",${data.conversation.startTime},${data.conversation.endTime},"${data.medical.symptoms.join(', ')}",${data.medical.diagnosis},${data.medical.severity}\n\n`;
  csv += 'Messages\n';
  csv += 'Timestamp,Sender,Message\n';
  data.messages.forEach(msg => {
    csv += `${msg.timestamp},${msg.sender},"${msg.text.replace(/"/g, '""')}"\n`;
  });
  return csv;
}

// Enhanced symptom extraction with NLP
function extractSymptoms(text) {
  const symptoms = [];
  const lowerText = text.toLowerCase();
  
  // Enhanced symptom mapping with synonyms
  const symptomMap = {
    fever: ['fever', 'temperature', 'hot', 'burning', 'heat', 'pyrexia', 'hot body'],
    headache: ['headache', 'migraine', 'head pain', 'cephalalgia', 'head throbbing'],
    cough: ['cough', 'coughing', 'cold', 'dry cough', 'wet cough', 'whooping cough', 'cough up'],
    vomiting: ['vomit', 'nausea', 'throwing up', 'puke', 'regurgitate', 'sick', 'queasy'],
    allergy: ['allergy', 'sneezing', 'itching', 'rash', 'hives', 'allergic', 'runny nose', 'watery eyes'],
    pain: ['pain', 'ache', 'sore', 'hurting', 'discomfort', 'tenderness', 'aching'],
    diarrhea: ['diarrhea', 'loose stool', 'bowel', 'dysentery', 'gastro'],
    fatigue: ['fatigue', 'tired', 'exhausted', 'weakness', 'lethargy', 'sleepy'],
    dizziness: ['dizziness', 'vertigo', 'lightheaded', 'unsteady', 'woozy'],
    chest_pain: ['chest pain', 'heart pain', 'chest tightness', 'angina']
  };
  
  for (const [symptom, keywords] of Object.entries(symptomMap)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      symptoms.push(symptom);
    }
  }
  
  return symptoms;
}

// Enhanced diagnosis generation
function generateDiagnosis(symptoms) {
  const diagnoses = {
    'fever,cough': 'Possible flu or upper respiratory infection',
    'fever,headache': 'Possible viral infection or meningitis',
    'fever,vomiting,diarrhea': 'Possible gastroenteritis or food poisoning',
    'headache,vomiting': 'Possible migraine or increased intracranial pressure',
    'cough,chest_pain': 'Possible bronchitis or pneumonia',
    'allergy,sneezing': 'Allergic rhinitis or hay fever',
    'fatigue,dizziness': 'Possible anemia or low blood pressure',
    'fever,fatigue': 'Possible viral syndrome or mononucleosis'
  };
  
  const symptomKey = symptoms.sort().join(',');
  
  for (const [key, diagnosis] of Object.entries(diagnoses)) {
    const keySymptoms = key.split(',');
    if (keySymptoms.every(symptom => symptoms.includes(symptom))) {
      return diagnosis;
    }
  }
  
  if (symptoms.length > 0) {
    return `Symptoms: ${symptoms.join(', ')}. Consultation needed.`;
  }
  
  return 'General consultation needed';
}

// Enhanced severity determination
function determineSeverity(symptoms) {
  const criticalSymptoms = ['chest_pain', 'difficulty_breathing', 'severe_bleeding'];
  const highSymptoms = ['fever', 'vomiting', 'severe_pain', 'dizziness'];
  const mediumSymptoms = ['headache', 'cough', 'allergy', 'fatigue'];
  
  if (symptoms.some(s => criticalSymptoms.includes(s))) {
    return 'Critical - Seek immediate medical attention';
  } else if (symptoms.some(s => highSymptoms.includes(s))) {
    return 'High - Consult doctor within 24 hours';
  } else if (symptoms.some(s => mediumSymptoms.includes(s))) {
    return 'Medium - Schedule doctor appointment';
  }
  return 'Low - Monitor and rest';
}

// Enhanced medicine recommendation with scoring
async function getMedicinesForSymptoms(symptoms, language) {
  if (!symptoms || symptoms.length === 0) {
    return [];
  }
  
  try {
    // Find medicines matching symptoms
    const medicines = await Medicine.find({
      $or: [
        { category: { $in: symptoms } },
        { name: { $regex: symptoms.join('|'), $options: 'i' } },
        { genericName: { $regex: symptoms.join('|'), $options: 'i' } }
      ],
      status: 'active'
    })
    .sort({ requiresPrescription: 1, name: 1 })
    .limit(10);
    
    // Score and rank medicines
    const scoredMedicines = medicines.map(med => {
      let score = 0;
      
      // Exact category match
      if (symptoms.includes(med.category)) {
        score += 3;
      }
      
      // Name contains symptom
      symptoms.forEach(symptom => {
        if (med.name.toLowerCase().includes(symptom) || 
            med.genericName.toLowerCase().includes(symptom)) {
          score += 2;
        }
      });
      
      // Non-prescription preferred for minor symptoms
      if (!med.requiresPrescription && symptoms.every(s => 
        ['headache', 'cough', 'allergy'].includes(s))) {
        score += 1;
      }
      
      return { ...med.toObject(), score };
    });
    
    // Sort by score
    scoredMedicines.sort((a, b) => b.score - a.score);
    
    return scoredMedicines.map(med => ({
      _id: med._id,
      name: med.name,
      dosage: med.dosage[language] || med.dosage.english || '',
      description: med.description[language] || med.description.english || '',
      activeIngredient: med.activeIngredient,
      category: med.category,
      sideEffects: med.sideEffects,
      precautions: med.precautions,
      storageInstructions: med.storageInstructions,
      requiresPrescription: med.requiresPrescription,
      priceRange: med.priceRange,
      availableForms: med.availableForms,
      score: med.score
    }));
  } catch (error) {
    console.error('Error getting medicines:', error);
    return [];
  }
}

// Get doctors based on symptoms
async function getDoctorsForSymptoms(symptoms) {
  if (!symptoms || symptoms.length === 0) {
    return [];
  }
  
  try {
    // Map symptoms to doctor specializations
    const symptomToSpecialization = {
      'fever': ['general', 'internal_medicine'],
      'headache': ['neurology'],
      'cough': ['pulmonology'],
      'vomiting': ['gastroenterology'],
      'allergy': ['allergology'],
      'pain': ['pain_management', 'orthopedics']
    };
    
    const specializations = [];
    symptoms.forEach(symptom => {
      if (symptomToSpecialization[symptom]) {
        specializations.push(...symptomToSpecialization[symptom]);
      }
    });
    
    const uniqueSpecializations = [...new Set(specializations)];
    
    let doctors = [];
    
    if (uniqueSpecializations.length > 0) {
      doctors = await Doctor.find({
        specialization: { $in: uniqueSpecializations },
        isAvailable: true
      })
      .populate('user', 'name email phone')
      .limit(3);
    } else {
      // Fallback to general doctors
      doctors = await Doctor.find({
        specialization: 'general',
        isAvailable: true
      })
      .populate('user', 'name email phone')
      .limit(3);
    }
    
    return doctors.map(doc => ({
      _id: doc._id,
      name: doc.user?.name || 'Doctor',
      specialization: doc.specialization.join(', '),
      experience: doc.experience,
      consultationFee: doc.consultationFee,
      contact: doc.user?.phone || 'Not available',
      rating: doc.rating,
      isAvailable: doc.isAvailable
    }));
  } catch (error) {
    console.error('Error getting doctors:', error);
    return [];
  }
}