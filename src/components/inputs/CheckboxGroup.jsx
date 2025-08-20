import React from "react";

export default function CheckboxGroup({ label, options, values=[], onChange }) {
  const toggle = (val) => {
    const set = new Set(values);
    if (set.has(val)) set.delete(val); else set.add(val);
    onChange(Array.from(set));
  };
  return (
    <div className="mb-4">
      <div className="text-sm font-medium text-gray-200 mb-2">{label}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {options.map(opt => (
          <label key={opt.value} className="inline-flex items-center gap-2 bg-gray-800 border border-gray-600 rounded-md px-3 py-2">
            <input
              type="checkbox"
              className="accent-indigo-600"
              checked={values.includes(opt.value)}
              onChange={()=>toggle(opt.value)}
            />
            <span className="text-gray-100">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

