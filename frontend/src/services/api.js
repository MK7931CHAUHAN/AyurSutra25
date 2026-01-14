import axios from "axios";

// const api = axios.create({
//   baseURL: "https://ayur-sutra25.vercel.app/api",
// });


const BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://ayur-sutra25.vercel.app/api"
    : "http://localhost:5000/api"; // backend local port

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 AUTO ADD TOKEN
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

