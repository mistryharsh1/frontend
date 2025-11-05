import React, { useEffect, useState } from "react";
import "./Step6.css";


export default function Step6({ data = {}, onChange = () => {}, onSave = async () => true, saved = false, showStepper = false }) {
  const [consent, setConsent] = useState(Boolean(data.consentGiven));
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    setConsent(Boolean(data.consentGiven));
  }, [data]);

  useEffect(() => {
    onChange({ consentGiven: consent });

  }, [consent]);

  function toggleConsent() {
    setConsent((s) => !s);
    setError("");
  }

  async function handleProceed() {
    setError("");
    if (!consent) {
      setError("You must give consent to proceed to the payment gateway.");
      const el = document.querySelector(".consent-block");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setWorking(true);
    try {

      const ok = await onSave({ consentGiven: consent });
      setWorking(false);
      if (ok) {

      } else {
        setError("Unable to proceed. Please try again.");
      }
    } catch (err) {
      console.error("Proceed error", err);
      setWorking(false);
      setError("Unable to proceed. Please try again.");
    }
  }

  return (
    <section className="step6-root" aria-labelledby="step6-heading">
      {/* Optional internal stepper — off by default to avoid duplicate steppers.
          Set showStepper={true} only when Step6 is rendered standalone. */}
      {showStepper ? (
        <div className="internal-stepper" aria-hidden>
          {/* small decorative stepper if needed; keep minimal to avoid duplication */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20 }}>
            <div className="step-marker done">✓</div>
            <div className="step-marker done">✓</div>
            <div className="step-marker done">✓</div>
            <div className="step-marker done">✓</div>
            <div className="step-marker done">✓</div>
            <div className="step-marker active" />
          </div>
        </div>
      ) : null}

      <div className="consent-block" role="group" aria-labelledby="consent-label">
        <h2 id="consent-label" className="consent-title">Consent *</h2>

        <div className="consent-row">
          <button
            type="button"
            className={`consent-checkbox ${consent ? "checked" : ""}`}
            aria-pressed={consent}
            aria-label={consent ? "Consent given" : "Give consent"}
            onClick={toggleConsent}
          >
            {consent && (
              <svg className="consent-check" width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M1 6.5L5 10.5L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          <div className="consent-text">
            <p>
              Under full responsible publication that the stated data are true and entered correctly, as well as that the attached documentation is valid. I agree that my personal data may be processed and that field checks and checks of all data being of importance in procedure of temporary residence approval may be performed. I confirm that stated email address is correct and give my consent to the superior authority for delivery of notification and decision attached to my e-mail address. I agree to actively trace email and status under submitted request and promptly download the sent documentation and procedures according to the same. Date of document delivery is considered the date when the competent authority sent the notification by name. I am aware that due to incomplete and inaccurate data the request may be denied / rejected. This statement is irrevocable and the beginning of giving this consent entered data may not be changed.
            </p>
          </div>
        </div>

        <div className="field-error">{error}</div>
      </div>

      <div className="bottom-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => window.dispatchEvent(new Event("step:previous"))}
        >
          Previous step
        </button>

        <button
          type="button"
          className="btn-primary"
          onClick={handleProceed}
          disabled={working}
        >
          {working ? "Processing..." : "Proceed to payment gateway"}
        </button>
      </div>
    </section>
  );
}
