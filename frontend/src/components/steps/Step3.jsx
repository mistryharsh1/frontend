// src/components/steps/Step3.jsx
import React, { useEffect, useState, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../steps/Step3.css";
import InfoIcon from "../InfoIcon";

/* Countries (reuse same list as Step2) */
const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan",
  "Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia",
  "Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
  "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Costa Rica","Croatia","Cuba",
  "Cyprus","Czech Republic","Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador",
  "Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia",
  "Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary",
  "Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan",
  "Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania",
  "Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico",
  "Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands",
  "New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Panama",
  "Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda",
  "Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe",
  "Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia",
  "South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan",
  "Tajikistan","Tanzania","Thailand","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda",
  "Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela",
  "Vietnam","Yemen","Zambia","Zimbabwe"
];

function toISODateString(d) {
  if (!d) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Step3({
  data = {},
  onChange = () => {},
  onSave = async () => true,
  saved = false,
  showStepper = false
}) {
  const [local, setLocal] = useState({
    travelDocumentType: data.travelDocumentType || "",
    travelDocumentNumber: data.travelDocumentNumber || "",
    countryOfIssue: data.countryOfIssue || "",
    placeOfIssue: data.placeOfIssue || "",
    dateOfIssue: data.dateOfIssue ? new Date(data.dateOfIssue) : null,
    validUntil: data.validUntil ? new Date(data.validUntil) : null,
    liveOutsideOrigin: data.liveOutsideOrigin || "no"
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [localSaved, setLocalSaved] = useState(Boolean(saved));

  useEffect(() => {
    setLocal({
      travelDocumentType: data.travelDocumentType || "",
      travelDocumentNumber: data.travelDocumentNumber || "",
      countryOfIssue: data.countryOfIssue || "",
      placeOfIssue: data.placeOfIssue || "",
      dateOfIssue: data.dateOfIssue ? new Date(data.dateOfIssue) : null,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      liveOutsideOrigin: data.liveOutsideOrigin || "no"
    });
    setLocalSaved(Boolean(saved));
  }, [data, saved]);

  function patch(name, value) {
    setLocal((s) => {
      const next = { ...s, [name]: value };
      return next;
    });
    setErrors((e) => ({ ...e, [name]: undefined }));
    onChange({ [name]: value });
    setLocalSaved(false);
  }

  function validate() {
    const e = {};
    if (!local.travelDocumentType) e.travelDocumentType = "Please select document type";
    if (!local.travelDocumentNumber || !local.travelDocumentNumber.trim()) e.travelDocumentNumber = "Please enter document number";
    if (!local.countryOfIssue) e.countryOfIssue = "Please select country of issue";
    if (!local.dateOfIssue || !(local.dateOfIssue instanceof Date)) e.dateOfIssue = "Please enter date of issue";
    if (!local.validUntil || !(local.validUntil instanceof Date)) e.validUntil = "Please enter valid until date";
    return e;
  }

  const doSave = useCallback(async () => {
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
          window.dispatchEvent(new CustomEvent("step3:next", { detail: { stepData: payload } }));
          return true;
        } else {
          console.warn("Step3: parent onSave returned falsy");
          return false;
        }
      } catch (err) {
        setSaving(false);
        console.error("Step3 save error:", err);
        return false;
      }
    },
    // Dependencies for doSave
    [local, onSave, setErrors, setSaving, setLocalSaved]
  );

  useEffect(() => {
    function onTrigger() { doSave(); }
    window.addEventListener("triggerSaveStep3", onTrigger);
    return () => window.removeEventListener("triggerSaveStep3", onTrigger);
  }, [doSave]); // run once, with doSave as a dependency

  function onNextClick() {
    if (!localSaved) {
      doSave().then((ok) => { 
        if (ok) window.dispatchEvent(new CustomEvent("step3:next", { detail: { stepData: local } })); 
      });
      return;
    }
    window.dispatchEvent(new CustomEvent("step3:next", { detail: { stepData: local } }));
  }

  return (
    <section className="step3-root">
      {showStepper && <div className="internal-stepper" />}

      <h2 className="step-title">Information about travel documents</h2>

      <div className="form-container">
        <div className="two-col travel-grid">
          <div className="col-left">
            <div className="form-field">
              <label className="label">Type of travel document: <span className="req">*</span></label>
              <div className="field-row">
                <select
                  name="travelDocumentType"
                  className={`form-select ${errors.travelDocumentType ? "error" : ""}`}
                  value={local.travelDocumentType}
                  onChange={(e) => patch("travelDocumentType", e.target.value)}
                >
                  <option value="">Select document</option>
                  <option value="passport">Passport</option>
                  <option value="travel_card">Travel card</option>
                </select>
                <div className="info-icon-wrapper">
                  <InfoIcon text="Choose the document you will travel with (passport is most common)." />
                </div>
              </div>
              <div className="field-error">{errors.travelDocumentType}</div>
            </div>

            <div className="form-field">
              <label className="label">Travel document number: <span className="req">*</span></label>
              <div className="field-row">
                <input
                  name="travelDocumentNumber"
                  className={`form-control ${errors.travelDocumentNumber ? "error" : ""}`}
                  value={local.travelDocumentNumber}
                  onChange={(e) => patch("travelDocumentNumber", e.target.value)}
                />
                <div className="info-icon-wrapper">
                  <InfoIcon text="Enter the number printed on the document's data page." />
                </div>
              </div>
              <div className="field-error">{errors.travelDocumentNumber}</div>
            </div>

            <div className="form-field">
              <label className="label">Country of issue: <span className="req">*</span></label>
              <div className="field-row">
                <select
                  name="countryOfIssue"
                  className={`form-select ${errors.countryOfIssue ? "error" : ""}`}
                  value={local.countryOfIssue}
                  onChange={(e) => patch("countryOfIssue", e.target.value)}
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="info-icon-wrapper">
                  <InfoIcon text="Country that issued the travel document." />
                </div>
              </div>
              <div className="field-error">{errors.countryOfIssue}</div>
            </div>

            <div className="form-field">
              <label className="label">Place of issue:</label>
              <input
                name="placeOfIssue"
                className="form-control"
                value={local.placeOfIssue}
                onChange={(e) => patch("placeOfIssue", e.target.value)}
              />
              <div className="field-error">{errors.placeOfIssue}</div>
            </div>
          </div>

          <div className="col-right">
            <div className="form-field">
              <label className="label">Do you live in a country other than your country of origin? <span className="req">*</span></label>
              <div className="field-row">
                <select
                  name="liveOutsideOrigin"
                  className="form-select"
                  value={local.liveOutsideOrigin || "no"}
                  onChange={(e) => patch("liveOutsideOrigin", e.target.value)}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
                <div className="info-icon-wrapper">
                  <InfoIcon text="Select Yes if your current country of residence is different from your country of citizenship." />
                </div>
              </div>
            </div>

            <div className="form-field">
              <label className="label">Date of issue: <span className="req">*</span></label>
              <DatePicker
                name="dateOfIssue"
                selected={local.dateOfIssue}
                onChange={(d) => patch("dateOfIssue", d)}
                dateFormat="dd/MM/yyyy"
                className={`form-control ${errors.dateOfIssue ? "error" : ""}`}
                placeholderText="dd/mm/yyyy"
                maxDate={new Date()}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
              <div className="field-error">{errors.dateOfIssue}</div>
            </div>

            <div className="form-field">
              <label className="label">Valid until: <span className="req">*</span></label>
              <DatePicker
                name="validUntil"
                selected={local.validUntil}
                onChange={(d) => patch("validUntil", d)}
                dateFormat="dd/MM/yyyy"
                className={`form-control ${errors.validUntil ? "error" : ""}`}
                placeholderText="dd/mm/yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
              <div className="field-error">{errors.validUntil}</div>
            </div>

            <div className="field-help-block">
              <small className="field-help">
                The travel document must have been issued in the last 10 years and must have two consecutive blank pages.
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="step-actions">
        <div className="left-group">
          <button className="btn-secondary" onClick={() => window.dispatchEvent(new Event("step:previous"))}>Previous step</button>
        </div>

        <div className="right-group">
          <button className={`btn-save ${localSaved ? "saved" : ""}`} onClick={doSave} disabled={saving}>
            {saving ? "Saving..." : (localSaved ? "Saved" : "Save")}
          </button>
          <button className="btn-primary" onClick={onNextClick} disabled={saving}>Next step</button>
        </div>
      </div>
    </section>
  );
}
