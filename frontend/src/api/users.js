import { api } from "./client";

export async function apiGetAgents() {
  const res = await api.get("/user/agents");
  return res.data;
}
