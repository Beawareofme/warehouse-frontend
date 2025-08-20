import {
  FaWarehouse,
  FaBoxOpen,
  FaBookOpen,
  FaSignOutAlt,
  FaChartBar,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { API_BASE, getAuthHeaders } from "../utils/api";

export default function MerchantDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [showWarehouses, setShowWarehouses] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [minSpace, setMinSpace] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // ✅ Load merchant bookings (wrapped in useCallback to satisfy exhaustive-deps)
  const fetchBookings = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(
        `${API_BASE}/bookings/merchant/${user.id}`,
        getAuthHeaders()
      );
      if (!res.ok) throw new Error("Failed to load bookings");
      const data = await res.json();
      setBookings(data || []);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    }
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings, token]);

  // ✅ Load warehouses
  const handleStartBooking = async () => {
    setShowWarehouses(true);
    try {
      const res = await fetch(`${API_BASE}/warehouses`);
      if (!res.ok) throw new Error("Failed to fetch warehouses");
      const data = await res.json();
      setWarehouses(Array.isArray(data) ? data : data.warehouses || []);
    } catch (err) {
      console.error("Warehouse fetch error", err);
      alert("Failed to load warehouses");
    }
  };

  // ✅ Make booking request
  const handleBook = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: { ...getAuthHeaders().headers, "Content-Type": "application/json" },
        body: JSON.stringify({ warehouseId: id }),
      });

      const contentType = res.headers.get("content-type");
      if (!res.ok) {
        let errorMsg = "Unknown error";
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          errorMsg = errorData.error || errorMsg;
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      if (data && data.id) {
        alert("✅ Booking request sent!");
      }

      setShowWarehouses(false);
      fetchBookings();
    } catch (err) {
      alert("Booking failed: " + err.message);
    }
  };

  // ✅ Filtered warehouses
  const filteredWarehouses = warehouses.filter((w) => {
    const name = (w.name || "").toLowerCase();
    const city = (w.city || "").toLowerCase();
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      city.includes(searchTerm.toLowerCase());

    const matchesCity = filterCity ? city === filterCity.toLowerCase() : true;
    const matchesSpace = minSpace ? (w.availableSpace || 0) >= Number(minSpace) : true;
    const matchesPrice = maxPrice ? (w.price || 0) <= Number(maxPrice) : true;

    return matchesSearch && matchesCity && matchesSpace && matchesPrice;
  });

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-gray-900 text-white overflow-hidden">
      <div className="relative z-10 p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-300 drop-shadow-sm">Welcome, Merchant</h1>
          <p className="text-gray-300 mt-2">Manage your bookings, track status & connect with warehouse owners.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Book Warehouse */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 shadow-xl border border-cyan-500/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-cyan-300">Book Warehouse</h2>
              <FaWarehouse className="text-cyan-300 text-xl" />
            </div>
            <p className="text-gray-300 mb-4">Search & reserve space for your inventory.</p>
            <button
              onClick={handleStartBooking}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded-md transition"
            >
              Start Booking
            </button>
          </div>

          {/* My Bookings */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 shadow-xl border border-yellow-500/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-yellow-400">My Bookings</h2>
              <FaBookOpen className="text-yellow-400 text-xl" />
            </div>
            <ul className="text-gray-200 space-y-2 text-sm max-h-40 overflow-auto">
              {bookings.length === 0 ? (
                <li>No bookings yet.</li>
              ) : (
                bookings.map((b) => (
                  <li
                    key={b.id}
                    onClick={() => navigate(`/merchant/bookings/${b.id}`)}
                    className="cursor-pointer hover:underline"
                  >
                    📦 {b.warehouse?.name || "Unknown"} —{" "}
                    <span
                      className={
                        b.status === "accepted"
                          ? "text-green-400"
                          : b.status === "pending"
                          ? "text-yellow-300"
                          : "text-red-400"
                      }
                    >
                      {b.status}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Booking Summary */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 shadow-xl border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-purple-300">Booking Summary</h2>
              <FaChartBar className="text-purple-300 text-xl" />
            </div>
            <div className="text-sm text-gray-200">
              <p>Total Bookings: {bookings.length}</p>
              <p>Active: {bookings.filter((b) => b.status === "accepted").length}</p>
              <p>Cancelled: {bookings.filter((b) => b.status === "rejected").length}</p>
            </div>
          </div>

          {/* Recommended */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 shadow-xl border border-indigo-400/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-indigo-300">Recommended Warehouses</h2>
              <FaBoxOpen className="text-indigo-300 text-xl" />
            </div>
            <ul className="text-sm text-gray-200 space-y-2">
              <li>🏭 Noida Cold Hub - 95% Rating</li>
              <li>🏭 Ahmedabad Agro Vault - 93%</li>
              <li>🏭 Lucknow Steel Point - 91%</li>
            </ul>
          </div>

          {/* Logout */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 shadow-xl border border-red-400/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-red-400">Logout</h2>
              <FaSignOutAlt className="text-red-400 text-xl" />
            </div>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Warehouse Booking Modal */}
        {showWarehouses && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
            <div className="bg-gray-900 p-6 rounded-xl max-w-2xl w-full border border-gray-700 overflow-auto max-h-[85vh]">
              {/* Search & Filters */}
              <div className="flex flex-wrap gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Search by name or city"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-600"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="w-28 bg-gray-800 text-white px-3 py-2 rounded border border-gray-600"
                />
                <input
                  type="number"
                  placeholder="Min Space"
                  value={minSpace}
                  onChange={(e) => setMinSpace(e.target.value)}
                  className="w-28 bg-gray-800 text-white px-3 py-2 rounded border border-gray-600"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-28 bg-gray-800 text-white px-3 py-2 rounded border border-gray-600"
                />
              </div>

              {/* Warehouse List */}
              <ul className="space-y-4">
                {filteredWarehouses.map((w) => (
                  <li
                    key={w.id}
                    className="bg-white/10 p-4 rounded-lg text-white shadow-md hover:bg-white/20 transition"
                  >
                    {w.imageUrl && (
                      <img
                        src={w.imageUrl}
                        alt={w.name}
                        className="w-full h-40 object-cover rounded mb-3"
                      />
                    )}
                    <h4 className="text-lg font-bold">{w.name}</h4>
                    <p className="text-sm text-gray-400">
                      {(w.city || "")}{w.state ? `, ${w.state}` : ""}
                    </p>
                    <p className="text-sm">Available Space: {w.availableSpace}</p>
                    {w.price && <p className="text-sm">Price: ₹{w.price}</p>}
                    {Array.isArray(w.amenities) && w.amenities.length > 0 && (
                      <p className="text-xs text-gray-300 mt-1">
                        Amenities: {w.amenities.join(", ")}
                      </p>
                    )}
                    <button
                      onClick={() => handleBook(w.id)}
                      className="mt-3 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-sm rounded"
                    >
                      Book Now
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowWarehouses(false)}
                className="mt-4 text-sm text-gray-400 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
