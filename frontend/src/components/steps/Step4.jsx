// src/components/steps/Step4.jsx
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import "../steps/Step4.css";
import InfoIcon from "../InfoIcon";

/* helper option lists */
const VISA_TYPES = [
  "Visa D - long stay",
  "Visa C - short stay",
  "Other"
];

const TRAVEL_PURPOSES = [
  "Study",
  "Employment",
  "Family reunification",
  "Research",
  "Other"
];

const YESNO = [
  { value: "no", label: "No" },
  { value: "yes", label: "Yes" }
];

const WHO_COVERS = [
  "Host company",
  "Applicant",
  "Other"
];

const FINANCIAL_RESOURCES = [
  "Accommodation",
  "Savings",
  "Sponsor",
  "Other"
];

/* small sample options for searchable selects — extend as needed */
const MUNICIPALITY_OPTIONS = [
  { value: "novi_beograd", label: "NOVI BEOGRAD" },
  { value: "stari_grad", label: "STARI GRAD" },
  { value: "zvezdara", label: "ZVEZDARA" }
];

const STREET_OPTIONS = [
  { value: "dr_ivana_ribara", label: "DR IVANA RIBARA" },
  { value: "kralja_petra", label: "KRALJA PETRA" },
  { value: "nemanjina", label: "NEMANJINA" }
];

function daysBetween(a, b) {
  if (!a || !b) return null;
  const msPerDay = 1000 * 60 * 60 * 24;
  // difference in days (rounded)
  return Math.round((b.setHours(0,0,0,0) - a.setHours(0,0,0,0)) / msPerDay);
}

export default function Step4({ data = {}, onChange = () => {}, onSave = async () => true, saved = false, showStepper = false }) {
  const [local, setLocal] = useState({
    consulate: data.consulate || "",
    arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : null,
    departureDate: data.departureDate ? new Date(data.departureDate) : null,
    borderCrossing: data.borderCrossing || "",
    transport: data.transport || "",
    visaType: data.visaType || "",
    travelPurpose: data.travelPurpose || "",
    daysOfStay: data.daysOfStay || "",
    otherVisaIssued: data.otherVisaIssued || "no",
    previousStay: data.previousStay || "no",
    // intended residence
    hostName: data.hostName || "",
    hostTelephone: data.hostTelephone || "",
    hostAddress: data.hostAddress || "",
    hostEmail: data.hostEmail || "",
    municipality: (data.municipality ? { value: data.municipality, label: data.municipality } : null),
    settlement: data.settlement || "",
    street: (data.street ? { value: data.street, label: data.street } : null),
    houseNumber: data.houseNumber || "",
    entrance: data.entrance || "",
    floor: data.floor || "",
    apartment: data.apartment || "",
    whoCovers: data.whoCovers || "",
    financialResources: data.financialResources || ""
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [localSaved, setLocalSaved] = useState(Boolean(saved));

  useEffect(() => {
    setLocal({
      consulate: data.consulate || "",
      arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : null,
      departureDate: data.departureDate ? new Date(data.departureDate) : null,
      borderCrossing: data.borderCrossing || "",
      transport: data.transport || "",
      visaType: data.visaType || "",
      travelPurpose: data.travelPurpose || "",
      daysOfStay: data.daysOfStay || "",
      otherVisaIssued: data.otherVisaIssued || "no",
      previousStay: data.previousStay || "no",
      hostName: data.hostName || "",
      hostTelephone: data.hostTelephone || "",
      hostAddress: data.hostAddress || "",
      hostEmail: data.hostEmail || "",
      municipality: (data.municipality ? { value: data.municipality, label: data.municipality } : null),
      settlement: data.settlement || "",
      street: (data.street ? { value: data.street, label: data.street } : null),
      houseNumber: data.houseNumber || "",
      entrance: data.entrance || "",
      floor: data.floor || "",
      apartment: data.apartment || "",
      whoCovers: data.whoCovers || "",
      financialResources: data.financialResources || ""
    });
    setLocalSaved(Boolean(saved));
  }, [data, saved]);

  function patch(name, value) {
    setLocal((s) => {
      const next = { ...s, [name]: value };
      return next;
    });
    // Clear relevant errors proactively
    setErrors((e) => {
      const copy = { ...e };
      delete copy[name];
      // if dates changed, also clear daysOfStay or date mismatch errors
      if (name === "arrivalDate" || name === "departureDate") {
        delete copy.daysOfStay;
        delete copy.departureDate;
        delete copy.arrivalDate;
      }
      return copy;
    });
    // normalize what we send to parent for some fields
    if (name === "municipality" || name === "street") {
      onChange({ [name]: value ? value.value : "" });
    } else {
      onChange({ [name]: value });
    }
    setLocalSaved(false);
  }

  function validate() {
    const e = {};
    if (!local.consulate) e.consulate = "Please select consular office";
    if (!local.arrivalDate || !(local.arrivalDate instanceof Date)) e.arrivalDate = "Please enter arrival date";
    if (!local.departureDate || !(local.departureDate instanceof Date)) e.departureDate = "Please enter departure date";
    if (!local.transport) e.transport = "Please select mode of transport";

    // arrival/departure order rule
    if (local.arrivalDate && local.departureDate && !(local.departureDate > local.arrivalDate)) {
      e.departureDate = "Departure date must be after arrival date";
    }

    // daysOfStay must equal difference in days
    if (!local.daysOfStay || !String(local.daysOfStay).trim()) {
      e.daysOfStay = "Please enter number of days of stay";
    } else {
      const parsed = parseInt(String(local.daysOfStay).trim(), 10);
      if (Number.isNaN(parsed) || parsed <= 0) {
        e.daysOfStay = "Days of stay must be a positive number";
      } else if (local.arrivalDate && local.departureDate) {
        // compute day difference: departure - arrival in full days
        const a = new Date(local.arrivalDate);
        const b = new Date(local.departureDate);
        // ensure time portions don't affect difference
        a.setHours(0,0,0,0);
        b.setHours(0,0,0,0);
        const msPerDay = 1000 * 60 * 60 * 24;
        const diff = Math.round((b - a) / msPerDay);
        if (parsed !== diff) {
          e.daysOfStay = `Days of stay must equal the date difference (${diff} day${diff === 1 ? "" : "s"})`;
        }
      }
    }

    // intended residence required
    if (!local.hostName || !local.hostName.trim()) e.hostName = "Please enter name of your host";
    if (!local.hostTelephone || !local.hostTelephone.trim()) e.hostTelephone = "Please enter host's telephone number";
    if (!local.hostAddress || !local.hostAddress.trim()) e.hostAddress = "Please enter host's address";
    if (!local.hostEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(local.hostEmail)) e.hostEmail = "Please enter a valid e-mail";
    return e;
  }

  async function doSave() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      const first = Object.keys(e)[0];
      const el = document.querySelector(`[name="${first}"]`) || document.querySelector(".react-select__control");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }

    setSaving(true);
    try {
      // prepare payload: turn date objects to ISO date strings, and select options into values
      const payload = {
        ...local,
        arrivalDate: local.arrivalDate ? local.arrivalDate.toISOString().split("T")[0] : null,
        departureDate: local.departureDate ? local.departureDate.toISOString().split("T")[0] : null,
        municipality: local.municipality ? local.municipality.value : "",
        street: local.street ? local.street.value : ""
      };
      const ok = await onSave(payload);
      setSaving(false);
      if (ok) {
        setLocalSaved(true);
        window.dispatchEvent(new CustomEvent("step4:next", { detail: { stepData: payload } }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Step4 save error:", err);
      setSaving(false);
      return false;
    }
  }

  useEffect(() => {
    function onTrigger() { doSave(); }
    window.addEventListener("triggerSaveStep4", onTrigger);
    return () => window.removeEventListener("triggerSaveStep4", onTrigger);
  }, []); // run once

  function onNextClick() {
    if (!localSaved) {
      doSave().then((ok) => {
        if (ok) window.dispatchEvent(new CustomEvent("step4:next", { detail: { stepData: local } }));
      });
      return;
    }
    window.dispatchEvent(new CustomEvent("step4:next", { detail: { stepData: local } }));
  }

  // compute minDate for departure to be arrivalDate + 1 day (or arrivalDate)
  const departureMin = local.arrivalDate ? new Date(local.arrivalDate.getTime() + 24*60*60*1000) : null;

  return (
    <section className="step4-root">
      {showStepper && <div className="internal-stepper" />}

      <h2 className="step-title">Information about the visa for which you apply</h2>

      <div className="form-container">
        <div className="two-col step4-grid">
          <div className="col-left">
            <div className="form-field">
              <label className="label">Diplomatic and Consular Representation Office of the Republic of Serbia in: <span className="req">*</span></label>
              <div className="field-row">
                <select
                  name="consulate"
                  className={`form-select ${errors.consulate ? "error" : ""}`}
                  value={local.consulate}
                  onChange={(e) => patch("consulate", e.target.value)}
                >
                  <option value="">Select office</option>
                  <option value="newdelhi">NEW DELHI</option>
                  <option value="mumbai">MUMBAI</option>
                  <option value="dubai">DUBAI</option>
                </select>
                <div className="info-icon-wrapper"><InfoIcon text="Select the embassy or consulate where you submit your visa application." /></div>
              </div>
              <div className="field-error">{errors.consulate}</div>
            </div>

            <div className="form-field">
              <label className="label">Visa type</label>
              <div className="field-row">
                <select name="visaType" className="form-select" value={local.visaType} onChange={(e) => patch("visaType", e.target.value)}>
                  <option value="">Select visa type</option>
                  {VISA_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
                <div className="info-icon-wrapper"><InfoIcon text="Choose the visa category you are applying for." /></div>
              </div>
            </div>

            <div className="form-field">
              <label className="label">Travel purpose</label>
              <div className="field-row">
                <select name="travelPurpose" className="form-select" value={local.travelPurpose} onChange={(e) => patch("travelPurpose", e.target.value)}>
                  <option value="">Select purpose</option>
                  {TRAVEL_PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <div className="info-icon-wrapper"><InfoIcon text="Primary purpose of your stay." /></div>
              </div>
            </div>

            <div className="form-field">
              <label className="label">Number of days of stay: <span className="req">*</span></label>
              <div className="field-row">
                <input name="daysOfStay" className={`form-control ${errors.daysOfStay ? "error" : ""}`} value={local.daysOfStay} onChange={(e) => patch("daysOfStay", e.target.value)} />
                <div className="info-icon-wrapper"><InfoIcon text="Enter planned number of days you intend to stay." /></div>
              </div>
              <div className="field-error">{errors.daysOfStay}</div>
            </div>

            <div className="form-field">
              <label className="label">Other visas issued in the previous three years</label>
              <div className="field-row">
                <select name="otherVisaIssued" className="form-select" value={local.otherVisaIssued} onChange={(e) => patch("otherVisaIssued", e.target.value)}>
                  {YESNO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <div className="info-icon-wrapper"><InfoIcon text="Have you been issued visas during the last three years?" /></div>
              </div>
            </div>
          </div>

          <div className="col-right">
            <div className="form-field">
              <label className="label">Date of arrival in the Republic of Serbia: <span className="req">*</span></label>
              <div className="field-row">
                <DatePicker
                  name="arrivalDate"
                  selected={local.arrivalDate}
                  onChange={(d) => patch("arrivalDate", d)}
                  dateFormat="dd/MM/yyyy"
                  className={`form-control ${errors.arrivalDate ? "error" : ""}`}
                  placeholderText="dd/mm/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
                <div className="info-icon-wrapper"><InfoIcon text="Planned date of arrival." /></div>
              </div>
              <div className="field-error">{errors.arrivalDate}</div>
            </div>

            <div className="form-field">
              <label className="label">Date of departure from the Republic of Serbia: <span className="req">*</span></label>
              <div className="field-row">
                <DatePicker
                  name="departureDate"
                  selected={local.departureDate}
                  onChange={(d) => patch("departureDate", d)}
                  dateFormat="dd/MM/yyyy"
                  className={`form-control ${errors.departureDate ? "error" : ""}`}
                  placeholderText="dd/mm/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  minDate={departureMin}
                />
                <div className="info-icon-wrapper"><InfoIcon text="Planned date of departure." /></div>
              </div>
              <div className="field-error">{errors.departureDate}</div>
            </div>

            <div className="form-field">
              <label className="label">Border crossing</label>
              <div className="field-row">
                <select name="borderCrossing" className="form-select" value={local.borderCrossing} onChange={(e) => patch("borderCrossing", e.target.value)}>
                  <option value="">Select crossing</option>
                  <option value="beograd">BEOGRAD - AIRPORT</option>
                  <option value="nbs">Novi Beograd - Road</option>
                </select>
                <div className="info-icon-wrapper"><InfoIcon text="Select the point of first entry." /></div>
              </div>
            </div>

            <div className="form-field">
              <label className="label">Means of transport: <span className="req">*</span></label>
              <div className="field-row">
                <select name="transport" className={`form-select ${errors.transport ? "error" : ""}`} value={local.transport} onChange={(e) => patch("transport", e.target.value)}>
                  <option value="">Select</option>
                  <option value="air">AIRPLANE</option>
                  <option value="land">LAND</option>
                  <option value="sea">SEA</option>
                </select>
                <div className="info-icon-wrapper"><InfoIcon text="Example: airplane, car, bus, etc." /></div>
              </div>
              <div className="field-error">{errors.transport}</div>
            </div>
          </div>
        </div>

        <h3 className="section-title">Information on previous stay in the Republic of Serbia</h3>
        <div className="single-row">
          <div className="form-field">
            <label className="label">Have you previously stayed in the Republic of Serbia? <span className="req">*</span></label>
            <div className="field-row">
              <select name="previousStay" className="form-select" value={local.previousStay} onChange={(e) => patch("previousStay", e.target.value)}>
                {YESNO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="info-icon-wrapper"><InfoIcon text="Have you ever had previous stays in Serbia?" /></div>
            </div>
          </div>
        </div>

        <h3 className="section-title">Data on intended (future) residence in the Republic of Serbia</h3>

        <div className="two-col intended-grid">
          <div className="col-left">
            <div className="form-field">
              <label className="label">Name of your host: <span className="req">*</span></label>
              <div className="field-row">
                <input name="hostName" className={`form-control ${errors.hostName ? "error" : ""}`} value={local.hostName} onChange={(e) => patch("hostName", e.target.value)} />
                <div className="info-icon-wrapper"><InfoIcon text="Name of the person or organization hosting you." /></div>
              </div>
              <div className="field-error">{errors.hostName}</div>
            </div>

            <div className="form-field">
              <label className="label">Host's telephone number: <span className="req">*</span></label>
              <div className="field-row">
                <input name="hostTelephone" className={`form-control ${errors.hostTelephone ? "error" : ""}`} value={local.hostTelephone} onChange={(e) => patch("hostTelephone", e.target.value)} />
                <div className="info-icon-wrapper"><InfoIcon text="Include country code if applicable." /></div>
              </div>
              <div className="field-error">{errors.hostTelephone}</div>
            </div>

            <div className="form-field">
              <label className="label">Host's address: <span className="req">*</span></label>
              <div className="field-row">
                <input name="hostAddress" className={`form-control ${errors.hostAddress ? "error" : ""}`} value={local.hostAddress} onChange={(e) => patch("hostAddress", e.target.value)} />
                <div className="info-icon-wrapper"><InfoIcon text="Full address where you will stay." /></div>
              </div>
              <div className="field-error">{errors.hostAddress}</div>
            </div>

            <div className="form-field">
              <label className="label">Host's e-mail address: <span className="req">*</span></label>
              <div className="field-row">
                <input name="hostEmail" className={`form-control ${errors.hostEmail ? "error" : ""}`} value={local.hostEmail} onChange={(e) => patch("hostEmail", e.target.value)} />
                <div className="info-icon-wrapper"><InfoIcon text="Contact e-mail of your host." /></div>
              </div>
              <div className="field-error">{errors.hostEmail}</div>
            </div>

            <div className="form-field">
              <label className="label">Municipality: <span className="req">*</span></label>
              <div className="field-row" style={{ alignItems: "stretch" }}>
                <div style={{ flex: 1 }}>
                  <Select
                    name="municipality"
                    className="react-select"
                    classNamePrefix="react-select"
                    options={MUNICIPALITY_OPTIONS}
                    value={local.municipality}
                    onChange={(opt) => patch("municipality", opt)}
                    isSearchable
                    placeholder="Select municipality"
                  />
                </div>
                <div className="info-icon-wrapper"><InfoIcon text="Select municipality where you will stay." /></div>
              </div>
              <div className="field-error">{errors.municipality}</div>
            </div>

            <div className="form-field">
              <label className="label">Settlement: <span className="req">*</span></label>
              <div className="field-row">
                <select name="settlement" className="form-select" value={local.settlement} onChange={(e) => patch("settlement", e.target.value)}>
                  <option value="">Select settlement</option>
                  <option value="beograd">BEOGRAD</option>
                </select>
                <div className="info-icon-wrapper"><InfoIcon text="Select settlement (city/locality)." /></div>
              </div>
              <div className="field-error">{errors.settlement}</div>
            </div>
          </div>

          <div className="col-right">
            <div className="form-field">
              <label className="label">Street: <span className="req">*</span></label>
              <div className="field-row" style={{ alignItems: "stretch" }}>
                <div style={{ flex: 1 }}>
                  <Select
                    name="street"
                    className="react-select"
                    classNamePrefix="react-select"
                    options={STREET_OPTIONS}
                    value={local.street}
                    onChange={(opt) => patch("street", opt)}
                    isSearchable
                    placeholder="Select street"
                  />
                </div>
                <div className="info-icon-wrapper"><InfoIcon text="Street of the host address." /></div>
              </div>
              <div className="field-error">{errors.street}</div>
            </div>

            <div className="form-field">
              <label className="label">House number: <span className="req">*</span></label>
              <div className="field-row">
                <select name="houseNumber" className="form-select" value={local.houseNumber} onChange={(e) => patch("houseNumber", e.target.value)}>
                  <option value="">Select</option>
                  <option value="024">024</option>
                </select>
                <div className="info-icon-wrapper"><InfoIcon text="House number of the host address." /></div>
              </div>
              <div className="field-error">{errors.houseNumber}</div>
            </div>

            <div className="form-field">
              <label className="label">Entrance:</label>
              <input name="entrance" className="form-control" value={local.entrance} onChange={(e) => patch("entrance", e.target.value)} />
            </div>

            <div className="form-field">
              <label className="label">Floor:</label>
              <input name="floor" className="form-control" value={local.floor} onChange={(e) => patch("floor", e.target.value)} />
            </div>

            <div className="form-field">
              <label className="label">Apartment:</label>
              <input name="apartment" className="form-control" value={local.apartment} onChange={(e) => patch("apartment", e.target.value)} />
            </div>

            <div className="form-field">
              <label className="label">Who is covering your travel costs? <span className="req">*</span></label>
              <div className="field-row">
                <select name="whoCovers" className={`form-select ${errors.whoCovers ? "error" : ""}`} value={local.whoCovers} onChange={(e) => patch("whoCovers", e.target.value)}>
                  <option value="">Select</option>
                  {WHO_COVERS.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
                <div className="info-icon-wrapper"><InfoIcon text="Who will pay for your travel costs." /></div>
              </div>
              <div className="field-error">{errors.whoCovers}</div>
            </div>

            <div className="form-field">
              <label className="label">Financial resources for living expenses</label>
              <div className="field-row">
                <select name="financialResources" className="form-select" value={local.financialResources} onChange={(e) => patch("financialResources", e.target.value)}>
                  <option value="">Select</option>
                  {FINANCIAL_RESOURCES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <div className="info-icon-wrapper"><InfoIcon text="Source of funds for living expenses." /></div>
              </div>
            </div>
          </div>
        </div>

        <div className="notes">
          <small className="hint">All fields marked with * are mandatory</small>
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
      </div>
    </section>
  );
}
