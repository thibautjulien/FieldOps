import "../global.css";
import { Stack } from "expo-router";

import { useEffect } from "react";
import { initSchema } from "../src/db/schema";
import {
  startNetworkListener,
  stopNetworkListener,
} from "../src/utils/network";

export default function RootLayout() {
  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      try {
        await initSchema();
        if (mounted) startNetworkListener();
      } catch (err) {
        console.error("[FieldOps] initSchema failed:", err);
      }
    };

    boot();

    return () => {
      mounted = false;
      stopNetworkListener();
    };
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Index" }} />
      <Stack.Screen name="login" options={{ title: "Connexion" }} />
      <Stack.Screen name="accueil" options={{ title: "accueil" }} />
    </Stack>
  );
}
