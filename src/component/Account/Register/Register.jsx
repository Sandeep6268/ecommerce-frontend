import React, { useState } from "react";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import Notification from "../../Notification/Notification";
import ConfirmationModal from "../../ConfirmationModal/ConfirmationModal";
import { FiCheckCircle } from "react-icons/fi";

const Register = () => {
  const [formData, setFormData] = useState({
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  password: "",
  re_password: "",
});

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Add this function to handle modal close
  const handleCloseModal = () => {
    setShowSuccessModal(false);
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
      const response = await fetch(
  "https://ecommerce-backend-da9u.onrender.com/api/auth/users/",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  }
);


      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Registration error:", error);
      showNotification(
        error.message || "Registration failed. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSuccess = () => {
    setShowSuccessModal(false);
    navigate("/login/");
  };

  return (
    <>
      <div className="register-form-container my-3">
        <h1 className="register-title">Create Account</h1>
        <p className="register-subtitle">
          Please fill in the information below:
        </p>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

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
              placeholder="Create a password (min 8 characters)"
              minLength="8"
              required
            />
          </div>
          <div className="form-group">
  <label htmlFor="re_password">Confirm Password</label>
  <input
    type="password"
    id="re_password"
    name="re_password"
    value={formData.re_password}
    onChange={handleChange}
    placeholder="Confirm your password"
    required
  />
</div>


          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Creating Account..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <div className="login-link">
          Already have an account? <Link to={"/login/"}>Login</Link>
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
        onClose={handleCloseModal} /* Use the defined function here */
        onConfirm={handleConfirmSuccess}
        title="Registration Successful!"
        message="Your account has been created successfully."
        confirmText="Continue to Login"
        icon={FiCheckCircle}
        type="success"
      />
    </>
  );
};

export default Register;
