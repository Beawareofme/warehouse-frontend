import React from "react";

export default function StepHeader({ steps, current }) {
  return (
    <div className="flex flex-wrap items-center gap-6 mb-6">
      {steps.map((s, idx) => {
        const active = idx === current;
        return (
          <div key={s.id} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${active ? "bg-indigo-600 border-indigo-600 text-white" : "bg-gray-800 border-gray-600 text-gray-300"}`}>
              {String(idx+1).padStart(2,"0")}
            </div>
            <div className={`font-semibold ${active ? "text-indigo-300" : "text-gray-300"}`}>{s.title}</div>
          </div>
        );
      })}
    </div>
  );
}
