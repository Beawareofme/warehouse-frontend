import React from "react";
import CheckboxGroup from "../inputs/CheckboxGroup.jsx";
import Toggle from "../inputs/Toggle.jsx";
import NumberInput from "../inputs/NumberInput.jsx";
import { approvedUseOptions } from "../../utils/listingOptions.js";

export default function UseChecklist({ value, onChange }) {
  // value shape:
  // { labourPolicy: { renterLaborAllowed, ownerLaborAvailable, includedInRent, hourlyRate }, approvedUses: [] }
  const labourPolicy = value?.labourPolicy || { renterLaborAllowed:true, ownerLaborAvailable:false, includedInRent:false, hourlyRate:0 };
  const approvedUses = value?.approvedUses || [];

  const update = (patch) => onChange({ labourPolicy, approvedUses, ...patch });

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-semibold text-gray-200 mb-2">Labour Policy</div>
        <Toggle label="Renter can use their own labour" checked={!!labourPolicy.renterLaborAllowed} onChange={(v)=>update({ labourPolicy:{...labourPolicy, renterLaborAllowed:v} })}/>
        <Toggle label="Owner-provided labour available" checked={!!labourPolicy.ownerLaborAvailable} onChange={(v)=>update({ labourPolicy:{...labourPolicy, ownerLaborAvailable:v} })}/>
        {labourPolicy.ownerLaborAvailable && (
          <div className="pl-1">
            <Toggle label="Included in rent" checked={!!labourPolicy.includedInRent} onChange={(v)=>update({ labourPolicy:{...labourPolicy, includedInRent:v} })}/>
            {!labourPolicy.includedInRent && (
              <NumberInput label="Hourly rate (₹/hour)" value={labourPolicy.hourlyRate || 0} onChange={(n)=>update({ labourPolicy:{...labourPolicy, hourlyRate:n} })}/>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-700 pt-4">
        <CheckboxGroup label="Approved uses" options={approvedUseOptions} values={approvedUses} onChange={(vals)=>update({ approvedUses: vals })}/>
      </div>
    </div>
  );
}
