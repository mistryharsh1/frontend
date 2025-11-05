import React, { useState, useEffect } from "react";
import "./Step1.css";

/**
 * Props:
 * - data: { travelPurpose: string, specificPurpose: string }
 * - onChange: function(patchObj) -> merges patch into step data (parent)
 * - onSave: async function(stepData) -> should return truthy on success (parent controls enabling Next)
 * - saved: optional boolean (parent may pass if step already saved)
 */
export default function Step1({ data = {}, onChange = () => {}, onSave = async () => true, saved = false }) {
  const [local, setLocal] = useState({
    travelPurpose: data.travelPurpose || "",
    specificPurpose: data.specificPurpose || "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(Boolean(saved));

  useEffect(() => {
    // sync if parent changes data externally
    setLocal({
      travelPurpose: data.travelPurpose || "",
      specificPurpose: data.specificPurpose || "",
    });
  }, [data]);

  // options for the travel purpose select (simple example; extend as needed)
  const TRAVEL_PURPOSES = [
    { value: "employment", label: "Employment" },
    { value: "study", label: "Study" },
    { value: "family", label: "Family reunification" },
    { value: "other", label: "Other" },
  ];

  // specific purposes as seen in screenshot 2
  const SPECIFIC_PURPOSES = [
    { value: "employment_contract", label: "Employment on the grounds of an employment contract or another contract exercising workplace rights" },
    { value: "self_employment", label: "Enrolled in the registration decision (self-employment)" },
    { value: "business_cooperation", label: "Agreement on business and technical cooperation (informed persons)" },
    { value: "movement_within_company", label: "Movement within the company" },
    { value: "independent_professional", label: "Independent professional" },
    { value: "training_development", label: "Training and development (professional practice, specialization, training, internship, work experience, professional training/development)" },
    { value: "volunteering", label: "Volunteering" },
    { value: "journalist", label: "Accredited foreign journalist" },
    { value: "projects_state", label: "Realization of projects with state authorities of RS" },
    { value: "hiring_team_member", label: "Hiring a member of the author's and acting team who produce an audio-visual work on the territory of the RS" },
    // add more rows if needed to match your exact list
  ];

  function handleChange(field, value) {
    setLocal((s) => ({ ...s, [field]: value }));
    setErrors((errs) => ({ ...errs, [field]: undefined }));
    // notify parent
    onChange({ [field]: value });
    // mark unsaved when user edits
    setIsSaved(false);
  }

  function validateLocal() {
    const e = {};
    if (!local.travelPurpose || local.travelPurpose.trim() === "") {
      e.travelPurpose = "Please select travel purpose";
    }
    if (!local.specificPurpose || local.specificPurpose.trim() === "") {
      e.specificPurpose = "Please select a specific travel purpose";
    }
    return e;
  }

  async function handleSave(e) {
    e && e.preventDefault && e.preventDefault();
    const eobj = validateLocal();
    setErrors(eobj);
    if (Object.keys(eobj).length > 0) {
      // scroll to first error for better UX
      const firstKey = Object.keys(eobj)[0];
      const el = document.querySelector(`[name="${firstKey}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }

    setSaving(true);
    try {
      // call parent save handler; respect its return value.
      const ok = await onSave({ ...local });
      if (ok) {
        setIsSaved(true);
        setSaving(false);
        return true;
      } else {
        // parent indicated failure
        setSaving(false);
        return false;
      }
    } catch (err) {
      console.error("Step1 save error:", err);
      setSaving(false);
      return false;
    }
  }

  return (
    <section className="step1-root">
      <h2 className="step-title">Travel purpose</h2>

      <div className="field-row">
        <label className="field-label" htmlFor="travelPurpose">Travel purpose <span className="req">*</span></label>
        <select
          id="travelPurpose"
          name="travelPurpose"
          value={local.travelPurpose}
          onChange={(ev) => handleChange("travelPurpose", ev.target.value)}
          className={`form-select ${errors.travelPurpose ? "error" : ""}`}
        >
          <option value="">Select travel purpose</option>
          {TRAVEL_PURPOSES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div className="field-error">{errors.travelPurpose}</div>
      </div>

      <div className="more-specific">
        <h3 className="more-title">More specific travel purpose:</h3>
        <p className="small-label">Select specific purpose <span className="req">*</span></p>

        <div className="radio-list">
          {SPECIFIC_PURPOSES.map((opt) => {
            const checked = local.specificPurpose === opt.value;
            return (
              <label
                key={opt.value}
                className={`radio-card ${checked ? "checked" : ""}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    handleChange("specificPurpose", opt.value);
                  }
                }}
              >
                <input
                  type="radio"
                  name="specificPurpose"
                  value={opt.value}
                  checked={checked}
                  onChange={() => handleChange("specificPurpose", opt.value)}
                />
                <div className="radio-left" aria-hidden>
                  <span className={`radio-dot ${checked ? "on" : ""}`} />
                </div>
                <div className="radio-text">{opt.label}</div>
              </label>
            );
          })}
        </div>

        <div className="field-error">{errors.specificPurpose}</div>
      </div>

      <div className="step-actions">
        <button className="btn-secondary" onClick={() => { /* parent handles previous navigation */ window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          Back
        </button>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            className={`btn-save ${isSaved ? "saved" : ""}`}
            onClick={handleSave}
            disabled={saving}
            title={isSaved ? "Saved" : "Save"}
          >
            {saving ? "Saving..." : (isSaved ? "Saved" : "Save")}
          </button>

          {/* parent should disable Next until saved; show disabled here too for safety */}
          <button
            className="btn-primary"
            onClick={async (e) => {
              // ensure saved before moving next; if not saved, attempt save
              if (!isSaved) {
                const ok = await handleSave();
                if (!ok) return;
              }
              // fire custom event so parent can go to next step, or parent can pass callback
              const ev = new CustomEvent("step1:next", { detail: { stepData: local } });
              window.dispatchEvent(ev);
            }}
            disabled={saving || !isSaved}
          >
            Next →
          </button>
        </div>
      </div>
    </section>
  );
}
