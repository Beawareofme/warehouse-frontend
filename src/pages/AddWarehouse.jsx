// src/pages/AddWarehouse.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary.jsx";
import WizardShell from "../components/Wizard/WizardShell.jsx";
import TextInput from "../components/inputs/TextInput.jsx";
import Select from "../components/inputs/Select.jsx";
import Toggle from "../components/inputs/Toggle.jsx";
import AmenityChecklist from "../components/Amenities/AmenityChecklist.jsx";
import UseChecklist from "../components/ApprovedUses/UseChecklist.jsx";
import PricingEditor from "../components/Pricing/PricingEditor.jsx";
import AvailabilityEditor from "../components/Availability/AvailabilityEditor.jsx";

import { facilityUseOptions, qualificationOptions, addOnServices } from "../utils/listingOptions.js";
import { createListingDraft, getListing, updateListing } from "../utils/api.js";
import { useToast } from "../context/ToastContext.jsx";

/* ---------- Shared section shell ---------- */
function Section({ title, children }) {
  return (
    <section className="mb-6">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      {children}
    </section>
  );
}

/* ---------- Step components ---------- */
function StepFacilityAddress({ value, onChange }) {
  const v = value.address || {};
  const update = (patch) => onChange({ ...value, address: { ...v, ...patch } });
  return (
    <Section title="Facility Address">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput label="Address" value={v.addressLine1} onChange={(x)=>update({ addressLine1: x })} required />
        <TextInput label="City" value={v.city} onChange={(x)=>update({ city: x })} />
        <TextInput label="State" value={v.state} onChange={(x)=>update({ state: x })} />
        <TextInput label="Zip / Postal Code" value={v.zip} onChange={(x)=>update({ zip: x })} />
      </div>
    </Section>
  );
}

function StepUse({ value, onChange }) {
  const v = value.use || { facilityUse:"", otherUseNotes:"" };
  const update = (patch) => onChange({ ...value, use: { ...v, ...patch } });
  return (
    <Section title="What can the facility be used for?">
      <Select label="Primary use" value={v.facilityUse} onChange={(x)=>update({ facilityUse: x })} options={facilityUseOptions} />
      {v.facilityUse === "OTHER" && (
        <TextInput label="Describe other use" value={v.otherUseNotes} onChange={(x)=>update({ otherUseNotes: x })}/>
      )}
    </Section>
  );
}

function StepAmenities({ value, onChange }) {
  const v = value.amenities || {};
  return (
    <Section title="Facility Amenities">
      <AmenityChecklist value={v} onChange={(x)=>onChange({ ...value, amenities: x })}/>
    </Section>
  );
}

function StepApprovedUses({ value, onChange }) {
  const v = value.approvals || {};
  return (
    <Section title="Approved uses & labour">
      <UseChecklist value={v} onChange={(x)=>onChange({ ...value, approvals: x })}/>
    </Section>
  );
}

function StepQualifications({ value, onChange }) {
  const v = value.qualifications || [];
  const toggle = (val) => {
    const set = new Set(v);
    if (set.has(val)) set.delete(val); else set.add(val);
    onChange({ ...value, qualifications: Array.from(set) });
  };
  return (
    <Section title="Facility qualifications">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {qualificationOptions.map(q => (
          <label key={q.value} className="inline-flex items-center gap-2 bg-gray-800 border border-gray-600 rounded-md px-3 py-2">
            <input type="checkbox" className="accent-indigo-600" checked={v.includes(q.value)} onChange={()=>toggle(q.value)} />
            <span className="text-gray-100">{q.label}</span>
          </label>
        ))}
      </div>
    </Section>
  );
}

function StepPricing({ value, onChange }) {
  const v = value.pricing || {};
  return (
    <Section title="Listing size & rental rates">
      <PricingEditor value={v} onChange={(x)=>onChange({ ...value, pricing: x })}/>
    </Section>
  );
}

function StepHours({ value, onChange }) {
  const v = value.hours || {};
  return (
    <Section title="Facility Hours">
      <AvailabilityEditor value={v} onChange={(x)=>onChange({ ...value, hours: x })}/>
    </Section>
  );
}

function RateRow({ label, service, value, onChange }) {
  const s = value?.[service.key] || { available:false, ratePerHour: 0 };
  const update = (patch) => onChange({ ...value, [service.key]: { ...s, ...patch } });
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="text-gray-200">{label}</div>
      <div className="flex items-center gap-3">
        <Toggle label="Available" checked={!!s.available} onChange={(v)=>update({ available: v })}/>
        {s.available && (
          <input
            type="number"
            min="0"
            step="1"
            value={s.ratePerHour || ""}
            onChange={(e)=>update({ ratePerHour: Number(e.target.value) })}
            className="w-36 bg-gray-800 text-gray-100 border border-gray-600 rounded-md px-2 py-1"
            placeholder="₹/hour"
          />
        )}
      </div>
    </div>
  );
}

function StepServices({ value, onChange }) {
  const v = value.services || { inbound:{}, outbound:{}, valueAdd:{} };
  const updateGroup = (group, patch) => onChange({ ...value, services: { ...v, [group]: { ...v[group], ...patch } } });
  const { inbound, outbound, valueAdd } = addOnServices;
  return (
    <Section title="Add-on services (₹/hour)">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="font-semibold text-gray-300 mb-2">Inbound</div>
          {inbound.map(s => <RateRow key={s.key} label={s.label} service={s} value={v.inbound} onChange={(patch)=>updateGroup("inbound", patch)} />)}
        </div>
        <div>
          <div className="font-semibold text-gray-300 mb-2">Outbound</div>
          {outbound.map(s => <RateRow key={s.key} label={s.label} service={s} value={v.outbound} onChange={(patch)=>updateGroup("outbound", patch)} />)}
        </div>
        <div>
          <div className="font-semibold text-gray-300 mb-2">Value Add</div>
          {valueAdd.map(s => <RateRow key={s.key} label={s.label} service={s} value={v.valueAdd} onChange={(patch)=>updateGroup("valueAdd", patch)} />)}
        </div>
      </div>
    </Section>
  );
}

/* ---------- Helpers ---------- */
function cleanDraftPatch(payload) {
  const out = {};

  if (payload.status) out.status = payload.status;

  if (payload.address) {
    const a = {};
    const src = payload.address || {};
    if (src.addressLine1 && src.addressLine1.trim()) a.addressLine1 = src.addressLine1.trim();
    if (src.city && src.city.trim()) a.city = src.city.trim();
    if (src.state && src.state.trim()) a.state = src.state.trim();
    if (src.zip && src.zip.trim()) a.zip = src.zip.trim();
    if (Object.keys(a).length) out.address = a;
  }

  if (payload.use) {
    const u = {};
    const src = payload.use || {};
    if (src.facilityUse) u.facilityUse = src.facilityUse;
    if (src.otherUseNotes && src.otherUseNotes.trim()) u.otherUseNotes = src.otherUseNotes.trim();
    if (Object.keys(u).length) out.use = u;
  }

  if (payload.amenities) {
    const am = JSON.parse(JSON.stringify(payload.amenities));
    if (am?.forklift && (am.forklift.maxWeightKg === "" || am.forklift.maxWeightKg == null)) {
      delete am.forklift.maxWeightKg;
    }
    out.amenities = am;
  }

  if (payload.approvals) out.approvals = payload.approvals;

  if (Array.isArray(payload.qualifications)) out.qualifications = payload.qualifications;

  if (payload.pricing) {
    const p = {};
    const src = payload.pricing || {};
    if (src.totalSqFt !== "" && src.totalSqFt != null) p.totalSqFt = Number(src.totalSqFt);
    if (src.minSqFt !== "" && src.minSqFt != null) p.minSqFt = Number(src.minSqFt);
    if (src.ratePerSqFtPerMonth !== "" && src.ratePerSqFtPerMonth != null)
      p.ratePerSqFtPerMonth = Number(src.ratePerSqFtPerMonth);
    if (Object.keys(p).length) out.pricing = p;
  }

  if (payload.hours) {
    const h = {};
    const src = payload.hours || {};
    if (src.mode) h.mode = src.mode;
    if (src.time) h.time = src.time;
    if (src.range && src.range.open && src.range.close) h.range = { open: src.range.open, close: src.range.close };
    if (Array.isArray(src.days) && src.days.length) h.days = src.days;
    if (Object.keys(h).length) out.hours = h;
  }

  if (payload.services) out.services = payload.services;

  if (payload.title !== undefined) out.title = payload.title;
  if (payload.description !== undefined) out.description = payload.description;

  return out;
}

function getPublishErrors(form) {
  const errs = [];
  const addr = form?.address || {};
  const price = form?.pricing || {};
  const hasAddress = !!(addr.addressLine1 && addr.addressLine1.trim());
  if (!hasAddress) errs.push("Address is required");
  const total = Number(price.totalSqFt);
  const rate = Number(price.ratePerSqFtPerMonth);
  if (!total || total <= 0) errs.push("Total Space must be a positive number");
  if (!rate || rate <= 0) errs.push("Rate (₹/sqft/month) must be a positive number");
  const min = Number(price.minSqFt);
  if (min && total && min > total) errs.push("Minimum Order Quantity cannot exceed Total Space");
  return errs;
}

/* ---------- Page ---------- */
function AddWarehouseInner() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const defaultForm = useMemo(() => ({
    status: "DRAFT",
    address: { addressLine1:"", city:"", state:"", zip:"" },
    use: { facilityUse: "", otherUseNotes:"" },
    amenities: { security:{}, forklift:{ available:false, isPaid:false, maxWeightKg:0 }, amenities:[] },
    approvals: { labourPolicy:{ renterLaborAllowed:true, ownerLaborAvailable:false, includedInRent:false, hourlyRate:0 }, approvedUses:[] },
    qualifications: [],
    pricing: { totalSqFt:"", minSqFt:"", ratePerSqFtPerMonth:"" },
    hours: { mode:"SEVEN_DAYS", time:"LIMITED", range:{ open:"09:00", close:"18:00" }, days:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },
    services: { inbound:{}, outbound:{}, valueAdd:{} },
  }), []);

  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(isEdit);
  const [publishing, setPublishing] = useState(false);

  // Fetch only when editing
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const data = await getListing(id);
        setForm({ ...defaultForm, ...data });
      } catch (e) {
        console.error("Load listing failed:", e);
        if (e?.status === 401 || e?.status === 403) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
        } else {
          toast.error(e?.message || "Listing not found");
          navigate("/owner/dashboard");
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  // Create draft lazily (first save/publish). Include minimal address to satisfy schema.
  const ensureListingId = async () => {
    if (isEdit) return id;
    const created = await createListingDraft({
      status: "DRAFT",
      title: `Draft ${new Date().toLocaleString()}`,
      address: { addressLine1: "Draft placeholder", city: "", state: "", zip: "" } // <-- required by Prisma
    });
    navigate(`/dashboard/owner/listings/${created.id}/edit`, { replace: true });
    return String(created.id);
  };

  const steps = [
    { id:"addr", title:"Facility Address", Component: (p)=><StepFacilityAddress {...p} /> },
    { id:"use", title:"Use of Facility", Component: (p)=><StepUse {...p} /> },
    { id:"amen", title:"Amenities", Component: (p)=><StepAmenities {...p} /> },
    { id:"approvals", title:"Approved Uses", Component: (p)=><StepApprovedUses {...p} /> },
    { id:"quals", title:"Qualifications", Component: (p)=><StepQualifications {...p} /> },
    { id:"pricing", title:"Listing & Rates", Component: (p)=><StepPricing {...p} /> },
    { id:"hours", title:"Facility Hours", Component: (p)=><StepHours {...p} /> },
    { id:"services", title:"Add-on Services", Component: (p)=><StepServices {...p} /> },
  ];

  const handleSave = async (currentForm, reason) => {
    setForm(currentForm);
    try {
      const listingId = await ensureListingId();
      const patch = cleanDraftPatch(currentForm);
      if (Object.keys(patch).length === 0) {
        if (reason === "manual") toast.info("Nothing to save");
        return;
      }
      await updateListing(listingId, patch);
      if (reason === "manual") toast.success("Saved");
    } catch (e) {
      console.error("Save failed:", e);
      toast.error(e?.message || "Save failed");
    }
  };

  const handleExit = () => {
    toast.info("Saved draft");
    navigate("/owner/dashboard");
  };

  const publishErrors = getPublishErrors(form || {});
  const publishDisabled = (publishErrors.length > 0);

  const handlePublish = async () => {
    if (publishDisabled) return;
    setPublishing(true);
    try {
      const listingId = await ensureListingId();
      const payload = cleanDraftPatch(form || {});
      payload.status = "PUBLISHED";
      await updateListing(listingId, payload);
      toast.success("Listing published");
      navigate("/owner/dashboard");
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-gray-300">Loading…</div>
      </div>
    );
  }

  return (
    <WizardShell
      title="List Your Warehouse"
      steps={steps}
      initialForm={form}
      onSave={handleSave}
      onExit={handleExit}
      onPublish={handlePublish}
      publishDisabled={publishDisabled}
      publishLoading={publishing}
    />
  );
}

export default function AddWarehouse() {
  return (
    <ErrorBoundary>
      <AddWarehouseInner />
    </ErrorBoundary>
  );
}
