import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import Notification from "../../Notification/Notification";
import ConfirmationModal from "../../ConfirmationModal/ConfirmationModal";
import { FiCheckCircle } from "react-icons/fi";
import axios from "axios";
// Create an axios instance with default settings
const api = axios.create({
  baseURL: 'https://ecommerce-backend-da9u.onrender.com/api/',
  withCredentials: true,
});

// Add CSRF token to all requests
api.interceptors.request.use(async (config) => {
  // Get CSRF token from cookie
  const csrfToken = document.cookie.split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  
  return config;
});

const getCSRFToken = async () => {
  await axios.get("https://ecommerce-backend-da9u.onrender.com/api/csrf/", {
    withCredentials: true,
  });
};
const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await api.post('/auth/jwt/create/', {
      username: formData.email,  // Using email as username
      password: formData.password,
    });

    localStorage.setItem('accessToken', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);

    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
    
    setShowSuccessModal(true);
  } catch (err) {
    console.error("Login failed:", err);
    showNotification(err.response?.data?.detail || 'Login failed', 'error');
  } finally {
    setLoading(false);
  }
};








  const handleConfirmSuccess = () => {
    setShowSuccessModal(false);
    navigate("/"); // Navigate to dashboard or homepage
  };

  return (
    <>
      <div className="login-container">
        <div className="login-form-container">
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Please enter your e-mail and password:</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="form-options">
              <Link to="/forgot-password/" className="forgot-password">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Logging in..." : "LOG IN"}
            </button>
          </form>

          <div className="signup-link">
            Don't have an account? <Link to={"/register/"}>Create one</Link>
          </div>
        </div>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={handleConfirmSuccess}
        title="Login Successful!"
        message="Welcome back! You have successfully logged in."
        confirmText="Continue to Dashboard"
        icon={FiCheckCircle}
        type="success"
      />
    </>
  );
};

export default Login;