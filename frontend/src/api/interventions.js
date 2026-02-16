import { api, API_BASE_URL } from "./client";
import { getToken } from "../utils/authStorage";

export async function apiCreateIntervention(data) {
  const res = await api.post("/interventions", data);
  return res.data;
}

export async function apiGetInterventionById(id) {
  const res = await api.get(`/interventions/${id}`);
  return res.data;
}

export async function apiGetInterventionPhotos(id) {
  const res = await api.get(`/interventions/${id}/photos`);
  return res.data;
}

export async function apiUpdateInterventionStatus(id, status) {
  const res = await api.put(`/interventions/${id}`, { status });
  return res.data;
}

export async function apiCloseIntervention(id, confirmed = false) {
  const res = await api.put(`/interventions/${id}/close`, { confirmed });
  return res.data;
}

export async function apiAddInterventionPhoto(
  id,
  { type, fileUri, mimeType, fileName },
) {
  const normalizedUri =
    fileUri.startsWith("file://") || fileUri.startsWith("content://")
      ? fileUri
      : `file://${fileUri}`;

  const ext = mimeType?.split("/")?.[1] || "jpg";
  const safeName = fileName || `photo-${Date.now()}.${ext}`;

  const form = new FormData();
  form.append("type", type);
  form.append("photo", {
    uri: normalizedUri,
    name: safeName,
    type: mimeType || "image/jpeg",
  });

  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}/interventions/${id}/photos`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(data?.error || "Photo upload failed");
    err.response = { status: response.status, data };
    throw err;
  }

  return data;
}

export async function apiAddInterventionLog(id, { action }) {
  const res = await api.post(`/interventions/${id}/logs`, { action });
  return res.data;
}
