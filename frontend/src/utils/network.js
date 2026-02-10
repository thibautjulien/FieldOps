import NetInfo from "@react-native-community/netinfo";
import { runSync } from "../sync/sync";

let unsubscribe = null;

export function startNetworkListener() {
  if (unsubscribe) return;

  unsubscribe = NetInfo.addEventListener((state) => {
    const isOnline = Boolean(state.isConnected);
    if (isOnline) {
      runSync().catch(console.error);
    }
  });
}

export function stopNetworkListener() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}
