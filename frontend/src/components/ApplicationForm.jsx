// src/components/ApplicationForm.jsx
import React, { useEffect, useState } from "react";
import StepNav from "./StepNav";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";
import Step5 from "./steps/Step5";
import Step6 from "./steps/Step6";
import { register as mockRegister } from "../services/mockApi";
import "./application.css";
import { detail } from "../common";

const STORAGE_KEY = "app_form_v1";

const initialAll = {
  step1: { travelPurpose: "", specificPurpose: "" },
  step2: {},
  step3: {},
  step4: {},
  step5: {},
  step6: {}
};

export default function ApplicationForm() {
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : initialAll;
    } catch (e) {
      return initialAll;
    }
  });
  const [idx, setIdx] = useState(0);
  const [saved, setSaved] = useState([false, false, false, false, false, false]);
  const [submitting, setSubmitting] = useState(false);

  // steps array now includes usesLocalActions flag for each step
  const [steps] = useState([
    {
      title: "Travel purpose",
      component: <Step1 data={data.step1} onChange={(p) => patchStep(1, p)} onSave={(d) => handleSaveStep(0, d)} saved={saved[0]} />,
      usesLocalActions: true
    },
    {
      title: "Personal data",
      component: <Step2 data={data.step2} onChange={(p) => patchStep(2, p)} onSave={(d) => handleSaveStep(1, d)} saved={saved[1]} />,
      usesLocalActions: true
    },
    {
      title: "Travel documents",
      component: <Step3 data={data.step3} onChange={(p) => patchStep(3, p)} onSave={(d) => handleSaveStep(2, d)} saved={saved[2]} />,
      usesLocalActions: true
    },
    {
      title: "Visa information",
      component: <Step4 data={data.step4} onChange={(p) => patchStep(4, p)} onSave={(d) => handleSaveStep(3, d)} saved={saved[3]} />,
      usesLocalActions: true
    },
    {
      title: "Add documents",
      component: <Step5 data={data.step5} onChange={(p) => patchStep(5, p)} onSave={(d) => handleSaveStep(4, d)} saved={saved[4]} />,
      usesLocalActions: true
    },
    {
      title: "Fees",
      component: <Step6 data={data.step6} onChange={(p) => patchStep(6, p)} onSave={(d) => handleSaveStep(5, d)} saved={saved[5]} />,
      usesLocalActions: true
    }
  ]);

  useEffect(() => {
    // no-op; kept for parity with previous implementation
  }, [data]);

  function patchStep(stepNumber, patch) {
    const stepKey = `step${stepNumber}`;
    setData((d) => {
      const next = { ...d };
      next[stepKey] = { ...next[stepKey], ...patch };
      return next;
    });
  }

  function markSaved(stepIndex, val = true) {
    setSaved((s) => {
      const next = [...s];
      next[stepIndex] = val;
      return next;
    });
  }

  /**
   * Unified save handler for each step.
   * - Constructs mergedData immediately so dataSnapshot is accurate
   * - persists mergedData to localStorage
   * - triggers server submit with merged snapshot (will include returned id on subsequent requests)
   */
  async function handleSaveStep(stepIndex, stepData = {}) {
    try {
      const stepKey = `step${stepIndex + 1}`;

      // create merged snapshot atomically from latest state
      let mergedData;
      setData((prev) => {
        mergedData = { ...prev, [stepKey]: { ...prev[stepKey], ...stepData } };
        // preserve any existing applicationId stored on top-level prev
        if (prev.applicationId) mergedData.applicationId = prev.applicationId;
        // persist synced snapshot for development convenience
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedData));
        } catch (e) {
          /* ignore permission errors */
        }
        return mergedData;
      });

      // simulate server latency (keep existing behavior)
      await new Promise((r) => setTimeout(r, 350));

      // mark as saved
      markSaved(stepIndex, true);

      // Unified JSON snapshot to console
      const snapshot = {
        step: stepIndex + 1,
        payload: stepData,
        timestamp: new Date().toISOString(),
        dataSnapshot: mergedData
      };
      console.groupCollapsed(`%c[APPLICATION] Step ${stepIndex + 1} saved — JSON snapshot`, "color:#1e90ff;font-weight:bold;");
      console.log(snapshot);
      console.groupEnd();

      // fire off server submit with merged snapshot (do not block UI)
      submitToServer(mergedData).catch((err) => console.error("submitToServer error", err));

      return true;
    } catch (err) {
      console.error("save failed", err);
      return false;
    }
  }

  // helper: build FormData from merged data and POST to API; saves returned id into state+localStorage
  async function submitToServer(mergedData) {
    const url = `${detail.ip}/v1/api/admin/application`;
    const token = localStorage.getItem("authToken") || localStorage.getItem("authToken") || "";

    const fd = new FormData();

    // map values from steps to API field names (update mapping as necessary)
    try {
      // step1
      fd.append("purpose", mergedData.step1?.travelPurpose || "");
      fd.append("specific_purpose", mergedData.step1?.specificPurpose || "");
      fd.append("des_purpose", mergedData.step1?.otherPurposeText || "");

      // step2 (personal)
      const s2 = mergedData.step2 || {};
      fd.append("last_name", s2.lastName || s2.last_name || "");
      fd.append("address", s2.address || "");
      fd.append("last_name_at_birth", s2.lastNameAtBirth || s2.last_name_at_birth || "");
      fd.append("telephone", s2.telephone || "");
      fd.append("first_name", s2.firstName || s2.first_name || "");
      fd.append("gender", s2.gender || "");
      fd.append("citizenship", s2.citizenship || "");
      fd.append("dob", s2.dob || "");
      fd.append("marital_status", s2.maritalStatus || s2.marital_status || "");
      fd.append("country_of_birth", s2.countryOfBirth || s2.country_of_birth || "");
      fd.append("father_first_name", s2.fatherFirstName || s2.father_first_name || "");
      fd.append("place_of_birth", s2.placeOfBirth || s2.place_of_birth || "");
      fd.append("mother_first_name", s2.motherFirstName || s2.mother_first_name || "");
      fd.append("email", s2.email || "");

      // step3 (documents)
      const s3 = mergedData.step3 || {};
      fd.append("type_of_doc", s3.typeOfDoc || s3.type_of_doc || "");
      fd.append("date_of_issue", s3.dateOfIssue || s3.date_of_issue || "");
      fd.append("doc_number", s3.docNumber || s3.doc_number || "");
      fd.append("doc_valid_date", s3.docValidDate || s3.doc_valid_date || "");
      fd.append("doc_issue_country", s3.docIssueCountry || s3.doc_issue_country || "");
      fd.append("place_of_issue", s3.placeOfIssue || s3.place_of_issue || "");
      fd.append("representation_office", s3.representationOffice || s3.representation_office || "");

      // step4 (visa info)
      const s4 = mergedData.step4 || {};
      fd.append("first_entry", s4.firstEntry || s4.first_entry || "");
      fd.append("date_of_arrival", s4.dateOfArrival || s4.date_of_arrival || "");
      fd.append("means_of_transport", s4.meansOfTransport || s4.means_of_transport || "");
      fd.append("date_of_departure", s4.dateOfDeparture || s4.date_of_departure || "");

      // step5 (consent / misc)
      const s5 = mergedData.step5 || {};
      fd.append("is_consent_provided", (s5.isConsentProvided === true || s5.is_consent_provided === true) ? "true" : String(!!s5.isConsentProvided));

      // step6 (files / fees)
      const s6 = mergedData.step6 || {};
      // files: if they are File objects append directly, otherwise ignore / append nothing
      if (s6.facePhoto && s6.facePhoto instanceof File) fd.append("face_photo", s6.facePhoto);
      if (s6.passportPage && s6.passportPage instanceof File) fd.append("passport_page", s6.passportPage);
      if (s6.letter && s6.letter instanceof File) fd.append("letter", s6.letter);

      // user id (if present in mergedData)
      if (mergedData.user_id || mergedData.userId || mergedData.step2?.userId) {
        fd.append("user_id", mergedData.user_id || mergedData.userId || mergedData.step2.userId);
      } else {
        // keep existing value if available in localStorage or default to "1"
        const localUser = localStorage.getItem("user_id") || "1";
        fd.append("user_id", localUser);
      }

      // include application id when we have it (server expects id to update)
      if (mergedData.applicationId) {
        fd.append("id", String(mergedData.applicationId));
      }

      const res = await fetch(url, {
        method: "POST",
        headers: token ? { Authorization: token } : {},
        body: fd
      });

      const json = await res.json();

      console.groupCollapsed(`%c[APPLICATION] submitToServer response (${res.status})`, "color:#1e90ff;font-weight:bold;");
      console.log(json);
      console.groupEnd();

      if (res.ok && json?.data?.data?.id) {
        const appId = json.data.data.id;
        // persist application id to state + localStorage so subsequent saves include it
        setData((prev) => {
          const next = { ...prev, applicationId: appId };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch (e) {}
          return next;
        });
      }

      return json;
    } catch (err) {
      console.error("submitToServer failed", err);
      throw err;
    }
  }

  // final submit (ensure one last submit and show result)
  async function handleFinalSubmit() {
    setSubmitting(true);

    console.groupCollapsed("%c[APPLICATION] Final submit", "color:#1e90ff;font-weight:bold;");
    console.log("Payload:", data);
    console.groupEnd();

    try {
      const json = await submitToServer(data);
      if (json && json.code === 1) {
        alert("Application submitted.");
      } else {
        alert(json?.message || "Submission failed.");
      }
    } catch (err) {
      console.error("submit error", err);
      alert("Network or unexpected error.");
    } finally {
      setSubmitting(false);
    }
  }

  function goNext() {
    if (!saved[idx]) return;
    setIdx((i) => Math.min(5, i + 1));
  }

  function goPrev() {
    setIdx((i) => Math.max(0, i - 1));
  }

  useEffect(() => {
    const handlers = [];
    for (let i = 1; i <= 6; i++) {
      const name = `triggerSaveStep${i}`;
      const fn = () => {
        window.dispatchEvent(new CustomEvent(`saveStep${i}`));
      };
      window.addEventListener(name, fn);
      handlers.push({ name, fn });
    }
    return () => handlers.forEach(({ name, fn }) => window.removeEventListener(name, fn));
  }, [idx, saved]);

  useEffect(() => {
    const fn = () => {
      if (saved[idx]) goNext();
    };
    window.addEventListener("step1:next", fn);
    window.addEventListener("step2:next", fn);
    window.addEventListener("step3:next", fn);
    window.addEventListener("step4:next", fn);
    window.addEventListener("step5:next", fn);
    window.addEventListener("step6:next", fn);
    return () => {
      window.removeEventListener("step1:next", fn);
      window.removeEventListener("step2:next", fn);
      window.removeEventListener("step3:next", fn);
      window.removeEventListener("step4:next", fn);
      window.removeEventListener("step5:next", fn);
      window.removeEventListener("step6:next", fn);
    };
  }, [saved, idx]);

  function triggerSaveForActiveStep() {
    window.dispatchEvent(new CustomEvent(`triggerSaveStep${idx + 1}`));
  }

  return (
    <div className="application-root">
      <div className="container">
        <h1 className="app-title">Application for visa type D</h1>

        <StepNav
          steps={steps.map((s) => s.title)}
          current={idx}
          saved={saved}
          onNavigate={(targetIdx) => {
            if (targetIdx <= idx || saved[targetIdx]) setIdx(targetIdx);
          }}
        />

        <div className="step-wrap">{steps[idx].component}</div>

        {/* Only render global footer when active step does not provide local actions */}
        {!steps[idx].usesLocalActions && (
          <div className="form-footer">
            {idx < 5 ? (
              <div className="footer-actions">
                <button className="btn-secondary" onClick={() => { goPrev(); }}>Back</button>
                <div style={{ gap: 12, display: "flex" }}>
                  <button
                    className={`btn-save ${saved[idx] ? "saved" : ""}`}
                    onClick={async () => {
                      // dispatch a custom trigger for the active step to save itself
                      window.dispatchEvent(new CustomEvent(`triggerSaveStep${idx + 1}`));
                      // fallback: attempt parent save using current data snapshot
                      const stepKey = `step${idx + 1}`;
                      const stepPayload = data[stepKey] || {};
                      await handleSaveStep(idx, stepPayload);
                    }}
                  >
                    {saved[idx] ? "Saved" : "Save"}
                  </button>
                  <button className="btn-primary" onClick={() => {
                    if (saved[idx]) goNext();
                  }}>
                    Next →
                  </button>
                </div>
              </div>
            ) : (
              <div className="footer-actions">
                <button className="btn-secondary" onClick={() => goPrev()}>Back</button>
                <button className="btn-primary" onClick={handleFinalSubmit} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit application"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
