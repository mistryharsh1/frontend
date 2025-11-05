import React from "react";
import { Link } from "react-router-dom";

export default function Home(){
  return (
    <div className="container">
      <h2>Welcome to Portal</h2>
      <p>This is a frontend-only demo of the registration flow. Click below to register an account.</p>
      <Link to="/register" className="cta-btn">Go to Register →</Link>
    </div>
  );
}
