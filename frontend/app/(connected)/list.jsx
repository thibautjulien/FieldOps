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
import { useFocusEffect, useRouter } from "expo-router";
import { getMe } from "../../src/services/AuthService";
import { api } from "../../src/api/client";

export default function List() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [userRole, setUserRole] = useState("agent");
  const [interventions, setInterventions] = useState([]);

  const router = useRouter();
  const initial = (name?.trim()?.[0] || "A").toUpperCase();

  function normalizeStatus(status = "") {
    return String(status).trim().toUpperCase();
  }

  function isInNextDays(dateStr, days = 7) {
    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + days);

    const d = new Date(dateStr);
    return d >= now && d <= end;
  }

  function formatDateHour(dateStr) {
    return new Date(dateStr).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const loadListData = useCallback(async () => {
    try {
      setLoading(true);

      const meResult = await getMe();
      if (meResult.success) {
        setName(meResult.data?.name || "");
        setUserRole((meResult.data?.role || "agent").toLowerCase());
      }

      const res = await api.get("/interventions");
      setInterventions(res.data || []);
    } catch (err) {
      console.error("[FieldOps] Error loading list data:", err?.message || err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadListData();
    }, [loadListData]),
  );

  const listData = interventions
    .filter((it) => isInNextDays(it.scheduled_at, 7))
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#1E1E1F]">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View className="flex-1 bg-[#F4F7FA]">
        <View className="bg-[#1E1E1F] px-5 pt-5 pb-14 rounded-b-3xl">
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="text-sm text-gray-300">Salut {name} !</Text>
              <Text className="mt-2 text-3xl font-bold leading-9 text-white">
                Liste des{"\n"}interventions
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

        <View className="mt-6 px-5 pb-2">
          <Text className="text-base font-semibold text-[#111827]">
            {userRole === "admin"
              ? "Toutes les interventions (7 jours)"
              : "Mes interventions (7 jours)"}
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <Text className="text-slate-500">Chargement...</Text>
          ) : listData.length === 0 ? (
            <Text className="text-slate-500">
              Aucune intervention sur la période.
            </Text>
          ) : (
            listData.map((it) => (
              <TouchableOpacity
                key={String(it.id)}
                activeOpacity={0.85}
                onPress={() => router.push(`/interventions/${it.id}`)}
                className="mb-3 rounded-2xl bg-white border border-[#E2E8F0] px-4 py-4"
              >
                <View className="flex-row justify-between items-start">
                  <Text
                    className="text-[#111827] font-semibold flex-1 pr-3"
                    numberOfLines={1}
                  >
                    {it.title}
                  </Text>
                  <Text className="text-xs text-slate-500">
                    {normalizeStatus(it.status)}
                  </Text>
                </View>

                <Text className="text-slate-500 mt-2">
                  {formatDateHour(it.scheduled_at)}
                </Text>
                <Text className="text-slate-500 mt-1">
                  {it.city_label || "Ville inconnue"}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
