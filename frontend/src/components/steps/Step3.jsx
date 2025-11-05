import React from "react";
export default function Step3({ data = {}, onChange = () => {}, onSave = async () => true, saved = false }) {
  return (
    <section style={{ maxWidth: 980, margin: "18px auto", padding: "0 20px" }}>
      <h2>Travel documents</h2>
      <p className="muted">(Step 3 placeholder)</p>
      <div style={{ marginTop: 18 }}>
        <button onClick={() => window.dispatchEvent(new CustomEvent("step3:next", { detail: { stepData: data } }))}>Next →</button>
        <button onClick={() => onSave(data)} style={{ marginLeft: 8 }}>{saved ? "Saved" : "Save" }</button>
      </div>
    </section>
  );
}
