import NetInfo from "@react-native-community/netinfo";
import { api } from "../api/client";
import { runSync } from "../sync/sync";

let unsubscribe = null;
let isSyncing = false;

async function isApiHealth() {
  try {
    const res = await api.get("/health");
    return res.status === 200 && res.data?.status === "ok";
  } catch {
    return false;
  }
}

export function startNetworkListener() {
  if (unsubscribe) return;

  unsubscribe = NetInfo.addEventListener(async (state) => {
    const isOnline = Boolean(state.isConnected);
    if (!isOnline) return;

    const healthy = await isApiHealth();
    if (!healthy) return;

    try {
      isSyncing = true;
      await runSync();
    } catch (err) {
      console.error("[FieldOps] runSync failed : ", err);
    } finally {
      isSyncing = false;
    }
  });
}

export function stopNetworkListener() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}
