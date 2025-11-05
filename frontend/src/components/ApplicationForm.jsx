// ApplicationForm.jsx
import React, { useEffect, useState, useCallback } from "react";
import StepNav from "./StepNav";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";
import Step5 from "./steps/Step5";
import Step6 from "./steps/Step6";
import { register as mockRegister } from "../services/mockApi"; // optional final submit mock
import "./application.css";

const STORAGE_KEY = "app_form_v1";

const initialAll = {
  step1: { travelPurpose: "", specificPurpose: "" },
  step2: {}, // fill as you implement
  step3: {},
  step4: {},
  step5: {},
  step6: {}
};

export default function ApplicationForm() {
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return initialAll;
  });

  // which step index (0..5)
  const [idx, setIdx] = useState(0);

  // saved flags per step
  const [saved, setSaved] = useState(() => {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}_saved`);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [false, false, false, false, false, false];
  });

  // submitting final application
  const [submitting, setSubmitting] = useState(false);

  // persist helper
  const persist = useCallback((nextData, nextSaved) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
    localStorage.setItem(`${STORAGE_KEY}_saved`, JSON.stringify(nextSaved));
  }, []);

  useEffect(() => {
    persist(data, saved);
  }, [data, saved, persist]);

  // update partial step data
  function patchStep(stepKey, patch) {
    setData((d) => {
      const next = { ...d, [stepKey]: { ...d[stepKey], ...patch } };
      return next;
    });
  }

  // mark saved for a step
  function markSaved(stepIndex, val = true) {
    setSaved((s) => {
      const next = [...s];
      next[stepIndex] = val;
      return next;
    });
  }

  // handler wrapper passed to steps: tries to save via parent-level save function (can call backend)
  // stepIndex 0..5
  async function handleSaveStep(stepIndex, stepData) {
    // default behavior: just mark saved locally (you can replace this to call real API)
    // simulate quick async save
    try {
      // Put server call here if needed; using a resolved Promise to simulate
      await new Promise((r) => setTimeout(r, 350));
      // merge into central data
      setData((d) => {
        const next = { ...d };
        next[`step${stepIndex + 1}`] = { ...next[`step${stepIndex + 1}`], ...stepData };
        return next;
      });
      markSaved(stepIndex, true);
      return true;
    } catch (err) {
      console.error("save failed", err);
      return false;
    }
  }

  // move next if allowed
  function goNext() {
    if (!saved[idx]) {
      // cannot go next until saved
      return;
    }
    setIdx((i) => Math.min(i + 1, 5));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goPrev() {
    setIdx((i) => Math.max(i - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // final submit: validate that all steps are saved then call mockRegister and show logs
  async function handleFinalSubmit() {
    // ensure all saved
    if (saved.some((v) => !v)) {
      alert("Please save all steps before submitting the application.");
      return;
    }
    setSubmitting(true);
    console.groupCollapsed("%c[APPLICATION] Final submit", "color:#1e90ff;font-weight:bold;");
    console.log("Payload:", data);
    console.groupEnd();

    try {
      // example: call mockRegister with combined data (you may change)
      const res = await mockRegister({ ...data }, []); // mock API
      const color = res.ok ? "#16a34a" : "#dc2626";
      console.groupCollapsed(`%c[APPLICATION] Server response (${res.status})`, `color:${color}; font-weight:bold;`);
      console.log(res);
      console.groupEnd();

      if (res.ok) {
        // clear localStorage if you want
        // localStorage.removeItem(STORAGE_KEY);
        // localStorage.removeItem(`${STORAGE_KEY}_saved`);
        alert("Application submitted (simulated).");
      } else {
        alert(res.data?.message || "Submission failed.");
      }
    } catch (err) {
      console.error("submit error", err);
      alert("Network or unexpected error.");
    } finally {
      setSubmitting(false);
    }
  }

  // listen for custom "stepX:next" events (Step1 dispatches this)
  useEffect(() => {
    const handlers = [];
    for (let s = 1; s <= 6; s++) {
      const evName = `step${s}:next`;
      const handler = async (ev) => {
        // ev.detail.stepData may contain updated step data
        if (ev?.detail?.stepData) {
          // merge into data
          setData((d) => ({ ...d, [`step${s}`]: { ...d[`step${s}`], ...ev.detail.stepData } }));
        }
        // if current index is s-1, attempt to progress
        if (idx === s - 1) {
          // only allow if saved or attempt to auto-save by calling handleSaveStep
          if (!saved[idx]) {
            const ok = await handleSaveStep(idx, ev?.detail?.stepData || data[`step${s}`]);
            if (!ok) return;
          }
          setIdx((i) => Math.min(i + 1, 5));
        } else {
          // if fired from a step that isn't the current, ignore
        }
      };
      window.addEventListener(evName, handler);
      handlers.push({ evName, handler });
    }
    return () => {
      handlers.forEach(({ evName, handler }) => window.removeEventListener(evName, handler));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, saved, data]);

  // host step components in an array for simpler mapping
  const steps = [
    {
      key: "step1",
      title: "Travel purpose",
      component: (
        <Step1
          data={data.step1}
          onChange={(patch) => patchStep("step1", patch)}
          onSave={(stepData) => handleSaveStep(0, stepData)}
          saved={saved[0]}
        />
      )
    },
    {
      key: "step2",
      title: "Personal data",
      component: (
        <Step2
          data={data.step2}
          onChange={(patch) => patchStep("step2", patch)}
          onSave={(stepData) => handleSaveStep(1, stepData)}
          saved={saved[1]}
        />
      )
    },
    {
      key: "step3",
      title: "Travel documents",
      component: (
        <Step3
          data={data.step3}
          onChange={(patch) => patchStep("step3", patch)}
          onSave={(stepData) => handleSaveStep(2, stepData)}
          saved={saved[2]}
        />
      )
    },
    {
      key: "step4",
      title: "Visa information",
      component: (
        <Step4
          data={data.step4}
          onChange={(patch) => patchStep("step4", patch)}
          onSave={(stepData) => handleSaveStep(3, stepData)}
          saved={saved[3]}
        />
      )
    },
    {
      key: "step5",
      title: "Add documents",
      component: (
        <Step5
          data={data.step5}
          onChange={(patch) => patchStep("step5", patch)}
          onSave={(stepData) => handleSaveStep(4, stepData)}
          saved={saved[4]}
        />
      )
    },
    {
      key: "step6",
      title: "Fees",
      component: (
        <Step6
          data={data.step6}
          onChange={(patch) => patchStep("step6", patch)}
          onSave={(stepData) => handleSaveStep(5, stepData)}
          saved={saved[5]}
        />
      )
    }
  ];

  return (
    <div className="application-root">
      <div className="container">
        <h1 className="app-title">Application for visa type D</h1>

        <StepNav
          steps={steps.map((s) => s.title)}
          current={idx}
          saved={saved}
          onNavigate={(targetIdx) => {
            // only allow navigation to previous (target < idx) or to saved steps
            if (targetIdx <= idx || saved[targetIdx]) setIdx(targetIdx);
          }}
        />

        <div className="step-wrap">
          {steps[idx].component}
        </div>

        <div className="form-footer">
          {/* show overall submit when on last step */}
          {idx < 5 ? (
            <div className="footer-actions">
              <button className="btn-secondary" onClick={() => { goPrev(); }}>Back</button>
              <div style={{ gap: 12, display: "flex" }}>
                <button
                  className={`btn-save ${saved[idx] ? "saved" : ""}`}
                  onClick={async () => {
                    // call the active step's onSave via handleSaveStep
                    // dispatch a custom event that components can intercept to trigger their own save
                    window.dispatchEvent(new CustomEvent(`triggerSaveStep${idx+1}`));
                    // fallback: attempt parent save using current data
                    const ok = await handleSaveStep(idx, data[`step${idx+1}`]);
                    if (!ok) {
                      alert("Save failed");
                    }
                  }}
                >
                  {saved[idx] ? "Saved" : "Save"}
                </button>
                <button className="btn-primary" onClick={() => goNext()} disabled={!saved[idx]}>
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
      </div>
    </div>
  );
}
