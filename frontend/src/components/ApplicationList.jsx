import React, { useEffect, useState } from "react";
import { detail } from "../common";
function getAuth() {
  const token = localStorage.getItem("authToken");  
  
  // Add detailed debugging
  console.log("Auth check in UserMaster:", {
    hasToken: !!token,
    tokenValue: token?.substring(0, 20) + "...", // Show first 20 chars for debugging
    timestamp: new Date().toISOString()
  });
  
  return token ? `Bearer ${token}` : "";
}

const ApplicationList = () => {
  const [applications, setApplications] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchApplications = async (p = page, l = limit) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${detail.ip}/v1/api/admin/applications?page=${p}&limit=${l}`,
        {
          method: "GET",
          headers: {
            Authorization: getAuth(),
            // This header is required to bypass the ngrok browser warning page
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (data && data.code === 1) {
        setApplications(data.data.applications || []);
        // try to read total from response; fallback to length
        setTotal(typeof data.data.total === "number" ? data.data.total : (data.data.applications || []).length);
      } else {
        setApplications([]);
        setTotal(0);
        setError(data?.message || "Failed to load");
      }
    } catch (err) {
      setError("Network error");
      setApplications([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const formatDate = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="applications-list" style={{ padding: 16 }}>
      <h2>Applications</h2>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <label>
            Show
            <select value={limit} onChange={handleLimitChange} style={{ marginLeft: 8 }}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            entries
          </label>
        </div>

        <div>
          <button onClick={handlePrev} disabled={page <= 1 || loading} style={{ marginRight: 8 }}>
            Prev
          </button>
          <span>
            Page {page} of {totalPages} ({total} total)
          </span>
          <button onClick={handleNext} disabled={page >= totalPages || loading} style={{ marginLeft: 8 }}>
            Next
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "8px" }}>ID</th>
                <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "8px" }}>First Name</th>
                <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "8px" }}>Last Name</th>
                <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "8px" }}>Purpose</th>
                <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "8px" }}>Specific Purpose</th>
                <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "8px" }}>Email</th>
                <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "8px" }}>DOB</th>
                <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "8px" }}>Telephone</th>
                <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "8px" }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: 12 }}>
                    No records
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id}>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{app.id}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{app.first_name || "-"}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{app.last_name || "-"}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{app.purpose || "-"}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{app.specific_purpose || "-"}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{app.email || "-"}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{app.dob || "-"}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{app.telephone || "-"}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{formatDate(app.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApplicationList;