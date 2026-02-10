import "../global.css";
import { Stack } from "expo-router";

import { useEffect } from "react";
import { initSchema } from "../src/db/schema";
import { startNetworkListener } from "../src/utils/network";

export default function RootLayout() {
  useEffect(() => {
    initSchema().catch(console.error);
    startNetworkListener();
  });

  return <Stack />;
}
