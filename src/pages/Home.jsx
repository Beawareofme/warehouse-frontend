import { useEffect, useState } from "react";
import { API_BASE, getAuthHeaders } from "../utils/api";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import SearchBar from "../components/SearchBar";

export default function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState(""); // legacy single role string (e.g., "owner" | "merchant")
  const [userRoles, setUserRoles] = useState([]); // new roles array (e.g., ["WAREHOUSE_OWNER"])
  const [warehouses, setWarehouses] = useState([]);
  const [ownerWarehouses, setOwnerWarehouses] = useState([]);

  // ✅ Local state for hero search input
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // 🔁 Backward-compatible read: prefer "auth_user", fallback to old "user"
    const storedUserRaw = localStorage.getItem("auth_user") || localStorage.getItem("user");
    if (storedUserRaw) {
      try {
        const parsed = JSON.parse(storedUserRaw);
        setIsLoggedIn(true);
        setUsername(parsed.name || "");
        setUserRole(parsed.role || "");          // legacy field
        setUserRoles(parsed.roles || []);         // new enum[] field

        const isOwner =
          parsed.role === "owner" ||
          (Array.isArray(parsed.roles) && parsed.roles.includes("WAREHOUSE_OWNER"));

        if (isOwner && parsed.id) {
          fetch(`${API_BASE}/warehouses/owner/${parsed.id}`)
            .then((res) => res.json())
            .then((data) => {
              if (Array.isArray(data)) setOwnerWarehouses(data);
            })
            .catch((err) => console.error("Failed to fetch owner's warehouses:", err));
        }
      } catch {
        setIsLoggedIn(false);
      }
    }

    fetch(`${API_BASE}/warehouses`)
      .then((res) => res.json())
      .then((data) => setWarehouses(data.warehouses || []))
      .catch((err) => console.error("Failed to fetch warehouses:", err));
  }, []);

  const handleBookNow = async (warehouseId, warehouseName) => {
    if (!isLoggedIn) {
      alert("🔒 Please login to book this warehouse");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/book`, {
        method: "POST",
        headers: { ...getAuthHeaders().headers, "Content-Type": "application/json" },
        body: JSON.stringify({ warehouseId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      alert(`✅ Booking confirmed for ${warehouseName}`);
    } catch (err) {
      alert("❌ Booking failed: " + err.message);
    }
  };

  // ✅ Navigate to /search with robust query params
  const goToSearch = () => {
    const q = (searchTerm || "").trim();
    if (!q) return;
    const params = new URLSearchParams();
    params.set("q", q);
    // Future-friendly: if you later add more fields (city/state/etc.), append them here.
    navigate(`/search?${params.toString()}`);
  };

  const isOwnerUser =
    userRole === "owner" || (Array.isArray(userRoles) && userRoles.includes("WAREHOUSE_OWNER"));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white text-gray-900">
      {/* Top Nav */}
      <Navbar />

      {/* Hero with Search */}
      <div className="pt-28 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-800">
          Your Gateway to India’s Smart Warehousing
        </h1>
        <p className="mt-2 text-gray-500 text-lg">
          Discover. Compare. Connect with reliable storage partners.
        </p>

        <div className="mt-6 max-w-xl mx-auto flex bg-white shadow rounded overflow-hidden">
          <input
            type="text"
            placeholder="Enter City, State or ZIP"
            className="flex-1 px-4 py-2 outline-none text-gray-900 placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && goToSearch()}
          />
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6"
            onClick={goToSearch}
            type="button"
          >
            Search
          </button>
        </div>
      </div>

      {/* Owner Warehouses */}
      {isLoggedIn && isOwnerUser && ownerWarehouses.length > 0 && (
        <div className="px-4 max-w-6xl mx-auto mt-12">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Listed Warehouses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {ownerWarehouses.map((w) => (
              <div
                key={w.id}
                className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg transform transition duration-300 hover:scale-105"
              >
                <div className="p-4">
                  <h3 className="text-lg font-bold text-yellow-500 transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:text-yellow-600 group-hover:drop-shadow-lg">
                    {w.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {w.city}, {w.state}
                  </p>
                </div>
                <div className="absolute inset-0 bg-black/90 text-white p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-center">
                  <p className="text-sm mb-2">
                    <span className="font-semibold text-yellow-300">📍 Address:</span> {w.address}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-yellow-300">🏷 Type:</span> {w.type}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-yellow-300">📦 Space:</span>{" "}
                    {w.availableSpace} / {w.totalSpace} sq.ft
                  </p>
                  {w.locationTag && (
                    <p className="text-xs italic mt-1 text-gray-400">Tag: {w.locationTag}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters (placeholder) */}
      <div className="mt-12 px-4 max-w-5xl mx-auto flex flex-wrap gap-4 justify-center">
        <select className="p-2 rounded border shadow-sm">
          <option>Filter by Commodity</option>
          <option>Electronics</option>
          <option>Agriculture</option>
          <option>Construction</option>
        </select>
        <select className="p-2 rounded border shadow-sm">
          <option>Filter by Location</option>
          <option>Delhi</option>
          <option>Mumbai</option>
          <option>Chennai</option>
        </select>
        <select className="p-2 rounded border shadow-sm">
          <option>Filter by Space</option>
          <option>500+ sq.ft</option>
          <option>1000+ sq.ft</option>
        </select>
      </div>

      {/* Top 6 Warehouses */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 max-w-6xl mx-auto pb-16">
        {warehouses.slice(0, 6).map((w) => (
          <div
            key={w._id || w.id}
            className={`relative rounded-xl shadow-lg overflow-hidden bg-white ${
              !isLoggedIn ? "opacity-60" : ""
            }`}
          >
            <img
              src={`https://source.unsplash.com/400x300/?warehouse,storage,${w.name}`}
              alt={w.name}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold">{w.name}</h2>
              <p className="text-sm text-gray-500">
                {w.city}, {w.state}
              </p>
              <p className="text-sm text-gray-500">
                {w.type} – {w.availableSpace} / {w.totalSpace} sq.ft
              </p>
              <button
                className={`mt-3 w-full px-3 py-1 rounded text-white text-sm transition ${
                  isLoggedIn ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
                }`}
                onClick={() => handleBookNow(w._id || w.id, w.name)}
              >
                {isLoggedIn ? "Book Now" : "Login to Book"}
              </button>
            </div>

            {!isLoggedIn && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center text-gray-700 text-sm font-medium">
                🔒 Login Required
              </div>
            )}
          </div>
        ))}
      </div>

      {warehouses.length > 6 && (
        <div className="px-4 max-w-6xl mx-auto -mt-10 pb-16 text-center">
          <Link
            to="/search"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow transition"
          >
            View More →
          </Link>
        </div>
      )}
    </div>
  );
}
