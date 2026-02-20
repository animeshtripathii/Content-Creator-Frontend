import React from "react";

const Button = ({ children, ...props }) => (
  <button style={{ padding: "0.5rem 1.5rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }} {...props}>
    {children}
  </button>
);

export default Button;
