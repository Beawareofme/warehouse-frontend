import React from "react";

export default function Select({ label, value, onChange, options, required=false }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-gray-200">{label}{required && " *"}</span>
      <select
        value={value || ""}
        onChange={(e)=>onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-800 text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="" disabled>— Select —</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
