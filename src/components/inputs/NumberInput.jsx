import React from "react";

export default function NumberInput({
  label, value, onChange, placeholder, min=0, step="any", required=false
}) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-gray-200">{label}{required && " *"}</span>
      <input
        type="number"
        value={value ?? ""}
        onChange={(e)=>onChange(e.target.value === "" ? "" : Number(e.target.value))}
        min={min}
        step={step}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-800 text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </label>
  );
}
