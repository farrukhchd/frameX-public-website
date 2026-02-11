import React from "react";

export default function PrimaryBottomButton({
  children,
  onClick,
  disabled = false,
}) {
  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        width: "100%",
        background: "#ffffff",
        padding: "12px 16px",
        zIndex: 100,
      }}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          width: "100%",
          height: "56px",
          backgroundColor: disabled ? "#f3f3f3" : "#FFD600",
          color: disabled ? "#999999" : "#000000",
          fontWeight: 600,
          fontSize: "16px",
          border: "none",
          borderRadius: "12px",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {children}
      </button>
    </div>
  );
}
