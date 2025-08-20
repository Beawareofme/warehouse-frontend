import React from "react";
import Toggle from "../inputs/Toggle.jsx";
import NumberInput from "../inputs/NumberInput.jsx";
import CheckboxGroup from "../inputs/CheckboxGroup.jsx";
import { securityOptions, amenityOptions } from "../../utils/listingOptions.js";

export default function AmenityChecklist({ value, onChange }) {
  // value shape:
  // { security: {gatedAccess:bool,...}, forklift: {available:bool,isPaid:bool,maxWeightKg:number}, amenities: [ "INTERNET", ... ] }
  const security = value?.security || {};
  const forklift = value?.forklift || { available:false, isPaid:false, maxWeightKg:0 };
  const amenities = value?.amenities || [];

  const update = (patch) => onChange({ security, forklift, amenities, ...patch });

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-semibold text-gray-200 mb-2">Security</div>
        {securityOptions.map(opt => (
          <Toggle
            key={opt.key}
            label={opt.label}
            checked={!!security[opt.key]}
            onChange={(v)=>update({ security: { ...security, [opt.key]: v } })}
          />
        ))}
      </div>

      <div className="border-t border-gray-700 pt-4">
        <div className="text-sm font-semibold text-gray-200 mb-2">Forklift</div>
        <Toggle label="Forklift available" checked={!!forklift.available} onChange={(v)=>update({ forklift:{...forklift, available:v} })}/>
        {forklift.available && (
          <div className="pl-1">
            <Toggle label="Is it paid (not free)?" checked={!!forklift.isPaid} onChange={(v)=>update({ forklift:{...forklift, isPaid:v} })}/>
            <NumberInput label="Max weight (kg)" value={forklift.maxWeightKg || 0} onChange={(n)=>update({ forklift:{...forklift, maxWeightKg:n} })} min={0}/>
          </div>
        )}
      </div>

      <div className="border-t border-gray-700 pt-4">
        <CheckboxGroup label="Other amenities" options={amenityOptions} values={amenities} onChange={(vals)=>update({ amenities: vals })}/>
      </div>
    </div>
  );
}
