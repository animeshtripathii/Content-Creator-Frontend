import React from "react";
import Footer from "../components/Footer";

const Dashboard = () => {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1 }}>
        <h2>Welcome to Dashboard!</h2>
        <p>This is a protected page.</p>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
