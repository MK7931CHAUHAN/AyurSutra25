const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const User = require('../models/userModels');

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private
const createNotification = asyncHandler(async (req, res) => {
  const {
    type,
    title,
    message,
    recipients = [],
    visibleToRoles = [],
    relatedTo,
    priority,
    icon,
    actionLink,
    expiresAt
  } = req.body;

  // Default to all admins if no recipients specified
  let finalRecipients = recipients;
  
  if (visibleToRoles.length > 0 && recipients.length === 0) {
    const users = await User.find({ role: { $in: visibleToRoles } });
    finalRecipients = users.map(user => ({
      user: user._id,
      role: user.role
    }));
  }

  // Add current user if not already in recipients
  const isUserInRecipients = finalRecipients.some(
    recipient => recipient.user.toString() === req.user.id.toString()
  );
  
  if (!isUserInRecipients) {
    finalRecipients.push({
      user: req.user.id,
      role: req.user.role
    });
  }

  const notification = await Notification.create({
    type,
    title,
    message,
    triggeredBy: req.user.id,
    recipients: finalRecipients,
    visibleToRoles,
    relatedTo,
    priority,
    icon,
    actionLink,
    expiresAt: expiresAt ? new Date(expiresAt) : null
  });

  // Populate for response
  await notification.populate([
    { path: 'triggeredBy', select: 'name email role photo' },
    { path: 'recipients.user', select: 'name email role' }
  ]);

  // Emit real-time notification (if using Socket.io)
  // io.emit('new-notification', notification);

  res.status(201).json({
    success: true,
    notification
  });
});

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;
  
  const query = {
    'recipients.user': req.user.id
  };

  if (unreadOnly) {
    query['recipients.read'] = false;
  }

  const notifications = await Notification.find(query)
    .populate('triggeredBy', 'name email role photo')
    .populate('recipients.user', 'name email role')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  // Count unread notifications
  const unreadCount = await Notification.countDocuments({
    'recipients.user': req.user.id,
    'recipients.read': false
  });

  // Count total notifications
  const total = await Notification.countDocuments({
    'recipients.user': req.user.id
  });

  res.json({
    success: true,
    notifications,
    unreadCount,
    total,
    currentPage: Number(page),
    totalPages: Math.ceil(total / limit)
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  // Find the recipient in the array
  const recipientIndex = notification.recipients.findIndex(
    recipient => recipient.user.toString() === req.user.id.toString()
  );

  if (recipientIndex === -1) {
    return res.status(403).json({
      success: false,
      message: 'You are not a recipient of this notification'
    });
  }

  // Update read status
  notification.recipients[recipientIndex].read = true;
  notification.recipients[recipientIndex].readAt = new Date();

  // Check if all recipients have read
  const allRead = notification.recipients.every(recipient => recipient.read);
  notification.isReadByAll = allRead;

  await notification.save();

  res.json({
    success: true,
    message: 'Notification marked as read'
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      'recipients.user': req.user.id,
      'recipients.read': false
    },
    {
      $set: {
        'recipients.$[elem].read': true,
        'recipients.$[elem].readAt': new Date()
      }
    },
    {
      arrayFilters: [{ 'elem.user': req.user.id, 'elem.read': false }],
      multi: true
    }
  );

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  // Check if user is recipient
  const isRecipient = notification.recipients.some(
    recipient => recipient.user.toString() === req.user.id.toString()
  );

  if (!isRecipient && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this notification'
    });
  }

  await notification.deleteOne();

  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

// @desc    Get notification stats
// @route   GET /api/notifications/stats
// @access  Private
const getNotificationStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalNotifications,
    unreadNotifications,
    todayNotifications,
    highPriorityNotifications
  ] = await Promise.all([
    Notification.countDocuments({ 'recipients.user': req.user.id }),
    Notification.countDocuments({
      'recipients.user': req.user.id,
      'recipients.read': false
    }),
    Notification.countDocuments({
      'recipients.user': req.user.id,
      createdAt: { $gte: today }
    }),
    Notification.countDocuments({
      'recipients.user': req.user.id,
      'recipients.read': false,
      priority: { $in: ['high', 'urgent'] }
    })
  ]);

  res.json({
    success: true,
    stats: {
      total: totalNotifications,
      unread: unreadNotifications,
      today: todayNotifications,
      highPriority: highPriorityNotifications
    }
  });
});

module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats
};