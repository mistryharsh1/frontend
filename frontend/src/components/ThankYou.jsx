import React from "react";
import { Link } from 'react-router-dom';

export default function ThankYou(){
  return (
    <div className="container">
      <h2>Thank you — registration received</h2>
      <p>Your registration was submitted successfully. (This is a simulated frontend-only flow.)</p>
      <Link to="/" className="cta-btn">Return home</Link>
    </div>
  );
}
