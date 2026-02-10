import { api } from "./client";

export async function apiCreateIntervention(data) {
  const res = await api.post("/interventions", data);
  return res.data;
}

export async function apiAddInterventionPhoto(id, { type, fileUri }) {
  const form = new FormData();

  form.append("type", type);
  form.append("photo", {
    uri: fileUri,
    name: "photo.jpg",
    type: "image/jpg",
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
