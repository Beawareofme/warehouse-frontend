// src/pages/SearchResults.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Navbar from "../components/NavBar";
import SearchBar from "../components/SearchBar";
import { searchWarehouses } from "../utils/api";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function SearchResults() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  // ✅ Read params
  const q = params.get("q") || "";
  const city = params.get("city") || "";
  const state = params.get("state") || "";
  const zip = params.get("zip") || "";
  const minSqFt = params.get("minSqFt") || "";

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Only pass non-empty filters to the API
        const filters = {};
        if (q) filters.q = q;
        if (city) filters.city = city;
        if (state) filters.state = state;
        if (zip) filters.zip = zip;
        if (minSqFt) filters.minSqFt = minSqFt;

        const data = await searchWarehouses(filters);
        setResults(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Search failed:", e);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [q, city, state, zip, minSqFt]);

  const defaultCenter = useMemo(() => {
    const withGeo = results.find(
      (w) => typeof w.latitude === "number" && typeof w.longitude === "number"
    );
    return withGeo ? [withGeo.latitude, withGeo.longitude] : [20.5937, 78.9629]; // India center
  }, [results]);

  const activeFilters = [
    q && { label: `Query: ${q}` },
    city && { label: `City: ${city}` },
    state && { label: `State: ${state}` },
    zip && { label: `ZIP: ${zip}` },
    minSqFt && { label: `Min SqFt: ${minSqFt}` },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white">
      <Navbar />

      {/* Top search bar */}
      <div className="py-6 px-4">
        <SearchBar initial={{ q, city, state, zip, minSqFt }} />
      </div>

      <div className="px-4 pb-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map */}
          <div className="h-[60vh] bg-white/10 border border-white/10 rounded-xl overflow-hidden">
            <MapContainer center={defaultCenter} zoom={5} className="h-full w-full">
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {results
                .filter(
                  (w) =>
                    typeof w.latitude === "number" &&
                    typeof w.longitude === "number"
                )
                .map((w) => (
                  <Marker key={w.id || w._id} position={[w.latitude, w.longitude]}>
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold">{w.name}</div>
                        <div className="text-gray-700">
                          {w.city}, {w.state}
                        </div>
                        {w.pricePerSqFt != null && (
                          <div className="mt-1">₹{w.pricePerSqFt}/sq.ft</div>
                        )}
                        <button
                          className="mt-2 w-full rounded bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-3 py-1"
                          onClick={() => navigate(`/warehouse/${w.id || w._id}`)}
                        >
                          View Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>

          {/* List */}
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">
                {loading ? "Searching..." : `${results.length} results`}
              </h2>
              <div className="flex flex-wrap gap-2">
                {activeFilters.length > 0 ? (
                  activeFilters.map((f, i) => (
                    <span
                      key={i}
                      className="text-xs bg-white/10 border border-white/10 rounded-full px-2 py-1"
                    >
                      {f.label}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-white/60">All locations</span>
                )}
              </div>
            </div>

            {results.length === 0 && !loading && (
              <div className="bg-white/10 border border-white/10 rounded-xl p-6">
                <p>No warehouses found. Try a different query.</p>
              </div>
            )}

            {results.map((w) => (
              <div
                key={w.id || w._id}
                className="bg-white/10 border border-white/10 rounded-xl p-4 flex gap-4 hover:bg-white/15 transition"
              >
                <img
                  src={w.imageUrl || "/default-warehouse.jpg"}
                  alt={w.name}
                  className="h-28 w-40 object-cover rounded-md flex-none"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-400">
                        {w.name}
                      </h3>
                      <p className="text-sm text-white/80">
                        {w.city}, {w.state} {w.pincode ? `• ${w.pincode}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white/75">
                        {w.availableSpace != null
                          ? `${w.availableSpace.toLocaleString()} sq.ft`
                          : "—"}
                      </div>
                      <div className="text-sm">
                        {w.pricePerSqFt != null ? (
                          <span className="font-semibold text-yellow-300">
                            ₹{w.pricePerSqFt}/sq.ft
                          </span>
                        ) : (
                          <span className="text-white/60">Price: N/A</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => navigate(`/warehouse/${w.id || w._id}`)}
                      className="rounded bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-2 font-semibold"
                    >
                      View Details
                    </button>
                    {/* Add Quick Book CTA here later if you like */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
