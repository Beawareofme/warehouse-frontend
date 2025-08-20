import React from "react";
import Toggle from "../inputs/Toggle.jsx";
import HourRangeInput from "../inputs/HourRangeInput.jsx";
import { daysOfWeek } from "../../utils/listingOptions.js";

export default function AvailabilityEditor({ value, onChange }) {
  // value shape:
  // { mode:'SEVEN_DAYS'|'SELECTED', time:'24H'|'LIMITED', range:{open,close}, days?:string[] }
  const v = value || { mode:"SEVEN_DAYS", time:"LIMITED", range:{ open:"09:00", close:"18:00" }, days:[...daysOfWeek] };
  const update = (patch) => onChange({ ...v, ...patch });

  const toggleDay = (day) => {
    const set = new Set(v.days || []);
    if (set.has(day)) set.delete(day); else set.add(day);
    update({ days: Array.from(set) });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-6">
        <Toggle label="Available 7 days a week" checked={v.mode === "SEVEN_DAYS"} onChange={(checked)=>update({ mode: checked ? "SEVEN_DAYS" : "SELECTED", days: checked ? [...daysOfWeek] : v.days })}/>
        <Toggle label="24 hours" checked={v.time === "24H"} onChange={(checked)=>update({ time: checked ? "24H" : "LIMITED" })}/>
      </div>

      {v.mode === "SELECTED" && (
        <div className="flex flex-wrap gap-2">
          {daysOfWeek.map(d => (
            <button key={d}
              type="button"
              onClick={()=>toggleDay(d)}
              className={`px-3 py-1 rounded-full border ${ (v.days||[]).includes(d) ? "bg-indigo-600 border-indigo-600 text-white" : "bg-gray-800 border-gray-600 text-gray-200"}`}
            >{d}</button>
          ))}
        </div>
      )}

      {v.time === "LIMITED" && (
        <HourRangeInput label="Open hours" value={v.range} onChange={(r)=>update({ range: r })}/>
      )}
    </div>
  );
}
