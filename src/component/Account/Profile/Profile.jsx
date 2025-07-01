// import React, { useState, useEffect, useRef } from "react";
// import "./Profile.css";
// import { Link, useNavigate } from "react-router-dom";
// import Notification from "../../Notification/Notification";
// import Header from "../../Header/Header";
// import Footer from "../../Footer/Footer";
// import ConfirmationModal from "../../ConfirmationModal/ConfirmationModal";
// import { FiLogOut, FiEdit, FiX, FiUpload, FiTrash2 } from "react-icons/fi";

// const Profile = () => {
//   const [showLogoutModal, setShowLogoutModal] = useState(false);
//   const [user, setUser] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     address: "",
//     avatar: "",
//     initials: "",
//   });
//   const [editMode, setEditMode] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [notification, setNotification] = useState(null);
//   const navigate = useNavigate();
//   const fileInputRef = useRef(null);

//   const showNotification = (message, type = "success") => {
//     setNotification({ message, type });
//     setTimeout(() => setNotification(null), 3000);
//   };

//   const getRandomColor = () => {
//     const colors = [
//       "#FF6B6B",
//       "#4ECDC4",
//       "#45B7D1",
//       "#FFA07A",
//       "#98D8C8",
//       "#F06292",
//       "#7986CB",
//       "#9575CD",
//     ];
//     return colors[Math.floor(Math.random() * colors.length)];
//   };

//   // Get CSRF token from cookies
//   const getCSRFToken = () => {
//     const cookies = document.cookie.split(";");
//     for (let cookie of cookies) {
//       const [name, value] = cookie.trim().split("=");
//       if (name === "csrftoken") return decodeURIComponent(value);
//     }
//     return null;
//   };

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const response = await fetch(
//           "https://ecommerce-backend-da9u.onrender.com/api/profile/",
//           {
//             method: "GET",
//             credentials: "include",
//             headers: {
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.message || "Failed to fetch profile");
//         }

//         const data = await response.json();

//         let initials = "";
//         if (!data.avatar && data.name) {
//           const nameParts = data.name.split(" ");
//           initials = nameParts
//             .map((part) => part[0])
//             .join("")
//             .toUpperCase();
//         }

//         setUser({
//           name: data.name || "",
//           email: data.email || "",
//           phone: data.phone || "",
//           address: data.address || "",
//           avatar: data.avatar || "",
//           initials,
//         });
//       } catch (error) {
//         console.error("Profile fetch error:", error);
//         showNotification(error.message, "error");
//         if (error.message.includes("Unauthorized")) {
//           navigate("/login/");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, [navigate]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setUser((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleLogoutClick = () => {
//     setShowLogoutModal(true);
//   };

//   const handleConfirmLogout = async () => {
//     setShowLogoutModal(false);
//     try {
//       const response = await fetch(
//         "https://ecommerce-backend-da9u.onrender.com/api/logout/",
//         {
//           method: "POST",
//           credentials: "include",
//           headers: {
//             "Content-Type": "application/json",
//             "X-CSRFToken": getCSRFToken() || "",
//           },
//         }
//       );

//       if (!response.ok) throw new Error("Logout failed");

//       showNotification("Successfully logged out", "success");
//       setTimeout(() => {
//         navigate("/");
//         window.location.reload();
//       }, 1500);
//     } catch (error) {
//       showNotification(error.message, "error");
//     }
//   };

//   const handleAvatarChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setUser((prev) => ({
//           ...prev,
//           avatar: reader.result,
//           initials: "",
//         }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       if (!user.name.trim()) throw new Error("Full name is required");
//       if (!user.email.trim()) throw new Error("Email is required");

//       const formData = new FormData();
//       const nameParts = user.name.trim().split(/\s+/);

//       formData.append("first_name", nameParts[0] || "");
//       formData.append("last_name", nameParts.slice(1).join(" ") || "");
//       formData.append("email", user.email.trim());

//       if (user.phone) formData.append("phone", user.phone.trim());
//       if (user.address) formData.append("address", user.address.trim());

//       if (fileInputRef.current.files[0]) {
//         const file = fileInputRef.current.files[0];
//         if (!file.type.startsWith("image/")) {
//           throw new Error("Please upload an image file");
//         }
//         if (file.size > 2 * 1024 * 1024) {
//           throw new Error("Image size should be less than 2MB");
//         }
//         formData.append("avatar", file);
//       }

//       const csrftoken = getCSRFToken();
//       if (!csrftoken) {
//         throw new Error("Session expired. Please refresh the page.");
//       }

//       const response = await fetch(
//         "https://ecommerce-backend-da9u.onrender.com/api/profile/",
//         {
//           method: "PUT",
//           credentials: "include",
//           headers: {
//             "X-CSRFToken": csrftoken,
//           },
//           body: formData,
//         }
//       );

//       if (response.status === 403) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(
//           errorData.detail || "Authentication failed. Please login again."
//         );
//       }

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Profile update failed");
//       }

//       setUser((prev) => ({
//         ...prev,
//         name: data.name || prev.name,
//         email: data.email || prev.email,
//         phone: data.phone || prev.phone,
//         address: data.address || prev.address,
//         avatar: data.avatar || prev.avatar,
//         initials: data.avatar
//           ? ""
//           : data.name
//           ? data.name
//               .split(" ")
//               .map((n) => n[0])
//               .join("")
//               .toUpperCase()
//           : prev.initials,
//       }));

//       showNotification("Profile updated successfully!");
//       setEditMode(false);
//     } catch (error) {
//       console.error("Profile update error:", error);

//       let errorMessage = error.message;
//       if (error.message.includes("CSRF")) {
//         errorMessage = "Session expired. Please refresh and try again.";
//       } else if (error.message.includes("email")) {
//         errorMessage = "Please enter a valid email address";
//       } else if (error.message.includes("phone")) {
//         errorMessage = "Please enter a valid phone number";
//       }

//       showNotification(errorMessage, "error");

//       if (error.message.includes("403") || error.message.includes("CSRF")) {
//         navigate("/login/");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };
//   const handleCloseModal = () => {
//     setShowLogoutModal(false);
//   };

//   if (loading) {
//     return (
//       <div className="loading-screen">
//         <div className="spinner"></div>
//         <p>Loading profile...</p>
//       </div>
//     );
//   }

//   return (
//     <>
//       <Header />
//       <div className="profile-container">
//         <div className="profile-header">
//           <h1>My Profile</h1>
//           {!editMode && (
//             <div className="action-btns">
//               <button className="edit-button" onClick={() => setEditMode(true)}>
//                 <FiEdit className="btn-icon" /> Edit Profile
//               </button>
//               <button className="logout-button" onClick={handleLogoutClick}>
//                 <FiLogOut className="btn-icon" /> Logout
//               </button>
//             </div>
//           )}
//         </div>

//         <div className="profile-content">
//           <div className="profile-sidebar">
//             <div className="avatar-container">
//               {user.avatar ? (
//                 <img
//                   src={user.avatar}
//                   alt="Profile"
//                   className="profile-avatar"
//                 />
//               ) : (
//                 <div
//                   className="initials-avatar"
//                   style={{ backgroundColor: getRandomColor() }}
//                 >
//                   {user.initials}
//                 </div>
//               )}

//               {editMode && (
//                 <div className="avatar-upload">
//                   <label htmlFor="avatar-upload" className="upload-button">
//                     <FiUpload className="icon" />
//                     {user.avatar ? "Change Photo" : "Upload Photo"}
//                   </label>
//                   <input
//                     id="avatar-upload"
//                     type="file"
//                     name="avatar"
//                     accept="image/*"
//                     onChange={handleAvatarChange}
//                     ref={fileInputRef}
//                     hidden
//                   />
//                   {user.avatar && (
//                     <button
//                       type="button"
//                       className="remove-avatar"
//                       onClick={() => {
//                         setUser((prev) => ({ ...prev, avatar: "" }));
//                         const nameParts = user.name.split(" ");
//                         const initials = nameParts
//                           .map((part) => part[0])
//                           .join("")
//                           .toUpperCase();
//                         setUser((prev) => ({ ...prev, initials }));
//                       }}
//                     >
//                       <FiTrash2 className="icon" /> Remove
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>

//             <nav className="profile-menu">
//               <Link to="" className="menu-item">
//                 My Orders
//               </Link>
//               <Link to="" className="menu-item">
//                 Wishlist
//               </Link>
//               <Link to="" className="menu-item">
//                 Saved Addresses
//               </Link>
//               <Link to="" className="menu-item">
//                 Account Settings
//               </Link>
//             </nav>
//           </div>

//           <div className="profile-details">
//             {editMode ? (
//               <form onSubmit={handleSubmit} className="profile-form">
//                 <div className="form-group">
//                   <label>Full Name</label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={user.name}
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label>Email Address</label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={user.email}
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label>Phone Number</label>
//                   <input
//                     type="tel"
//                     name="phone"
//                     value={user.phone}
//                     onChange={handleChange}
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label>Address</label>
//                   <textarea
//                     name="address"
//                     value={user.address}
//                     onChange={handleChange}
//                     rows="4"
//                   />
//                 </div>

//                 <div className="form-actions">
//                   <button
//                     type="button"
//                     className="cancel-button"
//                     onClick={() => setEditMode(false)}
//                     disabled={loading}
//                   >
//                     <FiX className="btn-icon" /> Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="save-button"
//                     disabled={loading}
//                   >
//                     {loading ? "Saving..." : "Save Changes"}
//                   </button>
//                 </div>
//               </form>
//             ) : (
//               <div className="profile-info">
//                 <div className="info-item">
//                   <span className="info-label">Name:</span>
//                   <span className="info-value">
//                     {user.name || "Not provided"}
//                   </span>
//                 </div>
//                 <div className="info-item">
//                   <span className="info-label">Email:</span>
//                   <span className="info-value">{user.email}</span>
//                 </div>
//                 <div className="info-item">
//                   <span className="info-label">Phone:</span>
//                   <span className="info-value">
//                     {user.phone || "Not provided"}
//                   </span>
//                 </div>
//                 <div className="info-item">
//                   <span className="info-label">Address:</span>
//                   <span className="info-value">
//                     {user.address || "Not provided"}
//                   </span>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {notification && (
//           <Notification
//             message={notification.message}
//             type={notification.type}
//             onClose={() => setNotification(null)}
//           />
//         )}
//       </div>
//       <Footer />

//       <ConfirmationModal
//         isOpen={showLogoutModal}
//         onClose={handleCloseModal}
//         onConfirm={handleConfirmLogout}
//         title="Logout Confirmation"
//         message="Are you sure you want to logout?"
//         confirmText="Logout"
//         icon={FiLogOut}
//         type="danger"
//       />
//     </>
//   );
// };

// export default Profile;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    navigate('/login');
    return;
  }

  api.get('/profile/', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then((res) => {
    setUser(res.data);
  })
  .catch((err) => {
    if (err.response?.status === 401) {
      // Attempt token refresh
      refreshToken()
        .then(newToken => {
          api.get('/profile/', {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          }).then(setUser);
        })
        .catch(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/login');
        });
    }
  });
}, [navigate]);

const refreshToken = async () => {
  const refresh = localStorage.getItem('refreshToken');
  const response = await api.post('/token/refresh/', { refresh });
  const newToken = response.data.access;
  localStorage.setItem('accessToken', newToken);
  return newToken;
};

  return (
    <div>
      <button onClick={() => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  navigate("/login");
}}>Logout</button>
      <h1>My Profile</h1>
      {user ? (
        <div>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Name:</strong> {user.name || user.username}
          </p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Profile;
