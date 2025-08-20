import { useEffect, useState } from "react";
import { FaUserShield, FaTrash, FaSignOutAlt, FaSearch, FaMoon, FaSun } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE, getAuthHeaders } from "../utils/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [token] = useState(localStorage.getItem("token"));
  // ⬇️ Prefer new "auth_user", fallback to legacy "user"
  const [user] = useState(() => {
    const raw = localStorage.getItem("auth_user") || localStorage.getItem("user");
    return raw ? JSON.parse(raw) : {};
  });
  const [users, setUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState(() => {});

  // Confirm modal function
  const openConfirmModal = (message, onConfirm) => {
    setModalMessage(message);
    setOnConfirmAction(() => onConfirm);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMessage("");
    setOnConfirmAction(() => {});
  };

  const handleConfirm = () => {
    if (onConfirmAction) onConfirmAction();
    closeModal();
  };

  // ✅ Role check that supports legacy single role and new roles[]
  const isAdmin =
    user?.role === "admin" ||
    (Array.isArray(user?.roles) && user.roles.includes("ADMIN"));

  useEffect(() => {
    if (!token || !isAdmin) {
      navigate("/login/admin");
      return;
    }
    fetchAll();
  }, [navigate, token, isAdmin]);

  const parseRes = async (res) => {
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Error ${res.status}: ${errText}`);
    }
    return res.json();
  };

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const auth = getAuthHeaders();
      const [uRes, wRes, bRes] = await Promise.all([
        fetch(`${API_BASE}/admin/users`, auth),
        fetch(`${API_BASE}/admin/warehouses`, auth),
        fetch(`${API_BASE}/admin/bookings`, auth),
      ]);
      setUsers(await parseRes(uRes));
      setWarehouses(await parseRes(wRes));
      setBookings(await parseRes(bRes));
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const toggleApprove = (id, approve) => {
    openConfirmModal(`${approve ? "Approve" : "Disable"} this warehouse?`, async () => {
      await fetch(`${API_BASE}/admin/warehouses/${id}/approve`, {
        method: "PUT",
        headers: { ...getAuthHeaders().headers, "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !!approve }),
      });
      fetchAll();
    });
  };

  const deleteWarehouse = (id) => {
    openConfirmModal("Delete this warehouse permanently?", async () => {
      await fetch(`${API_BASE}/admin/warehouses/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders().headers,
      });
      fetchAll();
    });
  };

  const promoteToAdmin = (id) => {
    openConfirmModal("Promote this user to admin?", async () => {
      await fetch(`${API_BASE}/admin/users/${id}/role`, {
        method: "PUT",
        headers: { ...getAuthHeaders().headers, "Content-Type": "application/json" },
        body: JSON.stringify({ role: "admin" }),
      });
      fetchAll();
    });
  };

  const deleteUser = (id) => {
    openConfirmModal("Delete this user permanently?", async () => {
      await fetch(`${API_BASE}/admin/users/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders().headers,
      });
      fetchAll();
    });
  };

  const logout = () => {
    // ✅ Clear both new and legacy keys
    localStorage.removeItem("auth_user");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login/admin");
  };

  const filteredData = (list) =>
    list.filter((item) => JSON.stringify(item).toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-gray-500">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
        <button onClick={fetchAll} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">Retry</button>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"} min-h-screen`}>
      {/* Top Bar */}
      <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-indigo-600 text-white shadow-lg z-10">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="hidden sm:block">Hello, {user.name}</span>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded hover:bg-indigo-500">
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button onClick={logout} className="p-2 rounded hover:bg-red-500">
            <FaSignOutAlt />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mt-4 gap-4">
        {["users", "warehouses", "bookings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg transition ${activeTab === tab ? "bg-indigo-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex justify-center mt-4">
        <div className="flex items-center bg-white rounded shadow px-3 py-2 w-80">
          <FaSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto p-6 grid gap-4">
        {activeTab === "users" &&
          filteredData(users).map((u) => (
            <div key={u.id} className="p-4 bg-white rounded shadow hover:shadow-lg flex justify-between items-center">
              <div>
                <div className="font-semibold">{u.name} <span className="text-xs text-gray-500">({u.role})</span></div>
                <div className="text-xs text-gray-400 cursor-pointer" onClick={() => navigator.clipboard.writeText(u.email)}>
                  {u.email}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => promoteToAdmin(u.id)} className="p-2 bg-yellow-400 rounded hover:bg-yellow-300"><FaUserShield /></button>
                <button onClick={() => deleteUser(u.id)} className="p-2 bg-red-500 text-white rounded hover:bg-red-400"><FaTrash /></button>
              </div>
            </div>
          ))}

        {activeTab === "warehouses" &&
          filteredData(warehouses).map((w) => (
            <div key={w.id} className="p-4 bg-white rounded shadow hover:shadow-lg flex justify-between items-center">
              <div>
                <div className="font-semibold">{w.name} <span className="text-xs text-gray-500">({w.city})</span></div>
                <div className="text-xs">Owner: {w.owner?.name || "—"}</div>
                <span className={`px-2 py-1 rounded text-xs ${w.isApproved ? "bg-green-200 text-green-800" : "bg-orange-200 text-orange-800"}`}>
                  {w.isApproved ? "Approved" : "Pending"}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleApprove(w.id, !w.isApproved)} className="p-2 bg-green-500 text-white rounded hover:bg-green-400">
                  {w.isApproved ? "Disable" : "Approve"}
                </button>
                <button onClick={() => deleteWarehouse(w.id)} className="p-2 bg-red-500 text-white rounded hover:bg-red-400">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}

        {activeTab === "bookings" &&
          filteredData(bookings).map((b) => (
            <div key={b.id} className="p-4 bg-white rounded shadow hover:shadow-lg flex justify-between items-center">
              <div>
                <div className="font-semibold">{b.warehouse?.name || "—"}</div>
                <div className="text-xs">Merchant: {b.merchant?.name || "—"}</div>
                <span className="text-xs">{b.status}</span>
              </div>
              <div className="text-xs text-gray-500">{new Date(b.createdAt).toLocaleString()}</div>
            </div>
          ))}
      </div>

      {/* Glassmorphic Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm z-50">
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-6 max-w-sm w-full shadow-lg animate-fadeIn">
            <p className="mb-6 text-center text-lg font-medium">{modalMessage}</p>
            <div className="flex justify-end gap-4">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
              <button onClick={handleConfirm} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
