import React, { useState } from "react";
import { signup as signupApi } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Footer from "../components/Footer";

const Signup = () => {
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signupApi(form);
      navigate("/login");
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1 }}>
        <h2>Signup</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ display: "block", margin: "1rem 0", padding: "0.5rem" }}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ display: "block", margin: "1rem 0", padding: "0.5rem" }}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ display: "block", margin: "1rem 0", padding: "0.5rem" }}
          />
          <Button type="submit">Signup</Button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
      <Footer />
    </div>
  );
};

export default Signup;
