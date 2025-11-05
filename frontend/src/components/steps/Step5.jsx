// src/components/steps/Step5.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import "../steps/Step5.css";
import InfoIcon from "../InfoIcon";

/*
  Step5 - Documents upload (enhanced)

  Additional fields implemented:
    - facePhoto (required)
    - passportPage (required)
    - invitationLetter
    - certificateRegistration
    - employmentProposal
    - extractRulebook
    - diplomaCertificate
    - additional1
    - additional2
*/

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "application/pdf", "image/tiff", "image/tif"];

function isAllowed(file) {
  if (!file) return false;
  return ALLOWED.includes(file.type);
}
function humanFileSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${["B","KB","MB","GB"][i]}`;
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => { reader.abort(); reject(new Error("Problem reading file")); };
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function makePreviewFromFileOrData(input) {
  if (!input) return null;
  if (typeof input === "object" && input instanceof File) {
    const isImage = input.type?.startsWith("image/");
    const url = isImage ? URL.createObjectURL(input) : null;
    return { name: input.name, size: input.size, type: input.type, isImage, url, source: "file" };
  }
  if (input.dataUrl) {
    const m = String(input.dataUrl).match(/^data:([^;]+);base64,/i);
    const mime = m ? m[1] : (input.type || "application/octet-stream");
    const isImage = mime.startsWith("image/");
    const url = isImage ? input.dataUrl : null;
    return { name: input.name || "document", size: input.size || 0, type: mime, isImage, url, dataUrl: input.dataUrl, source: "data" };
  }
  return null;
}

export default function Step5({ data = {}, onChange = () => {}, onSave = async () => true, saved = false, showStepper = false }) {
  const KEYS = [
    "facePhoto",
    "passportPage",
    "invitationLetter",
    "certificateRegistration",
    "employmentProposal",
    "extractRulebook",
    "diplomaCertificate",
    "additional1",
    "additional2"
  ];

  const [files, setFiles] = useState(() => {
    const init = {};
    KEYS.forEach((k) => { init[k] = null; });
    return init;
  });

  const [previews, setPreviews] = useState(() => {
    const p = {};
    KEYS.forEach((k) => {
      if (data && data[k] && typeof data[k] === "object" && data[k].dataUrl) {
        p[k] = makePreviewFromFileOrData(data[k]);
      } else {
        p[k] = null;
      }
    });
    return p;
  });

  const [errors, setErrors] = useState(() => {
    const e = {};
    KEYS.forEach((k) => e[k] = "");
    e.global = "";
    return e;
  });

  const [uploading, setUploading] = useState(false);
  const [localSaved, setLocalSaved] = useState(Boolean(saved));
  const [uploadProgress, setUploadProgress] = useState(() => {
    const p = {};
    KEYS.forEach((k) => p[k] = 0);
    return p;
  });

  // ---- FIX: single useRef map for drop DOM nodes (no hooks inside callbacks) ----
  // we'll store direct DOM node references in dropRefs.current[name]
  const dropRefs = useRef({});

  useEffect(() => {
    const p = {};
    KEYS.forEach((k) => {
      if (data && data[k] && typeof data[k] === "object" && data[k].dataUrl) {
        p[k] = makePreviewFromFileOrData(data[k]);
      } else {
        p[k] = previews[k] || null;
      }
    });
    setPreviews(p);
    setLocalSaved(Boolean(saved));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, saved]);

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((p) => { if (p && p.url && p.source === "file") { try { URL.revokeObjectURL(p.url); } catch (e) {} }});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateFileCandidate = (file) => {
    if (!file) return "No file provided";
    if (!isAllowed(file)) return "Invalid file type. Allowed: jpg, png, tif, pdf.";
    if (file.size > MAX_BYTES) return `File too large. Max ${humanFileSize(MAX_BYTES)}.`;
    return "";
  };

  const setFile = useCallback((name, candidate) => {
    setPreviews((prev) => {
      const cur = prev[name];
      if (cur && cur.url && cur.source === "file") {
        try { URL.revokeObjectURL(cur.url); } catch (e) { /* ignore */ }
      }
      return prev;
    });

    const v = candidate ? validateFileCandidate(candidate) : "";
    setErrors((e) => ({ ...e, [name]: v }));
    setFiles((f) => ({ ...f, [name]: candidate || null }));
    if (candidate) {
      const p = makePreviewFromFileOrData(candidate);
      setPreviews((prev) => ({ ...prev, [name]: p }));
    } else {
      setPreviews((prev) => ({ ...prev, [name]: null }));
    }
    onChange({ [name]: candidate || null });
    setLocalSaved(false);
  }, [onChange]);

  function handleInputChange(e, name) {
    const f = e.target.files?.[0] || null;
    setFile(name, f);
    e.target.value = "";
  }

  function makeDndHandlers(name) {
    return {
      onDragOver: (ev) => {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "copy";
        const node = dropRefs.current[name];
        if (node && node.classList) node.classList.add("drag-over");
      },
      onDragLeave: (ev) => {
        ev.preventDefault();
        const node = dropRefs.current[name];
        if (node && node.classList) node.classList.remove("drag-over");
      },
      onDrop: (ev) => {
        ev.preventDefault();
        const node = dropRefs.current[name];
        if (node && node.classList) node.classList.remove("drag-over");
        const file = ev.dataTransfer.files[0];
        if (!file) return;
        setFile(name, file);
      }
    };
  }

  function removeFile(name) {
    setPreviews((p) => {
      const cur = p[name];
      if (cur && cur.url && cur.source === "file") {
        try { URL.revokeObjectURL(cur.url); } catch (e) {}
      }
      return { ...p, [name]: null };
    });
    setFiles((f) => ({ ...f, [name]: null }));
    setErrors((e) => ({ ...e, [name]: "" }));
    onChange({ [name]: null });
    setLocalSaved(false);
  }

  async function uploadFilesToBase64(mapOfFiles, prevPreviews, onProgress) {
    const result = {};
    for (const key of KEYS) {
      const file = mapOfFiles[key];
      const prev = prevPreviews[key];
      if (!file) {
        if (prev && prev.dataUrl) {
          result[key] = { name: prev.name, type: prev.type, size: prev.size, dataUrl: prev.dataUrl };
        } else {
          result[key] = null;
        }
        continue;
      }
      onProgress(key, 6);
      const dataUrl = await fileToDataURL(file);
      onProgress(key, 100);
      result[key] = { name: file.name, type: file.type, size: file.size, dataUrl };
      await new Promise((r) => setTimeout(r, 90));
    }
    return result;
  }

  function validateAllBeforeSave() {
    const e = {};
    if (!files.facePhoto && !(previews.facePhoto && previews.facePhoto.dataUrl)) e.facePhoto = "Face photo is required";
    if (!files.passportPage && !(previews.passportPage && previews.passportPage.dataUrl)) e.passportPage = "Passport page is required";

    KEYS.forEach((k) => {
      const f = files[k];
      if (f) {
        const vv = validateFileCandidate(f);
        if (vv) e[k] = vv;
      }
    });

    setErrors((prev) => ({ ...prev, ...e }));
    return e;
  }

  async function doSave() {
    const v = validateAllBeforeSave();
    if (Object.keys(v).length > 0) {
      const first = Object.keys(v)[0];
      const el = document.querySelector(`[name="${first}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }

    setUploading(true);
    setUploadProgress((p) => {
      const n = {};
      KEYS.forEach((k) => n[k] = 0);
      return n;
    });
    try {
      const uploaded = await uploadFilesToBase64(files, previews, (key, pct) => {
        setUploadProgress((p) => ({ ...p, [key]: pct }));
      });

      const payload = { ...uploaded };

      const ok = await onSave(payload);
      setUploading(false);
      if (ok) {
        const newPreviews = {};
        KEYS.forEach((k) => {
          if (payload[k]) {
            newPreviews[k] = makePreviewFromFileOrData(payload[k]);
          } else {
            newPreviews[k] = previews[k] || null;
          }
        });
        setPreviews(newPreviews);
        const cleared = {};
        KEYS.forEach((k) => cleared[k] = null);
        setFiles(cleared);
        setLocalSaved(true);
        window.dispatchEvent(new CustomEvent("step5:next", { detail: { stepData: payload } }));
        return true;
      } else {
        setErrors((e) => ({ ...e, global: "Server rejected uploaded documents" }));
        return false;
      }
    } catch (err) {
      console.error("Step5 upload error:", err);
      setUploading(false);
      setErrors((e) => ({ ...e, global: "Upload failed. Try again." }));
      return false;
    }
  }

  useEffect(() => {
    function onTrigger() { doSave(); }
    window.addEventListener("triggerSaveStep5", onTrigger);
    return () => window.removeEventListener("triggerSaveStep5", onTrigger);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, previews]);

  function onNextClick() {
    if (!localSaved) {
      doSave().then((ok) => { if (ok) window.dispatchEvent(new CustomEvent("step5:next", { detail: { stepData: previews } })); });
      return;
    }
    window.dispatchEvent(new CustomEvent("step5:next", { detail: { stepData: previews } }));
  }

  function Uploader({ name, label, helper }) {
    const pr = previews[name];
    const err = errors[name];
    const prog = uploading ? uploadProgress[name] || 0 : 0;
    const downloadAvailable = pr && pr.dataUrl;

    return (
      <div className="doc-block">
        <label className="label">{label}</label>

        <div
          ref={(el) => (dropRefs.current[name] = el)}          // <-- assign DOM node here (no hooks inside callback)
          className={`dropzone ${pr ? "has-file" : ""}`}
          {...makeDndHandlers(name)}
          onClick={() => {
            const el = document.querySelector(`input[name="${name}"]`);
            if (el) el.click();
          }}
        >
          <input type="file" name={name} accept=".jpg,.jpeg,.png,.pdf,.tif,.tiff" onChange={(e) => handleInputChange(e, name)} style={{ display: "none" }} />

          {!pr ? (
            <div className="dropzone-empty">
              <div style={{ fontWeight: 700, color: "#213243" }}>{label}</div>
              <div style={{ marginTop: 8, display: "flex", gap: 12, alignItems: "center" }}>
                <div className="file-name">No file selected</div>
                <button type="button" className="btn-select">Select file</button>
              </div>
              <div style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}>{helper}</div>
            </div>
          ) : (
            <div className="dropzone-preview" style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {pr.isImage && pr.url ? (
                <img src={pr.url} alt={pr.name} className="thumb" />
              ) : pr.dataUrl && pr.isImage ? (
                <img src={pr.dataUrl} alt={pr.name} className="thumb" />
              ) : (
                <div className="thumb" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
                  <div style={{ fontSize: 13, color: "#6b7280", textAlign: "center" }}>{pr.name}</div>
                </div>
              )}

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#213243" }}>{pr.name}</div>
                <div style={{ color: "#6b7280", marginTop: 6 }}>{pr.size ? humanFileSize(pr.size) : ""}</div>

                {uploading && <div className="upload-progress" role="progressbar" aria-valuenow={prog} aria-valuemin="0" aria-valuemax="100" style={{ marginTop: 8 }}>
                  <div className="upload-progress-bar" style={{ width: `${prog}%` }} />
                </div>}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {downloadAvailable && (
                  <a className="download-link" href={pr.dataUrl} download={pr.name} style={{ fontSize: 13 }}>Download document</a>
                )}
                <button type="button" className="btn-secondary btn-small" onClick={() => removeFile(name)}>Remove</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Allowed extensions: .pdf, .jpg, .jpeg, .png, .tif — max 5MB</div>
        </div>

        <div className="field-error">{err}</div>
      </div>
    );
  }

  return (
    <section className="step5-root">
      {showStepper && <div className="internal-stepper" />}

      <h2 className="step-title">Documents</h2>

      <div className="step5-sub">Maximum 1 file per document. The total size of all uploaded documents must not exceed 5MB.</div>

      <div className="docs-list">
        <div style={{ display: "flex", gap: 28, alignItems: "flex-start", mb: 12 }}>
          {previews.facePhoto && previews.facePhoto.url && (
            <img src={previews.facePhoto.url} alt="face" style={{ width: 130, height: 130, objectFit: "cover", borderRadius: 6, marginBottom: 8 }} />
          )}
        </div>

        <Uploader name="facePhoto" label="Face photo *" helper="Allowed extensions: jpg, jpeg, png, tif" />
        <Uploader name="passportPage" label="The first page of the travel document/passport *" helper="Allowed extensions: pdf, jpg, jpeg, png, tif" />
        <Uploader name="invitationLetter" label="Invitation letter" helper="Allowed extensions: pdf, jpg, jpeg, png, tif" />
        <Uploader name="certificateRegistration" label="Certificate of registration of a legal entity, business association, sports association or entrepreneur" helper="Allowed extensions: pdf, jpg, jpeg, png, tif" />
        <Uploader name="employmentProposal" label="A proposal for an employment contract or other contract by which a right based on work is realized" helper="Allowed extensions: pdf, jpg, jpeg, png, tif" />
        <Uploader name="extractRulebook" label="Extract from the rulebook on the organization and systematization of jobs, or employer statement" helper="Allowed extensions: pdf, jpg, jpeg, png, tif" />
        <Uploader name="diplomaCertificate" label="Diploma, certificate, i.e. other public document on the acquired professional qualification" helper="Allowed extensions: pdf, jpg, jpeg, png, tif" />
        <Uploader name="additional1" label="Additional document 1" helper="Allowed extensions: pdf, jpg, jpeg, png, tif" />
        <Uploader name="additional2" label="Additional document 2" helper="Allowed extensions: pdf, jpg, jpeg, png, tif" />
      </div>

      {errors.global && <div className="global-errors field-error">{errors.global}</div>}

      <div className="step-actions" style={{ marginTop: 32 }}>
        <button className="btn-secondary" onClick={() => window.dispatchEvent(new Event("step:previous"))}>Previous step</button>

        <div style={{ display: "flex", gap: 12 }}>
          <button className={`btn-save ${localSaved ? "saved" : ""}`} onClick={doSave} disabled={uploading}>
            {uploading ? "Uploading..." : (localSaved ? "Saved" : "Save")}
          </button>

          <button className="btn-primary" onClick={onNextClick} disabled={uploading}>
            Next →
          </button>
        </div>
      </div>
    </section>
  );
}
