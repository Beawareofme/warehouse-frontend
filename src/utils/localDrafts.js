// Lightweight localStorage CRUD so the wizard works before the backend.
// Data saved by user, keyed under "whx_drafts_v1".

const STORAGE_KEY = "whx_drafts_v1";

// Make a simple unique id
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeAll(obj) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

export function createDraft({ ownerId, payload }) {
  const all = readAll();
  const id = uid();
  if (!all[ownerId]) all[ownerId] = {};
  all[ownerId][id] = {
    id,
    ownerId,
    status: "DRAFT",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...payload,
  };
  writeAll(all);
  return all[ownerId][id];
}

export function updateDraft({ ownerId, id, patch }) {
  const all = readAll();
  if (!all[ownerId] || !all[ownerId][id]) throw new Error("Draft not found");
  all[ownerId][id] = {
    ...all[ownerId][id],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  writeAll(all);
  return all[ownerId][id];
}

export function getDraft({ ownerId, id }) {
  const all = readAll();
  return all[ownerId]?.[id] || null;
}

export function listDrafts({ ownerId }) {
  const all = readAll();
  return Object.values(all[ownerId] || {}).sort((a,b)=> (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}
