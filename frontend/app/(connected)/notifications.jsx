import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { getMe, updateMe } from "../../src/services/AuthService";

export default function Accueil() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [userRole, setUserRole] = useState("agent");
  const [email, setEmail] = useState("");

  const loadAccueilData = useCallback(async () => {
    try {
      setLoading(true);

      const meResult = await getMe();
      if (meResult.success) {
        setName(meResult.data?.name || "Inconnu");
        setUserRole(meResult.data?.role || "agent");
        setEmail(meResult.data?.email || "Inconnu");
      }
    } catch (err) {
      console.error(
        "[FieldOps] Error loading accueil data:",
        err?.message || err,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAccueilData();
    }, [loadAccueilData]),
  );

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
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ScrollView
        className="flex-1 bg-[#F4F7FA]"
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-[#1E1E1F] px-5 pt-5 pb-14 rounded-b-3xl">
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="text-sm text-gray-300">Salut {name} !</Text>
              <Text className="mt-2 text-3xl font-bold leading-9 text-white">
                Centre des{"\n"}notifications
              </Text>
            </View>

            <View className="h-12 w-12 items-center justify-center rounded-full bg-[#374151]">
              <Text className="text-lg font-bold text-white">{initial}</Text>
            </View>
          </View>
        </View>

        <View className="px-5 mt-10 mb-10">
          <View
            className="rounded-2xl bg-white p-5 border border-[#E2E8F0]"
            style={{
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.05,
              shadowRadius: 18,
              elevation: 1,
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[#111827] font-semibold text-lg">
                Informations profil
              </Text>
              <Text className="text-sm uppercase mr-1 text-slate-500">
                {userRole}
              </Text>
            </View>

            <View>
              <Text className="text-slate-500 mt-6">
                <Text className="text-[#111827] font-semibold">Nom : </Text>
                {name}
              </Text>

              <Text className="text-slate-500 mt-6">
                <Text className="text-[#111827] font-semibold">Email : </Text>
                {email}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
