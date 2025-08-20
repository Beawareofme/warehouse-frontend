import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import { API_BASE } from "../utils/api";


export default function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Prefilled from query string (supports both ?q=... and ?location=...)
  const [location, setLocation] = useState("");
  const [minSpace, setMinSpace] = useState("");
  const [maxSpace, setMaxSpace] = useState("");

  // Results + UI
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [selected, setSelected] = useState(null); // for quick "View Details" modal

  // Build effective backend params (only if meaningful)
  const effectiveParams = useMemo(() => {
    const q = (location || "").trim();
    const minSqFt = (minSpace || "").trim();
    const maxSqFt = (maxSpace || "").trim();

    const params = {
      ...(q ? { q } : {}),
      ...(minSqFt ? { minSqFt } : {}),
      ...(maxSqFt ? { maxSqFt } : {}),
      // You can add more like sort/page/pageSize later
    };

    const hasAnyFilter =
      (params.q && params.q.length > 0) ||
      params.minSqFt != null && String(params.minSqFt).length > 0 ||
      params.maxSqFt != null && String(params.maxSqFt).length > 0;

    return hasAnyFilter ? params : null;
  }, [location, minSpace, maxSpace]);

  // Fetcher (only runs when effectiveParams is non-null)
  const fetchWarehouses = async () => {
    if (!effectiveParams) {
      setWarehouses([]);
      return;
    }
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      Object.entries(effectiveParams).forEach(([k, v]) => {
        if (v != null && String(v).trim() !== "") qs.set(k, String(v).trim());
      });

      const endpoint = `${API_BASE}/warehouses/search?${qs.toString()}`;
      const res = await fetch(endpoint);
      const data = await res.json();

      // Prefer paginated shape { items, pagination }, fallback to array
      const list = Array.isArray(data) ? data : (data.items || data.warehouses || []);
      setWarehouses(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to fetch search results:", err);
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  // 1) On mount: parse query params -> set inputs (q or legacy location)
  useEffect(() => {
    const qpQ = searchParams.get("q") || "";
    const qpLocation = searchParams.get("location") || "";
    const qpMin = searchParams.get("minSqFt") || searchParams.get("minSpace") || "";
    const qpMax = searchParams.get("maxSqFt") || searchParams.get("maxSpace") || "";
    setLocation(qpQ || qpLocation);
    setMinSpace(qpMin);
    setMaxSpace(qpMax);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount; we keep URL in sync in the next effect

  // 2) When inputs change, keep URL in sync and (conditionally) fetch
  useEffect(() => {
    const qs = new URLSearchParams();
    if (effectiveParams) {
      if (effectiveParams.q) qs.set("q", effectiveParams.q);
      if (effectiveParams.minSqFt) qs.set("minSqFt", effectiveParams.minSqFt);
      if (effectiveParams.maxSqFt) qs.set("maxSqFt", effectiveParams.maxSqFt);
      setSearchParams(qs);
    } else {
      // No meaningful filters: clear params
      setSearchParams(new URLSearchParams());
    }

    fetchWarehouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Fetch is driven by state/effectiveParams; nothing else needed here.
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Search Warehouses</h1>
          <button
            onClick={() => navigate("/")}
            className="text-sm px-3 py-1 rounded bg-gray-900 text-white hover:bg-black transition"
          >
            Home
          </button>
        </div>
        {/* Filters */}
        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 pb-3 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State or ZIP"
              className="w-full pl-10 pr-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <input
            type="number"
            min="0"
            value={minSpace}
            onChange={(e) => setMinSpace(e.target.value)}
            placeholder="Min Space (sq.ft)"
            className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            min="0"
            value={maxSpace}
            onChange={(e) => setMaxSpace(e.target.value)}
            placeholder="Max Space (sq.ft)"
            className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white transition"
          >
            <FaSearch /> Search
          </button>
        </form>
      </div>

      {/* Body: Map + List */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map placeholder (col-span-1) */}
        <div className="bg-white rounded-lg shadow border h-[60vh] flex items-center justify-center">
          <span className="text-gray-400">🗺️ Map coming soon</span>
        </div>

        {/* Results (col-span-2) */}
        <div className="lg:col-span-2">
          {!effectiveParams ? (
            <div className="bg-white rounded-lg shadow border p-6 text-gray-600">
              Use the filters above to search for warehouses.
            </div>
          ) : loading ? (
            <div className="bg-white rounded-lg shadow border p-6">Loading...</div>
          ) : warehouses.length === 0 ? (
            <div className="bg-white rounded-lg shadow border p-6 text-gray-600">
              No warehouses found. Try adjusting filters.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {warehouses.map((w) => (
                <div key={w.id} className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition border">
                  <img
                    src={`https://source.unsplash.com/600x400/?warehouse,storage,${encodeURIComponent(w.name)}`}
                    alt={w.name}
                    className="w-full h-36 object-cover"
                  />
                  <div className="p-4">
                    <div className="font-semibold text-gray-900">{w.name}</div>
                    <div className="text-sm text-gray-500">
                      {w.city}, {w.state} {w.pincode}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      {w.availableSpace} / {w.totalSpace} sq.ft available
                    </div>
                    <div className="mt-1 text-sm">
                      <span className="text-gray-500">Price/sq.ft:</span>{" "}
                      <span className="font-medium text-gray-800">
                        {w.pricePerSqFt != null ? `₹${w.pricePerSqFt}` : "—"}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelected(w)}
                      className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm underline"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Details Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">{selected.name}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-black">✕</button>
            </div>
            <img
              src={`https://source.unsplash.com/800x400/?warehouse,${encodeURIComponent(selected.name)}`}
              alt={selected.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 text-sm text-gray-700 space-y-1">
              <div><span className="text-gray-500">Location:</span> {selected.address}, {selected.city}, {selected.state} {selected.pincode}</div>
              <div><span className="text-gray-500">Type:</span> {selected.type}</div>
              <div><span className="text-gray-500">Space:</span> {selected.availableSpace} / {selected.totalSpace} sq.ft</div>
              <div><span className="text-gray-500">Price/sq.ft:</span> {selected.pricePerSqFt != null ? `₹${selected.pricePerSqFt}` : "—"}</div>
              {selected.locationTag && <div><span className="text-gray-500">Tag:</span> {selected.locationTag}</div>}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <button onClick={() => setSelected(null)} className="px-3 py-1 rounded border">Close</button>
              {/* Later: deep link to a Warehouse Details page or booking flow */}
              <button
                onClick={() => alert("Hook up to booking flow or warehouse details page")}
                className="px-3 py-1 rounded bg-indigo-600 text-white"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
