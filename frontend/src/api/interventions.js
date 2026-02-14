import { api } from "./client";

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

export async function apiAddInterventionPhoto(id, { type, fileUri }) {
  const form = new FormData();

  form.append("type", type);
  form.append("photo", {
    uri: fileUri,
    name: "photo.jpg",
    type: "image/jpeg",
  });

  const res = await api.post(`/interventions/${id}/photos`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

export async function apiAddInterventionLog(id, { action }) {
  const res = await api.post(`/interventions/${id}/logs`, { action });
  return res.data;
}
