import React from "react";
import PropTypes from "prop-types";
import "./StepNav.css";

/**
 * StepNav
 * Props:
 *  - steps: array of step titles
 *  - current: index (0-based) of active step
 *  - saved: array[boolean] whether each step is saved
 *  - onNavigate(index) -> called when user clicks a step marker (only previous or saved steps)
 */
export default function StepNav({ steps = [], current = 0, saved = [], onNavigate = () => {} }) {
  return (
    <nav className="stepnav" aria-label="Application progress">
      <ol className="stepnav-list">
        {steps.map((label, i) => {
          const done = !!saved[i];
          const active = i === current;
          const clickable = i <= current || !!saved[i];
          return (
            <li
              key={label}
              className={`stepnav-item ${done ? "done" : ""} ${active ? "active" : ""} ${clickable ? "clickable" : "disabled"}`}
              onClick={() => { if (clickable) onNavigate(i); }}
              onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && clickable) onNavigate(i); }}
              tabIndex={clickable ? 0 : -1}
              role={clickable ? "button" : undefined}
              aria-current={active ? "step" : undefined}
              aria-disabled={!clickable}
            >
              <div className="step-marker" aria-hidden>
                {done ? <span className="check">✓</span> : (active ? <span className="dot" /> : <span className="num">{i + 1}</span>)}
              </div>
              <div className="step-title" title={label}>
                {label}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

StepNav.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.string),
  current: PropTypes.number,
  saved: PropTypes.arrayOf(PropTypes.bool),
  onNavigate: PropTypes.func
};
