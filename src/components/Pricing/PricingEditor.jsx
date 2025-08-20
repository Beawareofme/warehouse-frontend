import React from "react";
import NumberInput from "../inputs/NumberInput.jsx";

export default function PricingEditor({ value, onChange }) {
  // value shape: { totalSqFt, minSqFt, ratePerSqFtPerMonth }
  const v = value || { totalSqFt: "", minSqFt: "", ratePerSqFtPerMonth: "" };
  const update = (patch) => onChange({ ...v, ...patch });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <NumberInput required label="Total Space Available (sq ft)" value={v.totalSqFt} onChange={(n)=>update({ totalSqFt: n })} min={0}/>
      <NumberInput required label="Minimum Order Quantity (sq ft)" value={v.minSqFt} onChange={(n)=>update({ minSqFt: n })} min={0}/>
      <NumberInput required label="Rate (₹) per sq ft / month" value={v.ratePerSqFtPerMonth} onChange={(n)=>update({ ratePerSqFtPerMonth: n })} min={0} step="0.01"/>
    </div>
  );
}
