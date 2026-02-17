import { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { apiGetRecentInterventionLogs } from "../../src/api/interventions";
import { getMe } from "../../src/services/AuthService";

function formatHour(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAction(action = "") {
  const a = String(action).toUpperCase();
  if (a.includes("STATUS")) return "Changement de status";
  if (a.includes("PHOTO")) return "Photo ajoutée";
  return action || "Action";
}

function parseAction(action = "") {
  const raw = String(action);

  if (raw.startsWith("STATUS_CHANGED:")) {
    const payload = raw.replace("STATUS_CHANGED:", "");
    const [from, to] = payload.split("->");
    return `Statut: ${from || "?"} -> ${to || "?"}`;
  }

  if (raw.startsWith("PHOTO_ADDED:")) {
    const type = raw.replace("PHOTO_ADDED:", "");
    return `Photo ajoutée (${type || "?"})`;
  }

  return raw;
}

export default function Notifications() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("ALL");

  const loadNotificationData = useCallback(async () => {
    try {
      setLoading(true);
      const [meResult, logsResult] = await Promise.all([
        getMe(),
        apiGetRecentInterventionLogs(),
      ]);

      if (meResult.success) {
        setName(meResult.data?.name || "Inconnu");
      }

      setLogs(logsResult || []);
    } catch (err) {
      console.error(
        "[FieldOps] Notification load error: ",
        err?.message || err,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotificationData();
    }, [loadNotificationData]),
  );

  const filteredLogs = useMemo(() => {
    if (filter === "ALL") return logs;
    if (filter === "STATUS") {
      return logs.filter((l) =>
        String(l.action || "")
          .toUpperCase()
          .includes("STATUS"),
      );
    }
    if (filter === "PHOTO") {
      return logs.filter((l) =>
        String(l.action || "")
          .toUpperCase()
          .includes("PHOTO"),
      );
    }
    return logs;
  }, [logs, filter]);

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

        <View className="flex-row gap-2 my-5 ml-5">
          <TouchableOpacity
            onPress={() => setFilter("ALL")}
            className="px-3 py-2 rounded-xl bg-white border border-[#E2E8F0]"
          >
            <Text>Tout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter("STATUS")}
            className="px-3 py-2 rounded-xl bg-white border border-[#E2E8F0]"
          >
            <Text>Statuts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter("PHOTO")}
            className="px-3 py-2 rounded-xl bg-white border border-[#E2E8F0]"
          >
            <Text>Photos</Text>
          </TouchableOpacity>
        </View>

        {filteredLogs.map((log) => (
          <View
            key={String(log.id)}
            className="mb-3 mx-5 rounded-2xl bg-white border border-[#E2E8F0] px-4 py-4"
          >
            <Text className="text-[#111827] font-semibold">
              {parseAction(log.action)} - {formatHour(log.createdAt)}
            </Text>

            <Text className="text-slate-600 mt-1">
              Par: {log.User?.name || "Utilisateur inconnu"}
            </Text>

            <Text className="text-slate-600 mt-1">
              Intervention:{" "}
              {log.Intervention?.title || `#${log.intervention_id}`}{" "}
              {log.Intervention?.city_label
                ? `(${log.Intervention.city_label})`
                : ""}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
