import { useCallback, useState } from "react";
import { View, Text, TextInput, StatusBar, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { getMe } from "../../src/services/AuthService";
import { DashboardSummary } from "../../src/components/DashboardSummary";
import TodayInterventionsList from "../../src/components/TodayInterventionsList";
import TodayInterventionsListClos from "../../src/components/TodayInterventionsListClos";
import { api } from "../../src/api/client";
import { queryAll, execSql } from "../../src/db/db";

export default function Accueil() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [userRole, setUserRole] = useState("agent");
  const [interventions, setInterventions] = useState([]);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  async function cacheInterventions(rows = []) {
    await execSql("DELETE FROM interventions_local");

    for (const it of rows) {
      await execSql(
        `INSERT INTO interventions_local
      (id_local, id_server, title, description, status, scheduled_at, city_label, assigned_user_id, sync_status, updated_at_local)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `srv_${it.id}`,
          it.id,
          it.title || "",
          it.description || "",
          it.status || "PLANIFIE",
          it.scheduled_at || new Date().toISOString(),
          it.city_label || null,
          it.assigned_user_id || null,
          "SYNCED",
          new Date().toISOString(),
        ],
      );
    }
  }

  async function readLocalInterventions() {
    const rows = await queryAll(
      `SELECT id_server, id_local, title, description, status, scheduled_at, city_label, assigned_user_id
     FROM interventions_local
     ORDER BY scheduled_at ASC`,
    );

    return rows.map((r) => ({
      id: r.id_server ?? r.id_local,
      title: r.title,
      description: r.description,
      status: r.status,
      scheduled_at: r.scheduled_at,
      city_label: r.city_label,
      assigned_user_id: r.assigned_user_id,
    }));
  }

  const loadAccueilData = useCallback(async () => {
    try {
      setLoading(true);

      const meResult = await getMe();
      if (meResult.success) {
        setName(meResult.data?.name || "");
        setUserRole(meResult.data?.role || "agent");
      }

      const res = await api.get("/interventions");
      const list = res.data || [];
      setInterventions(list);
      await cacheInterventions(list);

      const pendingRows = await queryAll(
        "SELECT COUNT(*) AS count FROM sync_queue WHERE sync_status = ?",
        ["PENDING"],
      );
      const count = pendingRows?.[0]?.count ?? 0;
      setPendingSyncCount(Number(count));
    } catch (err) {
      const local = await readLocalInterventions();
      setInterventions(local);
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
