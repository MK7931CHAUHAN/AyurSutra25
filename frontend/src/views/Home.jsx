import React, { useState } from "react";
import axios from "axios";

const Home = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  const userId = "64abc123xyz"; // 🔴 real userId from login later

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!image) {
      setMessage("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await axios.post(
        `http://localhost:5000/api/users/upload/${userId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setMessage(res.data.message);
    }catch (error) {
  console.error("Full error:", error);

  if (error.response && error.response.data) {
    setMessage(
      error.response.data.message ||
      error.response.data.error ||
      "Server error"
    );
  } else if (error.request) {
    setMessage("Server से response नहीं आया");
  } else {
    setMessage(error.message);
  }
}

  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-green-100 to-green-200 p-6">

      <h1 className="text-5xl font-extrabold text-green-900 mb-2">
        Welcome to AyurSutra
      </h1>
      <p className="text-lg text-green-800 mb-8">
        Your gateway to holistic wellness.
      </p>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 text-center">

        <h2 className="text-2xl font-semibold text-green-900 mb-4">
          Upload Profile Image
        </h2>

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border"
          />
        )}

        <form onSubmit={handleUpload}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-green-700
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:bg-green-100 file:text-green-800
              hover:file:bg-green-200 cursor-pointer"
          />

          <button
            type="submit"
            className="mt-6 bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700"
          >
            Upload
          </button>
        </form>

        {message && (
          <p className="mt-4 text-green-700 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
};

export default Home;
