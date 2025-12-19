const fs = require("fs");
const path = require("path");
const drive = require("../config/googleDrive");

exports.uploadUserImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Image file required",
      });
    }

    res.status(200).json({
      message: "Image uploaded successfully",
      imagePath: `/uploads/profiles/${req.file.originalname}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
  
