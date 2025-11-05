import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { detail } from "../common";

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

/*
Simple User Master component:
- Lists users (POST /getAllUsers)
- View single user (GET /getUserById?id=)
- Create / Update user (POST /createUser)
- Delete user (GET /deleteUser?id= or call with body)
Note: Put your auth token in localStorage under "authToken" or replace getAuth() to return token string.
*/

const API_BASE = `${detail.ip}/v1/api/admin`;

// function getAuth() {
//   return localStorage.getItem("authToken") || ""; // set token in browser storage or paste here
// }

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

export default function UserMaster() {
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page] = useState(1);
  const [limit] = useState(50);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // user object or null
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    id: "",
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    documentType: "",
    country: "",
    documentNumber: "",
    docExpiry: "",
    dob: "",
    gender: "",
    foreignReg: "",
    foreignerNumber: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.warn("UserMaster - No auth token found, redirecting to login");
      navigate("/login");
      return;
    }
    
    // Initial data load
    fetchUsers();
  }, [navigate]); // Added navigate to dependencies

  async function fetchUsers() {
    console.debug("[UserMaster] fetchUsers starting");
    setLoading(true);
    setError("");
    
    const authHeader = getAuth();
    console.debug("[UserMaster] Auth header:", authHeader ? "Present" : "Missing");

    try {
      const res = await fetch(`${API_BASE}/getAllUsers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader
        },
        body: JSON.stringify({ page, limit })
      });
      
      console.debug("[UserMaster] Response:", {
        status: res.status,
        ok: res.ok,
        statusText: res.statusText
      });

      if (!res.ok) throw new Error(`Failed to load users: ${res.status} ${res.statusText}`);
      
      const response = await res.json();
      
      // Check for successful response code
      if (response.code !== 1 || response.status !== "SUCCESS") {
        throw new Error(response.message || "Failed to fetch users");
      }

      // Extract users array from nested structure
      const users = response.data?.users || [];
      console.log("Processed users:", users);
      
      setUsers(users);
    } catch (err) {
      console.error("[UserMaster] Error:", err);
      setError(err.message || "Error fetching users");
    } finally {
      setLoading(false);
    }
  }

  async function openEdit(id) {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/getUserById?id=${encodeURIComponent(id)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuth()
        }
      });
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      const u = data?.data || data?.user || data;
      if (!u) throw new Error("User not returned");
      setForm({
        id: u.id || u._id || "",
        username: u.username || "",
        password: "",
        firstName: u.firstName || u.first_name || "",
        lastName: u.lastName || u.last_name || "",
        documentType: u.documentType || "",
        country: u.country || "",
        documentNumber: u.documentNumber || "",
        docExpiry: u.docExpiry || "",
        dob: u.dob || "",
        gender: u.gender || "",
        foreignReg: u.foreignReg || "",
        foreignerNumber: u.foreignerNumber || ""
      });
      setEditing(u);
      setFormOpen(true);
    } catch (err) {
      setError(err.message || "Could not load user");
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({
      id: "",
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      documentType: "",
      country: "",
      documentNumber: "",
      docExpiry: "",
      dob: "",
      gender: "",
      foreignReg: "",
      foreignerNumber: ""       
    });
    setFormOpen(true);
  }

  async function saveUser(e) {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form };
      // if empty password on edit, remove it so server won't change
      if (!payload.password) delete payload.password;
      const res = await fetch(`${API_BASE}/createUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuth()
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save");
      }
      // success - refresh
      await fetchUsers();
      setFormOpen(false);
    } catch (err) {
      setError(err.message || "Save failed");
    }
  }

  async function deleteUser(id) {
    if (window.confirm("Are you sure?")) {
      setError("");
      try {
        const res = await fetch(`${API_BASE}/deleteUser`, {
          method: "POST", // cURL shows GET with id param; if API expects POST change accordingly
          headers: {
            "Content-Type": "application/json",
            Authorization: getAuth()
          },
          body: JSON.stringify({id })
        });
        if (!res.ok) {
          const text = await res.text();
          
          throw new Error(text || "Delete failed");
        }
        await fetchUsers();
      } catch (err) {
        setError(err.message || "Delete failed");
      }
    }
  }

  function changeField(k, v) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  return (
    <div className="user-master">
      <div className="user-master-header">
        <h3>User Master</h3>
        <div className="user-master-actions">
          <button className="btn-primary" onClick={openCreate}>Add user</button>
          <button className="btn-secondary" onClick={fetchUsers}>Refresh</button>
        </div>
      </div>

      {error && <div className="user-error">{error}</div>}
      {loading ? (
        <div>Loading users...</div>
      ) : (
        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email / Username</th>
                <th>First</th>
                <th>Last</th>
                <th>Country</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan="6">No users</td></tr>
              )}
              {users.map(u => (
                <tr key={u.id || u._id}>
                  <td>{u.id || u._id}</td>
                  <td>{u.username}</td>
                  <td>{u.firstName || u.first_name}</td>
                  <td>{u.lastName || u.last_name}</td>
                  <td>{u.country || u.Country}</td>  {/* Handle both cases */}
                  <td className="actions">
                    <button className="btn-secondary" onClick={() => openEdit(u.id || u._id)}>Edit</button>
                    <button className="btn-primary" onClick={() => deleteUser(u.id || u._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <div className="user-form">
          <form onSubmit={saveUser}>
            <div className="form-row">
              <label>Email / Username</label>
              <input value={form.username} onChange={e => changeField("username", e.target.value)} required />
            </div>

            <div className="form-row">
              <label>Password {(editing ? "(leave empty to keep)" : "")}</label>
              <input type="password" value={form.password} onChange={e => changeField("password", e.target.value)} />
            </div>

            <div className="form-row">
              <label>First name</label>
              <input value={form.firstName} onChange={e => changeField("firstName", e.target.value)} />
            </div>

            <div className="form-row">
              <label>Last name</label>
              <input value={form.lastName} onChange={e => changeField("lastName", e.target.value)} />
            </div>

            <div className="form-grid">
              <div className="form-row">
                <label>Country</label>
                <select 
                  value={form.country} 
                  onChange={e => changeField("country", e.target.value)}
                  className="form-control"
                >
                  <option value="">Select Country</option>
                  {COUNTRIES.map(country => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>Document Type <span className="req">●</span></label>
                <select 
                  value={form.documentType} 
                  onChange={e => changeField("documentType", e.target.value)}
                  className="form-control"
                >
                  <option value="">Select the document type</option>
                  <option value="passport">Passport</option>
                  <option value="idcard">ID card</option>
                </select>
              </div>
              <div className="form-row">
                <label>Document Number</label>
                <input value={form.documentNumber} onChange={e => changeField("documentNumber", e.target.value)} />
              </div>
              <div className="form-row">
                <label>Doc Expiry</label>
                <input type="date" value={form.docExpiry} onChange={e => changeField("docExpiry", e.target.value)} />
              </div>
              <div className="form-row">
                <label>DOB</label>
                <input type="date" value={form.dob} onChange={e => changeField("dob", e.target.value)} />
              </div>
              <div className="form-row">
                <label>Gender</label>
                <select 
                  value={form.gender} 
                  onChange={e => changeField("gender", e.target.value)}
                  className="form-control"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" className="btn-secondary" onClick={() => setFormOpen(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}