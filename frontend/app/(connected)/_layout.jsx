import { useEffect, useState } from "react";
import { View } from "react-native";
import { Slot } from "expo-router";
import BottomMenu from "../../src/components/BottomMenu";
import { getMe } from "../../src/services/AuthService";

export default function ConnectedLayout() {
  const [role, setRole] = useState("");

  useEffect(() => {
    const loadRole = async () => {
      const me = await getMe();
      if (me.success) setRole(me.data?.role || "");
    };

    loadRole();
  }, []);

  return (
    <View className="flex-1 bg-[#F4F7FA]">
      <View className="flex-1 pb-24">
        <Slot />
      </View>
      <BottomMenu isAdmin={role === "admin"} />
    </View>
  );
}
