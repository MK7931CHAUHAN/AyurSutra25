const express = require('express');
const router = express.Router();
const { searchAll } = require('../controllers/searchController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get(
  '/',
  protect,
  authorize('admin', 'superadmin', 'doctor', 'patient'),
  searchAll
);

module.exports = router;
