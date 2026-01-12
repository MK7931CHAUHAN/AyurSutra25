const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profileControllers");
const { protect } = require("../middleware/authMiddleware");

const { uploadUserImage } = require("../controllers/uploadControllers");
const upload = require("../middleware/upload");

// Upload Image
router.post(
  "/upload-image",
  protect,
  upload.single("photo"),
  uploadUserImage
);

// Profile routes
router.post("/me", protect, profileController.createMyProfile);
router.get("/me", protect, profileController.getMyProfile);
router.put("/me", protect, profileController.updateMyProfile);
router.delete("/me", protect, profileController.deleteMyProfile);

// Password routes
router.put("/password", protect, profileController.changePassword);

// Settings routes
router.put("/settings", protect, profileController.updateSettings);

module.exports = router;