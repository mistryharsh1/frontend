import React from "react";
export default function Step6({ data = {}, onChange = () => {}, onSave = async () => true, saved = false }) {
  return (
    <section style={{ maxWidth: 980, margin: "18px auto", padding: "0 20px" }}>
      <h2>Fees</h2>
      <p className="muted">(Step 6 placeholder)</p>
      <div style={{ marginTop: 18 }}>
        <button onClick={() => window.dispatchEvent(new CustomEvent("step6:next", { detail: { stepData: data } }))}>Finish →</button>
        <button onClick={() => onSave(data)} style={{ marginLeft: 8 }}>{saved ? "Saved" : "Save" }</button>
      </div>
    </section>
  );
}
