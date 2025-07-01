// src/components/ConfirmationModal/ConfirmationModal.jsx
import React from 'react';
import './ConfirmationModal.css';
import { FiLogOut, FiCheckCircle } from 'react-icons/fi';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger" // 'success' or 'danger'
}) => {
  if (!isOpen) return null;

  const Icon = type === "success" ? FiCheckCircle : FiLogOut;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className={`modal-header ${type}`}>
          <Icon size={24} />
          <h3>{title}</h3>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            {cancelText}
          </button>
          <button 
            className={`confirm-btn ${type}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Add this line to provide a default export
export default ConfirmationModal;