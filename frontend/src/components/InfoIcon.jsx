import React, { useState, useEffect } from "react";
import "./steps/Step2.css"; // keeps same styling, since Step2.css has info-icon classes

export default function InfoIcon({ text }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 600);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile) {
    return (
      <span className="info-icon-mobile">
        <button
          type="button"
          className="info-dot"
          onClick={() => setOpen((s) => !s)}
          aria-expanded={open}
        >
          i
        </button>
        {open && <div className="info-inline">{text}</div>}
      </span>
    );
  }

  return (
    <span className="info-icon" tabIndex={0} aria-label={text}>
      <span className="info-dot">i</span>
      <span className="info-tooltip" role="tooltip">
        {text}
      </span>
    </span>
  );
}
