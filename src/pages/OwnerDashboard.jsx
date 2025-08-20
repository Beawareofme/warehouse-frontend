import {
  FaPlusCircle,
  FaBoxes,
  FaMapMarkedAlt,
  FaSignOutAlt,
  FaWarehouse,
  FaTrashAlt,
  FaEdit,
  FaHome,
  FaBookOpen,
  FaEnvelope
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { API_BASE, getAuthHeaders } from "../utils/api";
import { useNavigate } from "react-router-dom";

import { listMyListings } from "../utils/api.js";

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [totalSpace, setTotalSpace] = useState(0);
  const [availableSpace, setAvailableSpace] = useState(0);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [ownerBookings, setOwnerBookings] = useState([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageBooking, setMessageBooking] = useState(null);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // For editing images
  const [newImages, setNewImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  // ✅ Server draft state
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    const fetchWarehouses = async () => {
      const rawUser =
        localStorage.getItem("auth_user") || localStorage.getItem("user");
      const user = rawUser ? JSON.parse(rawUser) : null;
      if (!user) return;

      try {
        const res = await fetch(`${API_BASE}/warehouses/owner/${user.id}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setWarehouses(data);
          const total = data.reduce((acc, w) => acc + (w.totalSpace || 0), 0);
          const available = data.reduce((acc, w) => acc + (w.availableSpace || 0), 0);
          setTotalSpace(total);
          setAvailableSpace(available);
        }
      } catch (err) {
        console.error("Error fetching warehouses", err);
      }
    };

    const fetchOwnerBookings = async () => {
      const rawUser =
        localStorage.getItem("auth_user") || localStorage.getItem("user");
      const user = rawUser ? JSON.parse(rawUser) : null;
      if (!user || (user.role !== "owner" && !(user.roles||[]).includes("WAREHOUSE_OWNER"))) return;

      try {
        const res = await fetch(`${API_BASE}/bookings/owner/${user.id}`, getAuthHeaders());
        const data = await res.json();
        setOwnerBookings(data || []);
      } catch (err) {
        console.error("Failed to fetch owner bookings", err);
      }
    };

    // ✅ NEW: load server drafts for this owner (Phase 2)
    const fetchDrafts = async () => {
      try {
        const arr = await listMyListings(); // uses auth token internally
        setDrafts(arr);
      } catch (e) {
        console.warn("Failed to load server drafts", e);
      }
    };

    fetchWarehouses();
    fetchOwnerBookings();
    fetchDrafts();
  }, []);

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}`, {
        method: "PUT",
        headers: getAuthHeaders().headers, // includes JSON content-type + Authorization
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update");

      alert(`Booking ${status} ✅`);
      const rawUser =
        localStorage.getItem("auth_user") || localStorage.getItem("user");
      const user = rawUser ? JSON.parse(rawUser) : null;
      const bookingsRes = await fetch(`${API_BASE}/bookings/owner/${user.id}`, getAuthHeaders());
      const updated = await bookingsRes.json();
      setOwnerBookings(updated);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleDeleteWarehouse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this warehouse?")) return;

    try {
      const res = await fetch(`${API_BASE}/warehouses/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders().headers,
      });

      if (!res.ok) throw new Error("Delete failed");
      setWarehouses((prev) => prev.filter((w) => w.id !== id));
      alert("✅ Deleted successfully");
    } catch (err) {
      alert("❌ Delete failed");
    }
  };

  const sendMessageToMerchant = async () => {
    if (!messageBooking || !messageContent.trim()) return;
    setSendingMessage(true);
    try {
      const res = await fetch(`${API_BASE}/bookings/message`, {
        method: "POST",
        headers: { ...getAuthHeaders().headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: messageBooking.id,
          merchantEmail: messageBooking.merchant.email,
          message: messageContent,
        }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      alert("📧 Message sent successfully!");
      setShowMessageModal(false);
      setMessageContent("");
      setMessageBooking(null);
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const submitEditForm = async (e) => {
    e.preventDefault();
    // NOTE: For multipart/form-data we must NOT set Content-Type manually.
    const formData = new FormData(); // ✅ fixed typo
    formData.append("name", editingWarehouse.name);
    formData.append("address", editingWarehouse.address);
    formData.append("city", editingWarehouse.city);
    formData.append("state", editingWarehouse.state);
    formData.append("price", editingWarehouse.price || 0);
    formData.append("description", editingWarehouse.description || "");
    formData.append("totalSpace", editingWarehouse.totalSpace);
    formData.append("availableSpace", editingWarehouse.availableSpace);

    newImages.forEach((img) => formData.append("images", img));

    try {
      // Build auth-only headers (no JSON content-type)
      const auth = getAuthHeaders().headers || {};
      const onlyAuth = auth.Authorization ? { Authorization: auth.Authorization } : {};

      const res = await fetch(`${API_BASE}/warehouses/${editingWarehouse.id}`, {
        method: "PUT",
        headers: onlyAuth,
        body: formData,
      });
      if (!res.ok) throw new Error("Update failed");
      alert("✅ Warehouse updated successfully");
      setEditingWarehouse(null);
      setPreviewImages([]);
      setNewImages([]);
      window.location.reload();
    } catch (err) {
      alert("❌ Failed to update: " + err.message);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 left-0 w-full h-full z-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 animate-pulse" />

      <div className="relative z-10 p-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 p-4 rounded-xl border border-yellow-400 text-center">
            <h3 className="text-lg font-bold text-yellow-400">Total Warehouses</h3>
            <p className="text-3xl">{warehouses.length}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-green-400 text-center">
            <h3 className="text-lg font-bold text-green-400">Total Bookings</h3>
            <p className="text-3xl">{ownerBookings.length}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-blue-400 text-center">
            <h3 className="text-lg font-bold text-blue-400">Occupancy Rate</h3>
            <p className="text-3xl">
              {totalSpace ? `${Math.round(((totalSpace - availableSpace) / totalSpace) * 100)}%` : "0%"}
            </p>
          </div>
        </div>

        {/* ✅ Draft Listings (server) */}
        <div className="bg-white/10 p-6 rounded-xl border border-purple-400 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-purple-300">Draft Listings</h2>
            <button
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white"
              onClick={() => navigate("/dashboard/owner/add")}
            >
              <FaPlusCircle /> New Listing
            </button>
          </div>

          {drafts.length === 0 ? (
            <div className="text-gray-400">No drafts yet. Click “New Listing” to start.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drafts.map((d) => (
                <div key={d.id} className="rounded-xl bg-white/5 border border-gray-700 p-4">
                  <div className="font-semibold">
                    {(d.address?.city || d.address?.addressLine1 || "Untitled")}
                    {d.pricing?.totalSqFt ? ` — ${d.pricing.totalSqFt} sq ft` : ""}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {d.address?.addressLine1 ? `${d.address.addressLine1}, ` : ""}
                    {d.address?.city || ""}{d.address?.state ? `, ${d.address.state}` : ""} {d.address?.zip || ""}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Updated {d.updatedAt ? new Date(d.updatedAt).toLocaleString() : "just now"}
                  </div>
                  {d.pricing?.ratePerSqFtPerMonth != null && d.pricing?.ratePerSqFtPerMonth !== "" && (
                    <div className="text-sm text-gray-300 mt-2">
                      ₹ {d.pricing.ratePerSqFtPerMonth} / sq ft / month
                    </div>
                  )}
                  <div className="flex justify-end mt-4">
                    <button
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
                      onClick={() => navigate(`/dashboard/owner/listings/${d.id}/edit`)}
                    >
                      Continue setup
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Requests */}
        <div className="bg-white/10 p-6 rounded-xl border border-cyan-400">
          <h2 className="text-xl font-bold mb-4 text-cyan-300">Booking Requests</h2>
          <ul className="space-y-3">
            {ownerBookings.map((b) => (
              <li key={b.id} className="bg-white/5 p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{b.warehouse.name}</p>
                    <p className="text-sm text-gray-400">Merchant: {b.merchant.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-2 py-1 rounded"
                      onClick={() => {
                        setMessageBooking(b);
                        setShowMessageModal(true);
                      }}
                    >
                      <FaEnvelope />
                    </button>
                    {b.status === "pending" && (
                      <>
                        <button
                          className="text-green-400"
                          onClick={() => updateBookingStatus(b.id, "accepted")}
                        >
                          ✅
                        </button>
                        <button
                          className="text-red-400"
                          onClick={() => updateBookingStatus(b.id, "rejected")}
                        >
                          ❌
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-lg">
            <h3 className="text-xl font-bold mb-3">Message Merchant</h3>
            <textarea
              rows={4}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="w-full p-2 bg-white/20 text-white rounded"
              placeholder="Type your message..."
            />
            <div className="flex justify-end mt-4 gap-2">
              <button
                className="px-4 py-2 bg-gray-500 rounded"
                onClick={() => setShowMessageModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-yellow-500 text-black rounded"
                disabled={sendingMessage}
                onClick={sendMessageToMerchant}
              >
                {sendingMessage ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Warehouse Modal */}
      {editingWarehouse && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-lg text-white">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">Edit Warehouse</h2>
            <form onSubmit={submitEditForm} className="space-y-3">
              <input
                value={editingWarehouse.name}
                onChange={(e) => setEditingWarehouse({ ...editingWarehouse, name: e.target.value })}
                className="w-full p-2 bg-white/20 rounded"
                placeholder="Name"
              />
              <textarea
                value={editingWarehouse.description || ""}
                onChange={(e) => setEditingWarehouse({ ...editingWarehouse, description: e.target.value })}
                className="w-full p-2 bg-white/20 rounded"
                placeholder="Description"
              />
              <input
                type="number"
                value={editingWarehouse.price || ""}
                onChange={(e) => setEditingWarehouse({ ...editingWarehouse, price: e.target.value })}
                className="w-full p-2 bg-white/20 rounded"
                placeholder="Price"
              />
              <input type="file" multiple onChange={handleImageChange} className="w-full text-sm" />
              <div className="flex gap-2 mt-2 overflow-auto">
                {previewImages.map((src, i) => (
                  <img key={i} src={src} alt="preview" className="w-16 h-16 rounded object-cover" />
                ))}
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditingWarehouse(null)} className="px-4 py-1 bg-gray-600">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1 bg-yellow-500 text-black">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
