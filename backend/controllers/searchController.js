const Patient = require('../models/patientModels');
const Doctor = require('../models/doctorModels');
const Appointment = require('../models/appointmentModels');
const User = require('../models/userModels');

const searchAll = async (req, res) => {
  try {
    const { q, role } = req.query;
    const userRole = role || req.user?.role;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please enter a search query"
      });
    }

    const regex = new RegExp(q, "i");
    const searchResults = {
      patients: [],
      doctors: [],
      appointments: [],
      users: []
    };

    switch (userRole) {
      case 'superadmin':
      case 'admin':
        [
          searchResults.patients,
          searchResults.doctors,
          searchResults.appointments,
          searchResults.users
        ] = await Promise.all([
          Patient.find({
            $or: [
              { fullName: regex },
              { phone: regex },
              { patientId: regex },
              { email: regex },
              { address: regex }
            ]
          }).limit(10),

          Doctor.find({
            $or: [
              { specialization: regex },
              { department: regex },
              { qualification: regex }
            ]
          })
          .populate("user", "name email phone")
          .limit(10),

          Appointment.find({
            $or: [
              { status: regex },
              { appointmentId: regex },
              { notes: regex }
            ]
          })
          .populate("patient", "fullName patientId")
          .populate("doctor", "specialization department")
          .limit(10),

          User.find({
            $or: [
              { name: regex },
              { email: regex },
              { phone: regex },
              { role: regex }
            ]
          }).limit(5)
        ]);
        break;

      case 'doctor': {
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (doctor) {
          searchResults.patients = await Patient.find({
            assignedDoctor: doctor._id,
            $or: [
              { fullName: regex },
              { phone: regex },
              { patientId: regex }
            ]
          }).limit(10);
        }
        break;
      }

      case 'patient':
        searchResults.doctors = await Doctor.find({
          $or: [{ specialization: regex }, { department: regex }]
        })
        .populate("user", "name email phone")
        .limit(5);
        break;
    }

    res.json({
      success: true,
      results: searchResults,
      counts: {
        patients: searchResults.patients.length,
        doctors: searchResults.doctors.length,
        appointments: searchResults.appointments.length,
        users: searchResults.users.length
      }
    });

  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = { searchAll };
