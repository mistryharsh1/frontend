// src/components/steps/Step2.jsx
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../steps/Step2.css";
import InfoIcon from "../../components/InfoIcon";

/* Countries (same list as before) */
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

/* Country calling codes map (extend as needed) */
const COUNTRY_CALLING_CODES = {
  "India": "+91",
  "United States": "+1",
  "United Kingdom": "+44",
  "Kuwait": "+965",
  "Estonia": "+372",
  "Germany": "+49",
  "France": "+33",
  "Italy": "+39",
  "Spain": "+34",
  "Netherlands": "+31",
  "Australia": "+61",
  "Canada": "+1",
  "Pakistan": "+92",
  "Bangladesh": "+880",
  "Nepal": "+977",
  "Sri Lanka": "+94",
  "China": "+86",
  "Japan": "+81",
  "South Korea": "+82",
  "Brazil": "+55",
  "Mexico": "+52",
  "United Arab Emirates": "+971",
  "Qatar": "+974",
  "Saudi Arabia": "+966",
  "Turkey": "+90",
  "Russia": "+7"
};

/* Phone helpers */
function normalizePhoneInput(value) {
  if (!value) return "";
  let v = String(value).replace(/[()\s.-]/g, "");
  if (/^00\d+/.test(v)) v = "+" + v.slice(2);
  if (/^[0-9]+$/.test(v)) v = "+" + v;
  if (!v.startsWith("+")) v = "+" + v.replace(/^\D+/, "");
  return v;
}
function isValidE164(value) {
  if (!value) return false;
  return /^\+[1-9]\d{1,14}$/.test(value);
}

export default function Step2({ data = {}, onChange = () => {}, onSave = async () => true, saved = false, showStepper = false }) {
  const [local, setLocal] = useState({
    lastName: data.lastName || "",
    lastNameAtBirth: data.lastNameAtBirth || "",
    firstName: data.firstName || "",
    gender: data.gender || "",
    dob: data.dob ? new Date(data.dob) : null,
    countryOfBirth: data.countryOfBirth || "",
    placeOfBirth: data.placeOfBirth || "",
    address: data.address || "",
    telephone: data.telephone || "",
    passportIssuingCountry: data.passportIssuingCountry || "",
    originalCitizenship: data.originalCitizenship || "",
    maritalStatus: data.maritalStatus || "",
    fatherFirstName: data.fatherFirstName || "",
    motherFirstName: data.motherFirstName || "",
    email: data.email || ""
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [localSaved, setLocalSaved] = useState(Boolean(saved));

  useEffect(() => {
    setLocal({
      lastName: data.lastName || "",
      lastNameAtBirth: data.lastNameAtBirth || "",
      firstName: data.firstName || "",
      gender: data.gender || "",
      dob: data.dob ? new Date(data.dob) : null,
      countryOfBirth: data.countryOfBirth || "",
      placeOfBirth: data.placeOfBirth || "",
      address: data.address || "",
      telephone: data.telephone || "",
      passportIssuingCountry: data.passportIssuingCountry || "",
      originalCitizenship: data.originalCitizenship || "",
      maritalStatus: data.maritalStatus || "",
      fatherFirstName: data.fatherFirstName || "",
      motherFirstName: data.motherFirstName || "",
      email: data.email || ""
    });
    setLocalSaved(Boolean(saved));
  }, [data, saved]);

  function patchLocal(name, value) {
    setLocal((s) => {
      const next = { ...s, [name]: value };
      return next;
    });
    setErrors((e) => ({ ...e, [name]: undefined }));
    onChange({ [name]: value });
    setLocalSaved(false);
  }

  /* when originalCitizenship changes, attempt to prefix telephone if it's local */
  useEffect(() => {
    const cc = local.originalCitizenship;
    const calling = COUNTRY_CALLING_CODES[cc];
    if (!calling) return;
    if (!local.telephone) return;
    if (local.telephone.trim().startsWith("+")) return;
    const digits = local.telephone.replace(/\D/g, "");
    if (digits.length >= 6 && digits.length <= 15) {
      const newVal = calling + digits;
      patchLocal("telephone", newVal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local.originalCitizenship]);

  /* phone blur normalization + validation */
  function handlePhoneBlur() {
    if (!local.telephone) return;
    const normalized = normalizePhoneInput(local.telephone);
    patchLocal("telephone", normalized);
    if (!isValidE164(normalized)) {
      setErrors((e) => ({ ...e, telephone: "Phone must be in E.164 format (e.g. +441632960960)" }));
    } else {
      setErrors((e) => ({ ...e, telephone: undefined }));
    }
  }

  function validate() {
    const e = {};
    if (!local.lastName || !local.lastName.trim()) e.lastName = "Please enter last name";
    if (!local.firstName || !local.firstName.trim()) e.firstName = "Please enter first name";
    if (!local.gender) e.gender = "Please select gender";
    if (!local.dob || !(local.dob instanceof Date)) e.dob = "Please select date of birth";
    if (!local.countryOfBirth) e.countryOfBirth = "Please select country of birth";
    if (!local.address || !local.address.trim()) e.address = "Please enter address";
    if (!local.telephone || !local.telephone.trim()) e.telephone = "Please enter telephone";
    else if (!isValidE164(local.telephone)) e.telephone = "Phone must be in E.164 format (e.g. +441632960960)";
    if (!local.passportIssuingCountry) e.passportIssuingCountry = "Please select passport issuing country";
    if (!local.originalCitizenship) e.originalCitizenship = "Please select original citizenship";
    if (!local.maritalStatus) e.maritalStatus = "Please select marital status";
    if (!local.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(local.email)) e.email = "Enter a valid email address";
    return e;
  }

  async function doSave() {
    const eobj = validate();
    setErrors(eobj);
    if (Object.keys(eobj).length > 0) {
      const first = Object.keys(eobj)[0];
      const el = document.querySelector(`[name="${first}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }

    setSaving(true);
    try {
      const payload = { ...local, dob: local.dob ? local.dob.toISOString().split("T")[0] : null };
      const ok = await onSave(payload);
      setSaving(false);
      if (ok) {
        setLocalSaved(true);
        window.dispatchEvent(new CustomEvent("step2:next", { detail: { stepData: payload } }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Step2 save error:", err);
      setSaving(false);
      return false;
    }
  }

  /* respond to global save trigger */
  useEffect(() => {
    function onTrigger() { doSave(); }
    window.addEventListener("triggerSaveStep2", onTrigger);
    return () => window.removeEventListener("triggerSaveStep2", onTrigger);
  }, []); // run once

  function onNextClick() {
    if (!localSaved) {
      doSave().then((ok) => { if (ok) window.dispatchEvent(new CustomEvent("step2:next", { detail: { stepData: local } })); });
      return;
    }
    window.dispatchEvent(new CustomEvent("step2:next", { detail: { stepData: local } }));
  }

  return (
    <section className="step2-root">
      {showStepper && <div className="internal-stepper" />}

      <h2 className="step-title">Personal information</h2>

      <div className="two-col">
        <div className="col">
          <div className="form-field">
            <label className="label">User's last name: <span className="req">*</span></label>
            <input name="lastName" className={`form-control ${errors.lastName ? "error" : ""}`} value={local.lastName} onChange={(e) => patchLocal("lastName", e.target.value)} />
            <div className="field-error">{errors.lastName}</div>
          </div>

          <div className="form-field">
            <label className="label">Last name at birth:</label>
            <input name="lastNameAtBirth" className="form-control" value={local.lastNameAtBirth} onChange={(e) => patchLocal("lastNameAtBirth", e.target.value)} />
            <div className="field-error">{errors.lastNameAtBirth}</div>
          </div>

          <div className="form-field">
            <label className="label">User's first name: <span className="req">*</span></label>
            <input name="firstName" className={`form-control ${errors.firstName ? "error" : ""}`} value={local.firstName} onChange={(e) => patchLocal("firstName", e.target.value)} />
            <div className="field-error">{errors.firstName}</div>
          </div>

          <div className="form-field">
            <label className="label">Gender: <span className="req">*</span></label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select name="gender" className={`form-select ${errors.gender ? "error" : ""}`} value={local.gender} onChange={(e) => patchLocal("gender", e.target.value)}>
                <option value="">Select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
              <div className="info-icon-wrapper">
                <InfoIcon text="Select the gender that appears on your passport." />
              </div>
            </div>
            <div className="field-error">{errors.gender}</div>
          </div>

          <div className="form-field">
            <label className="label">Date of birth: <span className="req">*</span></label>
            <DatePicker
              name="dob"
              selected={local.dob}
              onChange={(d) => patchLocal("dob", d)}
              dateFormat="dd/MM/yyyy"
              className={`form-control ${errors.dob ? "error" : ""}`}
              placeholderText="dd/mm/yyyy"
              maxDate={new Date()}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
            <div className="field-error">{errors.dob}</div>
          </div>

          <div className="form-field">
            <label className="label">Country of birth: <span className="req">*</span></label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select name="countryOfBirth" className={`form-select ${errors.countryOfBirth ? "error" : ""}`} value={local.countryOfBirth} onChange={(e) => patchLocal("countryOfBirth", e.target.value)}>
                <option value="">Select country</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="info-icon-wrapper">
                <InfoIcon text="Choose the country that appears on your birth certificate." />
              </div>
            </div>
            <div className="field-error">{errors.countryOfBirth}</div>
          </div>

          <div className="form-field">
            <label className="label">Place of birth:</label>
            <input name="placeOfBirth" className="form-control" value={local.placeOfBirth} onChange={(e) => patchLocal("placeOfBirth", e.target.value)} />
            <div className="field-error">{errors.placeOfBirth}</div>
          </div>
        </div>

        <div className="col">
          <div className="form-field">
            <label className="label">Address: <span className="req">*</span></label>
            <input name="address" className={`form-control ${errors.address ? "error" : ""}`} value={local.address} onChange={(e) => patchLocal("address", e.target.value)} />
            <div className="field-error">{errors.address}</div>
          </div>

          <div className="form-field">
            <label className="label">Telephone: <span className="req">*</span></label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                name="telephone"
                className={`form-control ${errors.telephone ? "error" : ""}`}
                value={local.telephone}
                onChange={(e) => patchLocal("telephone", e.target.value)}
                onBlur={handlePhoneBlur}
                placeholder="+919xxxxxxxxx"
              />
              <div className="info-icon-wrapper">
                <InfoIcon text="Enter phone in international E.164 format, e.g. +441632960960. We will validate on save. On mobile, tap the icon for more info." />
              </div>
            </div>
            <div className="field-error">{errors.telephone}</div>
          </div>

          <div className="form-field">
            <label className="label">Passport issuing country: <span className="req">*</span></label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select name="passportIssuingCountry" className={`form-select ${errors.passportIssuingCountry ? "error" : ""}`} value={local.passportIssuingCountry} onChange={(e) => patchLocal("passportIssuingCountry", e.target.value)}>
                <option value="">Select country</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="info-icon-wrapper">
                <InfoIcon text="Country that issued your passport." />
              </div>
            </div>
            <div className="field-error">{errors.passportIssuingCountry}</div>
          </div>

          <div className="form-field">
            <label className="label">Original citizenship: <span className="req">*</span></label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select name="originalCitizenship" className={`form-select ${errors.originalCitizenship ? "error" : ""}`} value={local.originalCitizenship} onChange={(e) => patchLocal("originalCitizenship", e.target.value)}>
                <option value="">Select country</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="info-icon-wrapper">
                <InfoIcon text="Your country of citizenship. Selecting this will help us prefill your phone country code." />
              </div>
            </div>
            <div className="field-error">{errors.originalCitizenship}</div>
          </div>

          <div className="form-field">
            <label className="label">Marital status: <span className="req">*</span></label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select name="maritalStatus" className={`form-select ${errors.maritalStatus ? "error" : ""}`} value={local.maritalStatus} onChange={(e) => patchLocal("maritalStatus", e.target.value)}>
                <option value="">Select status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
              <div className="info-icon-wrapper">
                <InfoIcon text="Your current marital status." />
              </div>
            </div>
            <div className="field-error">{errors.maritalStatus}</div>
          </div>

          <div className="form-field">
            <label className="label">Father's first name:</label>
            <input name="fatherFirstName" className="form-control" value={local.fatherFirstName} onChange={(e) => patchLocal("fatherFirstName", e.target.value)} />
            <div className="field-error">{errors.fatherFirstName}</div>
          </div>

          <div className="form-field">
            <label className="label">Mother's first name:</label>
            <input name="motherFirstName" className="form-control" value={local.motherFirstName} onChange={(e) => patchLocal("motherFirstName", e.target.value)} />
            <div className="field-error">{errors.motherFirstName}</div>
          </div>

          <div className="form-field">
            <label className="label">E-mail address: <span className="req">*</span></label>
            <input name="email" className={`form-control ${errors.email ? "error" : ""}`} value={local.email} onChange={(e) => patchLocal("email", e.target.value)} />
            <div className="field-error">{errors.email}</div>
          </div>
        </div>
      </div>

      <div className="step-actions">
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
