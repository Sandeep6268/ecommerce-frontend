// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ecommerce-backend-da9u.onrender.com/api/',  // ✅ Correct backend
  withCredentials: true,  // ✅ Only if using session auth
});

export default api;
