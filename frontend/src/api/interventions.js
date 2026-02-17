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
  if (!fileUri) {
    throw new Error("fileUri manquant");
  }

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

  const res = await api.post(`/interventions/${id}/photos`, form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

export async function apiAddInterventionLog(id, { action }) {
  const res = await api.post(`/interventions/${id}/logs`, { action });
  return res.data;
}

export async function apiGetRecentInterventionLogs() {
  const res = await api.get("/interventions/logs/recent");
  return res.data;
}
