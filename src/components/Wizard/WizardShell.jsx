import React, { useEffect, useRef, useState } from "react";
import StepHeader from "./StepHeader.jsx";

export default function WizardShell({
  title="List Your Space",
  steps,                          // [{ id, title, Component }]
  initialForm,
  onSave,                         // async (data) => {}
  onExit,                         // () => void
  onPublish,                      // async () => void
  publishDisabled=false,
  publishLoading=false,
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(initialForm || {});
  const [saving, setSaving] = useState(false);
  const mounted = useRef(false);

  useEffect(() => { setForm(initialForm || {}); }, [initialForm]);

  // autosave when step changes
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    doSave("autosave");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  // warn if leaving with unsaved state
  useEffect(() => {
    const beforeUnload = (e) => { if (saving) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [saving]);

  const doSave = async (reason="manual") => {
    setSaving(true);
    try { await onSave(form, reason); } finally { setSaving(false); }
  };

  const Current = steps[stepIndex].Component;

  const next = async () => { await doSave("next"); setStepIndex(i => Math.min(i+1, steps.length-1)); };
  const back = async () => { await doSave("back"); setStepIndex(i => Math.max(i-1, 0)); };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <StepHeader steps={steps} current={stepIndex} />
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow">
          <Current value={form} onChange={setForm} />
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-gray-400">{saving ? "Saving…" : "Saved"}</div>
            <div className="flex flex-wrap gap-3">
              <button onClick={back} disabled={stepIndex===0} className="rounded-lg px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50">Back</button>
              <button onClick={onExit} className="rounded-lg px-4 py-2 bg-gray-700 hover:bg-gray-600">Save & Exit</button>
              <button onClick={next} className="rounded-lg px-4 py-2 bg-indigo-600 hover:bg-indigo-500">Next</button>
              {onPublish && (
                <button
                  onClick={onPublish}
                  disabled={publishDisabled || publishLoading}
                  className={`rounded-lg px-4 py-2 ${publishDisabled ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-500"} text-white`}
                  title={publishDisabled ? "Complete required fields to publish" : "Publish listing"}
                >
                  {publishLoading ? "Publishing…" : "Publish"}
                </button>
              )}
            </div>
          </div>
          {publishDisabled && (
            <div className="text-xs text-gray-400 mt-2">
              Publishing requires: Address, Total Space, Rate (₹/sqft/month).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
