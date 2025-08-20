import React from "react";

export default function HourRangeInput({ label="Hours", value, onChange }) {
  const open = value?.open || "09:00";
  const close = value?.close || "18:00";
  return (
    <div className="mb-4">
      <div className="text-sm font-medium text-gray-200 mb-2">{label}</div>
      <div className="flex items-center gap-3">
        <input type="time" value={open} onChange={(e)=>onChange({ open: e.target.value, close })} className="bg-gray-800 text-gray-100 border border-gray-600 rounded-md px-2 py-1"/>
        <span className="text-gray-300">to</span>
        <input type="time" value={close} onChange={(e)=>onChange({ open, close: e.target.value })} className="bg-gray-800 text-gray-100 border border-gray-600 rounded-md px-2 py-1"/>
      </div>
    </div>
  );
}
