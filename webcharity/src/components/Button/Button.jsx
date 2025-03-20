import React from "react";
import "./Button.css";

const Button = ({ text, onClick, variant = "primary", className }) => {
  return (
    <button className={`custom-button ${className}`} onClick={onClick}>
      {text}
    </button>
  );
};

export default Button;
