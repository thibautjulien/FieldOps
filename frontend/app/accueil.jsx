import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getMe } from "../src/services/AuthService";

export default function Accueil() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  const router = useRouter();

  useEffect(() => {
    const loadName = async () => {
      try {
        setLoading(true);
        const result = await getMe();
        if (result.success) setName(result.data?.name || "");
      } catch (err) {
        console.error("[FieldOps] Error retrieving name : ", err);
      } finally {
        setLoading(false);
      }
    };

    loadName();
  }, []);

  if (loading) {
    return (
      <SafeAreaView edges={["top"]}>
        <Text>Chargement..</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1">
      <View>
        <Text>Ravi de te revoir, {name}</Text>
      </View>
    </SafeAreaView>
  );
}
