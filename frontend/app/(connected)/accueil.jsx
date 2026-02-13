import { useEffect, useState } from "react";
import { View, Text, TextInput, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMe } from "../../src/services/AuthService";

export default function Accueil() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

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
      <SafeAreaView
        edges={["top"]}
        className="flex-1 items-center justify-center bg-[#1E1E1F]"
      >
        <Text className="text-white">Chargement...</Text>
      </SafeAreaView>
    );
  }

  const initial = (name?.trim()?.[0] || "A").toUpperCase();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#1E1E1F]">
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View className="flex-1 bg-[#F4F7FA]">
        <View className="bg-[#1E1E1F] px-5 pt-5 pb-14 rounded-b-3xl">
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="text-sm text-gray-300">Salut {name} !</Text>
              <Text className="mt-2 text-3xl font-bold leading-9 text-white">
                Gère tes{"\n"}interventions
              </Text>
            </View>

            <View className="h-12 w-12 items-center justify-center rounded-full bg-[#374151]">
              <Text className="text-lg font-bold text-white">{initial}</Text>
            </View>
          </View>
        </View>

        <View className="-mt-8 px-5">
          <View className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm">
            <TextInput
              placeholder="Recherche (bientôt)"
              editable={false}
              className="text-base text-gray-400"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
