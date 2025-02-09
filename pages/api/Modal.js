// Modal.js
import React from "react";

export default function Modal({ children, onClose }) {
  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <button style={closeButtonStyle} onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  position: "relative",
  minWidth: "300px",
  textAlign: "center",
};

const closeButtonStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  border: "none",
  background: "transparent",
  fontSize: "24px",
  cursor: "pointer",
};
