import { useCallback, useState } from "react";
import { View, Text, TextInput, StatusBar, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { getMe } from "../../src/services/AuthService";
import { DashboardSummary } from "../../src/components/DashboardSummary";
import TodayInterventionsList from "../../src/components/TodayInterventionsList";
import TodayInterventionsListClos from "../../src/components/TodayInterventionsListClos";
import { api } from "../../src/api/client";
import { queryAll } from "../../src/db/db";

export default function Accueil() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [userRole, setUserRole] = useState("agent");
  const [interventions, setInterventions] = useState([]);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const loadAccueilData = useCallback(async () => {
    try {
      setLoading(true);

      const meResult = await getMe();
      if (meResult.success) {
        setName(meResult.data?.name || "");
        setUserRole(meResult.data?.role || "agent");
      }

      const interventionsRes = await api.get("/interventions");
      setInterventions(interventionsRes.data || []);

      const pendingRows = await queryAll(
        "SELECT COUNT(*) AS count FROM sync_queue WHERE sync_status = ?",
        ["PENDING"],
      );
      const count = pendingRows?.[0]?.count ?? 0;
      setPendingSyncCount(Number(count));
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
        <DashboardSummary
          userRole={userRole}
          interventions={interventions}
          pendingSyncCount={pendingSyncCount}
        />
        <TodayInterventionsList interventions={interventions} />
        <TodayInterventionsListClos interventions={interventions} />
      </ScrollView>
    </SafeAreaView>
  );
}
