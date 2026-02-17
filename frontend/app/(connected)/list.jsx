import { useCallback, useState, useMemo } from "react";
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
import { queryAll, execSql } from "../../src/db/db";

export default function List() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [userRole, setUserRole] = useState("agent");
  const [interventions, setInterventions] = useState([]);
  const [search, setSearch] = useState("");

  const router = useRouter();
  const initial = (name?.trim()?.[0] || "A").toUpperCase();

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

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

  const loadListData = useCallback(async () => {
    try {
      setLoading(true);

      const meResult = await getMe();
      if (meResult.success) {
        setName(meResult.data?.name || "");
        setUserRole((meResult.data?.role || "agent").toLowerCase());
      }

      try {
        const res = await api.get("/interventions");
        const list = res.data || [];
        setInterventions(list);
        await cacheInterventions(list);
      } catch {
        const local = await readLocalInterventions();
        setInterventions(local);
        console.log("[FieldOps] list offline mode: local data loaded");
      }
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

  const filteredListData = useMemo(() => {
    const q = normalize(search.trim());
    if (!q) return listData;

    return listData.filter((it) => {
      const title = normalize(it.title);
      const city = normalize(it.city_label);
      const status = normalize(it.status); // PLANIFIE, EN_COURS, TERMINE, CLOS
      return title.includes(q) || city.includes(q) || status.includes(q);
    });
  }, [listData, search]);

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    return filteredListData.slice(0, 5);
  }, [filteredListData, search]);

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
              placeholder="Recherche (titre, ville, status)"
              value={search}
              onChangeText={setSearch}
              className="text-base text-[#111827]"
              placeholderTextColor="#9CA3AF"
            />

            {suggestions.length > 0 && (
              <View className="mt-2 rounded-xl border border-[#E2E8F0] bg-white">
                {suggestions.map((it, index) => (
                  <TouchableOpacity
                    key={String(it.id)}
                    onPress={() => setSearch(it.title)}
                    className={`px-3 py-2 ${index !== suggestions.length - 1 ? "border-b border-[#F1F5F9]" : ""}`}
                  >
                    <Text
                      className="text-[#111827] font-medium"
                      numberOfLines={1}
                    >
                      {it.title}
                    </Text>
                    <Text className="text-xs text-slate-500" numberOfLines={1}>
                      {it.city_label || "Ville inconnue"} -{" "}
                      {normalizeStatus(it.status)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
          ) : filteredListData.length === 0 ? (
            <Text className="text-slate-500">
              Aucune intervention sur la période.
            </Text>
          ) : (
            filteredListData.map((it) => (
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
