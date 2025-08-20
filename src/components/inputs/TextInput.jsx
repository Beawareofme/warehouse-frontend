import React from "react";

export default function TextInput({
  label, value, onChange, placeholder, required=false, name, className=""
}) {
  return (
    <label className={`block mb-4 ${className}`}>
      <span className="block text-sm font-medium text-gray-200">{label}{required && " *"}</span>
      <input
        name={name}
        type="text"
        value={value || ""}
        onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-800 text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </label>
  );
}
