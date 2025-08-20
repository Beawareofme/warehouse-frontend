// src/components/SearchBar.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar({ initial = {} }) {
  const navigate = useNavigate();

  // Supported fields
  const [q, setQ] = useState(initial.q || initial.city || initial.state || initial.zip || "");
  const [minSqFt, setMinSqFt] = useState(initial.minSqFt || "");

  // Keep inputs in sync if URL changes (e.g., user hits back)
  useEffect(() => {
    setQ(initial.q || initial.city || initial.state || initial.zip || "");
    setMinSqFt(initial.minSqFt || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.q, initial.city, initial.state, initial.zip, initial.minSqFt]);

  const submit = (e) => {
    e?.preventDefault?.();
    const qs = new URLSearchParams();
    if (q && q.trim()) qs.set("q", q.trim());
    if (minSqFt) qs.set("minSqFt", String(minSqFt));
    navigate(`/search${qs.toString() ? `?${qs.toString()}` : ""}`);
  };

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-3xl mx-auto flex gap-2 bg-white rounded-lg shadow p-2"
    >
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="City, State or ZIP"
        className="flex-1 px-4 py-2 outline-none text-gray-900 placeholder-gray-500"
      />
      <input
        type="number"
        min="0"
        value={minSqFt}
        onChange={(e) => setMinSqFt(e.target.value)}
        placeholder="Min sq.ft"
        className="w-32 px-3 py-2 outline-none border rounded-md"
      />
      <button
        type="submit"
        className="px-5 py-2 rounded-md bg-yellow-500 hover:bg-yellow-600 text-black font-semibold transition"
      >
        Search
      </button>
    </form>
  );
}
