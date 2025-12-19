const drive = require("../config/googleDrive");
const fs = require("fs");

const FOLDER_ID = "DRIVE_FOLDER_ID"; // Replace with your actual folder ID

const uploadToDrive = async (file) => {
  const response = await drive.files.create({
    requestBody: {
      name: file.originalname,
      parents: [FOLDER_ID],
    },
    media: {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    },
  });

  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: { role: "reader", type: "anyone" },
  });

  fs.unlinkSync(file.path);

  return `https://drive.google.com/uc?id=${response.data.id}`;
};

module.exports = uploadToDrive;
