// StepNav.jsx - simple visual stepper
import React from "react";
import "./application.css";

export default function StepNav({ steps = [], current = 0, saved = [], onNavigate = () => {} }) {
  return (
    <nav className="stepnav" aria-label="Application steps">
      <ol className="stepnav-list">
        {steps.map((title, i) => {
          const isActive = i === current;
          const isSaved = saved[i];
          return (
            <li key={i} className={`stepnav-item ${isActive ? "active" : ""} ${isSaved ? "saved" : ""}`}>
              <button className="stepbtn" onClick={() => onNavigate(i)} aria-current={isActive ? "step" : undefined}>
                <span className="bubble">{isSaved ? "✓" : i + 1}</span>
                <span className="label">{title}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
