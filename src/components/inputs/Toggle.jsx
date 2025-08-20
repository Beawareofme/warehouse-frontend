import React from "react";

export default function Toggle({ label, checked=false, onChange }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <button
        type="button"
        onClick={()=>onChange(!checked)}
        className={`w-12 h-6 rounded-full transition relative ${checked ? "bg-indigo-600" : "bg-gray-600"}`}
      >
        <span className={`absolute top-0.5 ${checked ? "left-6" : "left-0.5"} w-5 h-5 bg-white rounded-full transition`} />
      </button>
      <span className="text-gray-200 text-sm">{label}</span>
    </div>
  );
}
