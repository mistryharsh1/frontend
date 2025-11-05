// src/components/Register.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { register as apiRegister } from "../services/api";
import Modal from "./Modal";
import JsonPreview from "./JsonPreview";
import "react-datepicker/dist/react-datepicker.css";
import "./Register.css";
import { useAuth } from "../contexts/AuthContext";

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

const initialState = {
  firstName: "",
  lastName: "",
  documentType: "",
  country: "",
  documentNumber: "",
  docExpiry: null,
  dob: null,
  gender: "",
  foreignReg: "",
  foreignerNumber: "",
  username: "",
  password: "",
  confirmPassword: "",
  terms: false,
  autoRead: false,
  files: []
};

export default function Register() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();

  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [pwdScore, setPwdScore] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // UI modals
  const [previewOpen, setPreviewOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    setPwdScore(calculatePasswordScore(form.password));
  }, [form.password]);

  // --- handlers ---
  function handleChange(e) {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm((s) => ({ ...s, [name]: checked }));
      setErrors((s) => ({ ...s, [name]: undefined }));
    } else if (type === "file") {
      const arr = Array.from(files).slice(0, 2);
      setForm((s) => ({ ...s, files: arr }));
      setErrors((s) => ({ ...s, files: undefined }));
    } else {
      setForm((s) => ({ ...s, [name]: value }));
      setErrors((s) => ({ ...s, [name]: undefined }));
    }
  }

  function handleDateChange(name, date) {
    setForm((s) => ({ ...s, [name]: date }));
    setErrors((s) => ({ ...s, [name]: undefined }));
  }

  function calculatePasswordScore(pwd = "") {
    let score = 0;
    if (!pwd) return 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[\W_]/.test(pwd)) score++;
    return score;
  }

  function passwordValidationMessage(pwd = "") {
    if (!pwd) return "Password is required";
    if (pwd.length < 8 || pwd.length > 20) return "Password must be 8–20 characters";
    if (!/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd)) return "Include upper and lower case letters";
    if (!/\d/.test(pwd)) return "Include at least one number";
    if (!/[\W_]/.test(pwd)) return "Include at least one special character";
    return "";
  }

  // --- validation ---
  function validate() {
    const e = {};

    if (!form.autoRead) {
      e.autoRead = "You must allow automatic reading to fill the form.";
      return e;
    }

    const required = [
      "firstName","lastName","documentType","country",
      "documentNumber","docExpiry","dob","username","password","confirmPassword"
    ];

    required.forEach((k) => {
      const val = form[k];
      if (val === null || val === undefined || (typeof val === "string" && val.trim() === "")) {
        e[k] = "This field is required";
      }
    });

    if (form.dob && !(form.dob instanceof Date)) e.dob = "Please select a valid date of birth";
    if (form.docExpiry && !(form.docExpiry instanceof Date)) e.docExpiry = "Please select a valid document expiry date";

    if (form.username && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.username)) {
      e.username = "Enter a valid email address";
    }

    const pwdErr = passwordValidationMessage(form.password);
    if (pwdErr) e.password = pwdErr;

    if (form.password && form.confirmPassword !== form.password) {
      e.confirmPassword = "Passwords do not match";
    }

    if (form.foreignReg === "yes" && (!form.foreignerNumber || !form.foreignerNumber.trim())) {
      e.foreignerNumber = "Please enter your Foreigner's Registration Number";
    }

    if (!form.terms) e.terms = "You must accept the Terms";

    return e;
  }

  // --- wrapper that talks to real API ---
  async function submitToServer(payload, filesArr = []) {
    // convert dates to yyyy-mm-dd strings for backend
    const toDateStr = (d) => {
      if (!d) return "";
      if (typeof d === "string") return d;
      return d.toISOString().split("T")[0];
    };
    const body = { ...payload, docExpiry: toDateStr(payload.docExpiry), dob: toDateStr(payload.dob) };

    // call real register API
    const res = await apiRegister(body, filesArr);
    return res;
  }

  // --- pretty console log helper + submission ---
  async function onSubmit(ev) {
    ev.preventDefault();
    setSubmitSuccess(false);

    const eobj = validate();
    setErrors(eobj);
    if (Object.keys(eobj).length > 0) {
      const firstField = Object.keys(eobj)[0];
      const el = document.querySelector(`[name="${firstField}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);

    // timestamp divider
    console.log(`%c===== [${new Date().toLocaleTimeString()}] Form Submitted =====`, "color:#6b7280;font-style:italic;");

    // grouped sending payload log
    console.groupCollapsed("%c[REGISTER API] Sending Payload", "color:#1e90ff; font-weight:bold;");
    console.log("Payload (form state):", form);
    if (form.files && form.files.length) {
      console.log(`Attached Files (${form.files.length}):`, form.files.map((f) => ({ name: f.name, size: f.size })));
    }
    console.groupEnd();

    try {
      const res = await submitToServer(form, form.files || []);
      setSubmitting(false);

      const color = res.ok ? "#16a34a" : "#dc2626";
      console.groupCollapsed(`%c[REGISTER API] Response (${res.status})`, `color:${color}; font-weight:bold;`);
      console.log("Full response object:", res);
      if (res.data) console.log("Response data:", res.data);
      console.groupEnd();

      if (!res.ok) {
        console.warn("❌ API returned error:", res);
        const p = res.data || {};
        if (p.field) {
          setErrors((prev) => ({ ...prev, [p.field]: p.message || "Invalid value" }));
          toast.error(p.message || "Validation error");
          return;
        }
        toast.error(p.message || `Server error (${res.status})`);
        return;
      }

      console.log(`%c🎉 Registration successful for: ${form.firstName} ${form.lastName}`, "color:#16a34a; font-weight:bold;");
      toast.success("Registration successful");
      // if backend returned authentication/user info, set auth state
      try {
        if (res.data) setAuth(res.data);
      } catch (e) { /* ignore */ }
      setSubmitSuccess(true);
      setSuccessOpen(true);

      // keep success modal visible briefly, then navigate
      setTimeout(() => {
        setSuccessOpen(false);
        navigate("/");
      }, 900);
    } catch (err) {
      setSubmitting(false);
      console.error("💥 API call failed:", err);
      toast.error(err.message || "Network or unexpected error");
    }
  }

  // small UI helper to render file list
  function renderFiles() {
    if (!form.files || form.files.length === 0) return null;
    return (
      <ul className="file-list">
        {form.files.map((f, i) => (
          <li key={i} className="file-item">
            {f.name} <span className="file-size">({Math.round(f.size / 1024)} KB)</span>
          </li>
        ))}
      </ul>
    );
  }

  const formDisabled = !form.autoRead;
  const dpDateFormat = "dd/MM/yyyy";

  return (
    <div className="register-page">
      <h1 className="page-title">Register an account with a username and password</h1>

      <div className="register-container">
        {/* LEFT: Form */}
        <div className="form-card">
          <form onSubmit={onSubmit} noValidate>
            <div className="doc-block">
              <h3 className="doc-title">Identification document (ID card or passport)</h3>
              <p className="muted">
                Attach a read, scanned or photographed ID card or passport. If you attach your ID card, you must take a
                photo and attach both sides. If you want the data to be automatically read, please attach a clear photo
                of your ID card or passport.
              </p>

              <label className="agree-row">
                <input
                  type="checkbox"
                  name="autoRead"
                  checked={form.autoRead}
                  onChange={handleChange}
                  aria-describedby="autoReadHelp"
                />
                <span id="autoReadHelp">
                  I agree to have the document automatically (machine) read. By having the attached document read, the
                  data on the registration form will be automatically filled in. Otherwise, you must enter the data manually.
                </span>
              </label>

              <div className="attach-row">
                <input
                  type="file"
                  name="files"
                  accept=".png,.jpg,.jpeg"
                  multiple
                  onChange={handleChange}
                  className="form-control file-input"
                />
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
                  <button
                    type="button"
                    className="attach-btn"
                    onClick={() => {
                      const el = document.querySelector('input[type="file"][name="files"]');
                      if (el) el.click();
                    }}
                  >
                    Attach documents
                  </button>

                  <button
                    type="button"
                    className="btn"
                    onClick={() => setPreviewOpen(true)}
                    title="Preview payload JSON"
                    style={{ background: "#f3f4f6", color: "#12324a", padding: "8px 10px", borderRadius: 8, border: "1px solid #e6eef7" }}
                  >
                    Preview JSON
                  </button>
                </div>

                <div className="attach-note">Maximum two documents, 3MB each. Allowed formats: .png, .jpeg, .jpg.</div>
              </div>

              {renderFiles()}
            </div>

            <div className="red-info">● By submitting the document in electronic form, you confirm your identity.</div>

            <div className="form-grid">
              <div className="form-field">
                <label className="label">First name (Use English alphabet only) <span className="req">●</span></label>
                <input className={`form-control ${errors.firstName ? "error" : ""}`} name="firstName" value={form.firstName} onChange={handleChange} disabled={formDisabled} />
                <div className="field-error">{errors.firstName}</div>
              </div>

              <div className="form-field">
                <label className="label">Last name (Use English alphabet only) <span className="req">●</span></label>
                <input className={`form-control ${errors.lastName ? "error" : ""}`} name="lastName" value={form.lastName} onChange={handleChange} disabled={formDisabled} />
                <div className="field-error">{errors.lastName}</div>
              </div>

              <div className="form-field">
                <label className="label">Document type <span className="req">●</span></label>
                <select className={`form-select ${errors.documentType ? "error" : ""}`} name="documentType" value={form.documentType} onChange={handleChange} disabled={formDisabled}>
                  <option value="">Select the document type</option>
                  <option value="passport">Passport</option>
                  <option value="idcard">ID card</option>
                </select>
                <div className="field-error">{errors.documentType}</div>
              </div>

              <div className="form-field">
                <label className="label">Country that issued the passport: <span className="req">●</span></label>
                <select className={`form-select ${errors.country ? "error" : ""}`} name="country" value={form.country} onChange={handleChange} disabled={formDisabled}>
                  <option value="">Choose state</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="field-error">{errors.country}</div>
              </div>

              <div className="form-field">
                <label className="label">Document number <span className="req">●</span></label>
                <input className={`form-control ${errors.documentNumber ? "error" : ""}`} name="documentNumber" value={form.documentNumber} onChange={handleChange} disabled={formDisabled} />
                <div className="field-error">{errors.documentNumber}</div>
              </div>

              <div className="form-field">
                <label className="label">Document expiration date <span className="req">●</span></label>
                <DatePicker className={`form-control ${errors.docExpiry ? "error" : ""}`} selected={form.docExpiry} onChange={(d) => handleDateChange("docExpiry", d)} dateFormat={dpDateFormat} placeholderText="dd/mm/yyyy" disabled={formDisabled} />
                <div className="field-error">{errors.docExpiry}</div>
              </div>

              <div className="form-field">
                <label className="label">Date of birth <span className="req">●</span></label>
                <DatePicker className={`form-control ${errors.dob ? "error" : ""}`} selected={form.dob} onChange={(d) => handleDateChange("dob", d)} dateFormat={dpDateFormat} placeholderText="dd/mm/yyyy" disabled={formDisabled} maxDate={new Date()} showMonthDropdown showYearDropdown dropdownMode="select" />
                <div className="field-error">{errors.dob}</div>
              </div>

              <div className="form-field">
                <label className="label">Gender</label>
                <select className="form-select" name="gender" value={form.gender} onChange={handleChange} disabled={formDisabled}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-field full">
                <label className="label">Do you have a Foreigner's Registration Number? <span className="req">●</span></label>
                <select className={`form-select ${errors.foreignReg ? "error" : ""}`} name="foreignReg" value={form.foreignReg} onChange={handleChange} disabled={formDisabled}>
                  <option value="">Select one of the answers</option>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
                <div className="field-error">{errors.foreignReg}</div>
              </div>

              {form.foreignReg === "yes" && (
                <div className="form-field full">
                  <label className="label">Foreigner's Registration Number <span className="req">●</span></label>
                  <input className={`form-control ${errors.foreignerNumber ? "error" : ""}`} name="foreignerNumber" value={form.foreignerNumber} onChange={handleChange} disabled={formDisabled} />
                  <div className="field-error">{errors.foreignerNumber}</div>
                </div>
              )}
            </div>

            <div className="required-legend"><div className="dot" /> Mark for a required field</div>

            <h4 className="section-heading">Username and password</h4>

            <div className="form-field full">
              <label className="label">User name <span className="req">●</span></label>
              <input className={`form-control ${errors.username ? "error" : ""}`} name="username" placeholder="Enter your email address which will represent your username." value={form.username} onChange={handleChange} disabled={formDisabled} />
              <div className="field-error">{errors.username}</div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label className="label">Password <span className="req">●</span></label>
                <div className="password-wrapper">
                  <input className={`form-control ${errors.password ? "error" : ""}`} type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" value={form.password} onChange={handleChange} disabled={formDisabled} />
                  <button type="button" className="input-eye" onClick={() => setShowPassword((s) => !s)} aria-label="Toggle password visibility">
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                <div className="field-error">{errors.password}</div>
              </div>

              <div className="form-field">
                <label className="label">Password confirmation <span className="req">●</span></label>
                <div className="password-wrapper">
                  <input className={`form-control ${errors.confirmPassword ? "error" : ""}`} type={showConfirm ? "text" : "password"} name="confirmPassword" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} disabled={formDisabled} />
                  <button type="button" className="input-eye" onClick={() => setShowConfirm((s) => !s)} aria-label="Toggle confirm visibility">
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                </div>
                <div className="field-error">{errors.confirmPassword}</div>
              </div>
            </div>

            <div className="pw-note">
              Enter a password that will contain at least eight and at most 20 characters, at least one uppercase and lowercase letter, a number and a special character (!, @, #, $, %, &, *).
            </div>

            <div className="pw-strength">
              <div className="strength-label">Password strength</div>
              <div className="strength-bars">
                {[0,1,2,3,4].map((i) => <div key={i} className={`strength-block ${pwdScore > i ? "on" : ""}`} />)}
              </div>
            </div>

            <label className="terms-legend">
              <input type="checkbox" name="terms" checked={form.terms} onChange={handleChange} disabled={formDisabled} />
              <span>
                I agree with the Terms of Use of the eID Portal and accept the General Conditions and Privacy Policy of providing the Electronic Identification Service and the Electronic Identification Scheme My eID
              </span>
            </label>
            <div className="field-error">{errors.terms}</div>

            <div className="captcha-row" style={{ marginTop: 14 }}>
              <div className="captcha-placeholder">[reCAPTCHA placeholder]</div>
              <div className="form-actions" style={{ marginLeft: "auto" }}>
                <button className="register-btn" type="submit" disabled={submitting || formDisabled}>
                  {submitting ? "Registering..." : "Register →"}
                </button>
              </div>
            </div>

            {submitSuccess && <div className="success-msg" style={{ marginTop: 12 }}>Registration successful (simulated).</div>}
          </form>
        </div>

        {/* RIGHT: Info column */}
        <aside className="info-card">
          <div className="info-inner">
            <div className="steps-line" />
            <div className="step step-1">
              <div className="step-num">1</div>
              <div className="step-body">
                <h4>Register an account with a username and password</h4>
                <ul>
                  <li>You need to attach a clear photo of your passport or ID card for foreign citizens. When attaching the ID card for foreign citizens, you need to attach the back of the ID card first, and then the front.</li>
                  <li>After registration, we will send you an email with a link to confirm your email address. Please confirm your email address within 24 hours.</li>
                  <li>We will review the submitted data and approve your registration request within 48 hours, of which we will notify you via e-mail.</li>
                  <li>Logging in with a username and password allows you to access basic eGovernment services and functionalities.</li>
                </ul>
              </div>
            </div>

            <div className="step muted">
              <div className="step-num small">2</div>
              <div className="step-body">
                <h5>Activate the ConsentID mobile application</h5>
                <p>Signing in with the ConsentID mobile application is a sign-in method with a high level of reliability and allows you access to all services and functionalities of eGovernment.</p>
              </div>
            </div>

            <div className="step muted">
              <div className="step-num small">3</div>
              <div className="step-body">
                <h5>Activate a qualified electronic certificate in the cloud</h5>
                <p>Qualified electronic certificate in the cloud (QES in the cloud) allows you to use your qualified electronic signature remotely. You are not tied to a computer and you can perform signing at a time and place that suits you using the ConsentID application on a mobile device.</p>
              </div>
            </div>

            <div className="ecitizen">
              <h3>Become <span>eCitizen</span></h3>
              <p>By registering on the eID Portal, activating the ConsentID mobile application and a qualified electronic certificate in the cloud, you can quickly and easily use all the services and functionalities of eGovernment.</p>
              <button className="more-btn">More details →</button>
            </div>

            <div className="home-link">↩ To the homepage</div>
          </div>
        </aside>
      </div>

      {/* JSON preview modal */}
      <JsonPreview open={previewOpen} onClose={() => setPreviewOpen(false)} data={form} />

      {/* Success modal */}
      <Modal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Registration received"
        footer={<button onClick={() => { setSuccessOpen(false); navigate("/"); }} className="btn">Continue</button>}
      >
        <div style={{ textAlign: "center", padding: 8 }}>
          <div style={{ fontSize: 42, marginBottom: 10 }}>✅</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{form.firstName} {form.lastName}</div>
          <div style={{ color: "#556b80", marginTop: 8 }}>Your registration was submitted successfully (simulated).</div>
        </div>
      </Modal>
    </div>
  );
}
