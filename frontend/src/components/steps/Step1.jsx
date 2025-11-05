import React, { useEffect, useState } from "react";
import "../steps/Step1.css";
import InfoIcon from "../InfoIcon";

/**
 * Step1 - Travel purpose (dynamic radio list based on select)
 *
 * Behavior changes:
 *  - radio options shown depend on dropdown (travelPurpose)
 *  - if selected specificPurpose is not available after switching dropdown, it will be cleared
 */

const OPTIONS_BY_PURPOSE = {
  study: [
    {
      value: "study_degree",
      title: "University study (degree programme)",
      desc: "Long-term study at a higher education institution (degree programme, exchange)."
    },
    {
      value: "study_training",
      title: "Training and development (professional practice, specialization)",
      desc: "Professional practice, internship, training, specialization or other short training."
    },
    {
      value: "study_other",
      title: "Other study purpose",
      desc: "If your study type is not listed, choose Other and specify below."
    }
  ],
  employment: [
    {
      value: "employment_contract",
      title: "Employment on the grounds of an employment contract",
      desc: "Employment on the grounds of an employment contract or another contract exercising workplace rights"
    },
    {
      value: "self_employment",
      title: "Enrolled in the registration decision (self-employment)",
      desc: "Enrolled in the registration decision (self-employment)"
    },
    {
      value: "business_agreement",
      title: "Agreement on business and technical cooperation",
      desc: "Agreement on business and technical cooperation (informed persons)"
    },
    {
      value: "movement_within_company",
      title: "Movement within the company",
      desc: "Temporary movement within the company"
    },
    {
      value: "independent_professional",
      title: "Independent professional",
      desc: "Independent professional activity"
    },
    {
      value: "employment_other",
      title: "Other",
      desc: "If your purpose is not listed, choose Other and specify below."
    }
  ],
  family: [
    {
      value: "family_reunification_spouse",
      title: "Family reunification - spouse/partner",
      desc: "Reunification with spouse or registered partner."
    },
    {
      value: "family_reunification_children",
      title: "Family reunification - children",
      desc: "Reunification with dependent children."
    },
    {
      value: "family_other",
      title: "Other family reunification",
      desc: "If your family reunification type is not listed, choose Other and specify below."
    }
  ],
  research: [
    {
      value: "research_academic",
      title: "Research at a university or institute",
      desc: "Research activity at a recognized academic or research institution."
    },
    {
      value: "research_project",
      title: "Research on a funded project",
      desc: "Work on a funded research project."
    },
    {
      value: "research_other",
      title: "Other research purpose",
      desc: "If your research purpose is not listed, choose Other and specify below."
    }
  ],
  other: [
    {
      value: "other_general",
      title: "Other purpose",
      desc: "If your purpose is not listed above, choose Other and specify below."
    }
  ]
};

export default function Step1({
  data = {},
  onChange = () => {},
  onSave = async () => true,
  saved = false,
  showStepper = false
}) {
  const [local, setLocal] = useState({
    travelPurpose: data.travelPurpose || "",
    specificPurpose: data.specificPurpose || "",
    otherPurposeText: data.otherPurposeText || ""
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [localSaved, setLocalSaved] = useState(Boolean(saved));

  // sync with incoming data
  useEffect(() => {
    setLocal({
      travelPurpose: data.travelPurpose || "",
      specificPurpose: data.specificPurpose || "",
      otherPurposeText: data.otherPurposeText || ""
    });
    setLocalSaved(Boolean(saved));
  }, [data, saved]);

  // helper: get options for current travel purpose
  function getOptionsForPurpose(purpose) {
    if (!purpose) return [];
    const key = purpose.toLowerCase();
    return OPTIONS_BY_PURPOSE[key] || [];
  }

  // patch local and propagate up
  function patch(name, value) {
    setLocal((s) => {
      const next = { ...s, [name]: value };
      return next;
    });
    setErrors((e) => ({ ...e, [name]: undefined }));
    onChange({ [name]: value });
    setLocalSaved(false);
  }

  // when travelPurpose changes we may need to clear specificPurpose if not in new options
  useEffect(() => {
    const opts = getOptionsForPurpose(local.travelPurpose);
    if (local.specificPurpose) {
      const present = opts.some((o) => o.value === local.specificPurpose);
      if (!present) {
        // clear specific purpose and other text
        setLocal((s) => ({ ...s, specificPurpose: "", otherPurposeText: "" }));
        onChange({ specificPurpose: "", otherPurposeText: "" });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local.travelPurpose]); // run when travelPurpose changes

  function validate() {
    const e = {};
    if (!local.travelPurpose) e.travelPurpose = "Please select a travel purpose";
    if (!local.specificPurpose) e.specificPurpose = "Please select a more specific purpose";
    if (local.specificPurpose && local.specificPurpose.endsWith("_other") && !local.otherPurposeText.trim()) e.otherPurposeText = "Please specify the purpose";
    if (local.specificPurpose === "other_general" && !local.otherPurposeText.trim()) e.otherPurposeText = "Please specify the purpose";
    return e;
  }

  async function doSave() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      const first = Object.keys(e)[0];
      const el = document.querySelector(`[name="${first}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }

    setSaving(true);
    try {
      const payload = { ...local };
      const ok = await onSave(payload);
      setSaving(false);
      if (ok) {
        setLocalSaved(true);
        window.dispatchEvent(new CustomEvent("step1:next", { detail: { stepData: payload } }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Step1 save error:", err);
      setSaving(false);
      return false;
    }
  }

  // respond to global save trigger
  useEffect(() => {
    function onTrigger() { doSave(); }
    window.addEventListener("triggerSaveStep1", onTrigger);
    return () => window.removeEventListener("triggerSaveStep1", onTrigger);
  }, []); // run once

  function onNextClick() {
    if (!localSaved) {
      doSave().then((ok) => {
        if (ok) window.dispatchEvent(new CustomEvent("step1:next", { detail: { stepData: local } }));
      });
      return;
    }
    window.dispatchEvent(new CustomEvent("step1:next", { detail: { stepData: local } }));
  }

  const currentOptions = getOptionsForPurpose(local.travelPurpose);

  return (
    <section className="step1-root">
      {showStepper && <div className="internal-stepper" />}

      <h2 className="step-title">Travel purpose</h2>

      <div className="form-field">
        <label className="label">Travel purpose <span className="req">*</span></label>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            name="travelPurpose"
            className={`form-select ${errors.travelPurpose ? "error" : ""}`}
            value={local.travelPurpose}
            onChange={(e) => patch("travelPurpose", e.target.value)}
          >
            <option value="">Select purpose</option>
            <option value="study">Study</option>
            <option value="employment">Employment</option>
            <option value="family">Family reunification</option>
            <option value="research">Research</option>
            <option value="other">Other</option>
          </select>
          <InfoIcon text="Select the primary reason for your stay (used to guide required documents)." />
        </div>
        <div className="field-error">{errors.travelPurpose}</div>
      </div>

      <div style={{ marginTop: 18 }}>
        <h3 style={{ margin: "0 0 10px 0", fontSize: 20, color: "#213243" }}>More specific travel purpose:</h3>
        <div className="form-field">
          <label className="label">Select specific purpose <span className="req">*</span></label>

          {/* If no travel purpose chosen, show helper prompt */}
          {local.travelPurpose === "" ? (
            <div style={{ color: "#98a8bb", fontSize: 14, maxWidth: 760 }}>
              Please select the main travel purpose from the dropdown above to see specific options.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }} className="radio-list">
              {currentOptions.length === 0 ? (
                <div style={{ color: "#98a8bb" }}>No specific options available for this purpose.</div>
              ) : (
                currentOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`radio-card ${local.specificPurpose === opt.value ? "checked" : ""}`}
                  >
                    <input
                      type="radio"
                      name="specificPurpose"
                      value={opt.value}
                      checked={local.specificPurpose === opt.value}
                      onChange={() => patch("specificPurpose", opt.value)}
                    />
                    <div>
                      <div className="title">{opt.title}</div>
                      <div className="desc">{opt.desc}</div>

                      {/* if this option represents "other", show text input */}
                      {(opt.value.endsWith("_other") || opt.value === "other_general") && local.specificPurpose === opt.value && (
                        <div style={{ marginTop: 8 }}>
                          <input
                            name="otherPurposeText"
                            className={`form-control ${errors.otherPurposeText ? "error" : ""}`}
                            placeholder="Describe the purpose"
                            value={local.otherPurposeText}
                            onChange={(e) => patch("otherPurposeText", e.target.value)}
                          />
                          <div className="field-error">{errors.otherPurposeText}</div>
                        </div>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
          )}

          <div className="field-error">{errors.specificPurpose}</div>
        </div>
      </div>

      <div className="step-actions" style={{ marginTop: 22 }}>
        <div className="left-group">
          <button className="btn-secondary" onClick={() => window.dispatchEvent(new Event("step:previous"))}>Back</button>

          <button className={`btn-save ${localSaved ? "saved" : ""}`} onClick={doSave} disabled={saving}>
            {saving ? "Saving..." : (localSaved ? "Saved" : "Save")}
          </button>
        </div>

        <div>
          <button className="btn-primary" onClick={onNextClick} disabled={saving}>
            Next →
          </button>
        </div>
      </div>
    </section>
  );
}
