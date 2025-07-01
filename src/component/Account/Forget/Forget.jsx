import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Notification from "../..//Notification/Notification";
import "./Forget.css";
import { FiMail, FiLock, FiArrowLeft } from "react-icons/fi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1 = request, 2 = reset
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "https://ecommerce-backend-da9u.onrender.com/api/password-reset/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      showNotification("Password reset email sent. Check your inbox!");
      setStep(1.5); // Show success message but stay on same form
    } catch (error) {
      console.error("Reset request error:", error);
      showNotification(error.message || "Failed to send reset email", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showNotification("Passwords do not match", "error");
      return;
    }

    setLoading(true);

    try {
      // Get the current path and clean it up
      const path = window.location.pathname;
      const cleanPath = path.replace(/\/+/g, "/"); // Remove duplicate slashes

      // Extract the last two segments (uidb64 and token)
      const segments = cleanPath.split("/").filter(Boolean);
      const uidb64 = segments[segments.length - 2];
      const token = segments[segments.length - 1];

      const response = await fetch(
        `https://ecommerce-backend-da9u.onrender.com/api/password-reset-confirm/${uidb64}/${token}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ new_password: newPassword }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to reset password");
      }

      const data = await response.json();
      showNotification("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login/"), 2000);
    } catch (error) {
      console.error("Reset error:", error);
      showNotification(
        error.message || "Failed to reset password. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Check if this is a password reset confirmation link
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("/reset-password/")) {
      setStep(2);
    }
  }, []);

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <Link to="/login/" className="back-to-login">
          <FiArrowLeft /> Back to login
        </Link>

        <div className="forgot-password-header">
          <h1>{step === 2 ? "Reset Your Password" : "Forgot Password"}</h1>
          <p>
            {step === 2
              ? "Enter your new password below"
              : step === 1.5
              ? "Check your email for the reset link"
              : "Enter your email and we'll send you a link to reset your password"}
          </p>
        </div>

        {step === 1 || step === 1.5 ? (
          <form onSubmit={handleRequestReset} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={step === 1.5}
                />
              </div>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={loading || step === 1.5}
            >
              {loading
                ? "Sending..."
                : step === 1.5
                ? "Email Sent!"
                : "Send Reset Link"}
            </button>

            {step === 1.5 && (
              <div className="resend-link">
                Didn't receive the email?{" "}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="resend-button"
                >
                  Resend
                </button>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength="8"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength="8"
                />
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default ForgotPassword;
