const Notification = require('../models/Notification');
const User = require('../models/userModels');

// Helper to create role-based notifications
const createRoleBasedNotification = async (data) => {
  const {
    type,
    title,
    message,
    triggeredBy,
    visibleToRoles = [],
    relatedTo = null,
    priority = 'medium',
    icon = null,
    actionLink = null
  } = data;

  // Get all users with specified roles
  const users = await User.find({ role: { $in: visibleToRoles } });
  
  if (users.length === 0) {
    console.log('No users found for roles:', visibleToRoles);
    return null;
  }

  const recipients = users.map(user => ({
    user: user._id,
    role: user.role
  }));

  const notification = await Notification.create({
    type,
    title,
    message,
    triggeredBy,
    recipients,
    visibleToRoles,
    relatedTo,
    priority,
    icon,
    actionLink
  });

  // Real-time notification can be emitted here
  // io.emit('new-notification', notification);

  return notification;
};

// Specific notification creators
const notifyPatientCreated = async (patient, createdBy) => {
  const user = await User.findById(createdBy);
  
  let visibleToRoles = [];
  let message = '';
  
  if (user.role === 'admin') {
    // Admin created patient - notify doctors and therapists
    visibleToRoles = ['doctor', 'therapist'];
    message = `Admin ${user.name} created a new patient: ${patient.fullName}`;
  } else if (user.role === 'doctor' || user.role === 'therapist') {
    // Doctor/Therapist created patient - notify admin
    visibleToRoles = ['admin'];
    message = `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} ${user.name} created a new patient: ${patient.fullName}`;
  }

  if (visibleToRoles.length > 0) {
    return createRoleBasedNotification({
      type: 'patient_created',
      title: 'New Patient Added',
      message,
      triggeredBy: createdBy,
      visibleToRoles,
      relatedTo: {
        model: 'Patient',
        id: patient._id
      },
      icon: '👤',
      actionLink: `/patients/${patient._id}`
    });
  }
};

const notifyDoctorCreated = async (doctor, createdBy) => {
  const user = await User.findById(createdBy);
  
  // Admin creates doctor - notify all admins and the doctor themselves
  if (user.role === 'admin') {
    const admins = await User.find({ role: 'admin' });
    const doctorUser = await User.findById(doctor.user);
    
    const recipients = [
      ...admins.map(admin => ({
        user: admin._id,
        role: 'admin'
      })),
      {
        user: doctor.user,
        role: 'doctor'
      }
    ];

    const notification = await Notification.create({
      type: 'doctor_created',
      title: 'New Doctor Added',
      message: `Admin ${user.name} added a new doctor: ${doctorUser.name}`,
      triggeredBy: createdBy,
      recipients,
      visibleToRoles: ['admin', 'doctor'],
      relatedTo: {
        model: 'Doctor',
        id: doctor._id
      },
      icon: '👨‍⚕️',
      actionLink: `/doctors/${doctor._id}`
    });

    return notification;
  }
};

const notifyTherapyCreated = async (therapy, createdBy) => {
  const user = await User.findById(createdBy);
  
  // Therapy created - notify admins and doctors
  const notification = await createRoleBasedNotification({
    type: 'therapy_created',
    title: 'New Therapy Added',
    message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} ${user.name} created a new therapy: ${therapy.name}`,
    triggeredBy: createdBy,
    visibleToRoles: ['admin', 'doctor'],
    relatedTo: {
      model: 'Therapy',
      id: therapy._id
    },
    icon: '💆',
    actionLink: `/therapies/${therapy._id}`
  });

  return notification;
};

// Appointment notifications
const notifyAppointmentCreated = async (appointment, createdBy) => {
  const user = await User.findById(createdBy);
  
  // Notify doctor about new appointment
  const doctorNotification = await Notification.create({
    type: 'appointment_created',
    title: 'New Appointment',
    message: `You have a new appointment with ${appointment.patientName}`,
    triggeredBy: createdBy,
    recipients: [{
      user: appointment.doctor,
      role: 'doctor'
    }],
    relatedTo: {
      model: 'Appointment',
      id: appointment._id
    },
    icon: '📅',
    actionLink: `/appointments/${appointment._id}`,
    priority: 'high'
  });

  // Also notify admins
  await createRoleBasedNotification({
    type: 'appointment_created',
    title: 'New Appointment Created',
    message: `${user.name} created a new appointment`,
    triggeredBy: createdBy,
    visibleToRoles: ['admin'],
    relatedTo: {
      model: 'Appointment',
      id: appointment._id
    },
    icon: '📅',
    actionLink: `/appointments/${appointment._id}`
  });

  return doctorNotification;
};

module.exports = {
  createRoleBasedNotification,
  notifyPatientCreated,
  notifyDoctorCreated,
  notifyTherapyCreated,
  notifyAppointmentCreated
};