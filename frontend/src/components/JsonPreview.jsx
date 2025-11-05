import React from "react";
import Modal from "./Modal";   // ✅ must start with "./"

export default function JsonPreview({ open, onClose, data }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Payload Preview"
      footer={<button onClick={onClose} className="btn">Close</button>}
    >
      <pre style={{whiteSpace:"pre-wrap", maxHeight: "56vh", overflow:"auto"}}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </Modal>
  );
}
