import { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import {
  apiGetInterventionById,
  apiUpdateInterventionStatus,
  apiCloseIntervention,
} from "../../../src/api/interventions";

function formatHour(dateStr) {
  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeStatus(status = "") {
  return String(status).trim().toUpperCase();
}

export default function InterventionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [intervention, setIntervention] = useState(null);

  const loadDetail = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");
      const data = await apiGetInterventionById(id);
      setIntervention(data);
    } catch (err) {
      setError(err?.response?.data?.error || "Impossible de charger le détail.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadDetail();
    }, [loadDetail]),
  );

  const currentStatus = normalizeStatus(intervention?.status);

  const handleUpdate = async (type) => {
    if (!id || saving) return;

    try {
      setSaving(true);
      setError("");

      if (type === "EN_COURS") {
        await apiUpdateInterventionStatus(id, "EN_COURS");
      } else if (type === "TERMINE") {
        await apiUpdateInterventionStatus(id, "TERMINE");
      } else if (type === "CLOSE") {
        await apiCloseIntervention(id);
      }

      await loadDetail();
    } catch (err) {
      setError(err?.response?.data?.error || "Action impossible pour cet état.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#F4F7FA]">
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View className="px-5 pt-3 pb-2">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          <Text className="text-[#111827] font-semibold">← Retour</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-500">Chargement...</Text>
        </View>
      ) : !intervention ? (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-slate-500">Intervention introuvable.</Text>
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
          <View className="rounded-2xl bg-white p-5 border border-[#E2E8F0]">
            <Text className="text-xl font-bold text-[#111827]">{intervention.title}</Text>
            <Text className="text-slate-500 mt-1">{intervention.city_label || "Ville inconnue"}</Text>

            <View className="mt-4 gap-2">
              <Text className="text-slate-700">
                <Text className="font-semibold text-[#111827]">Heure :</Text>{" "}
                {intervention.scheduled_at ? formatHour(intervention.scheduled_at) : "-"}
              </Text>
              <Text className="text-slate-700">
                <Text className="font-semibold text-[#111827]">Statut :</Text> {normalizeStatus(intervention.status)}
              </Text>
              <Text className="text-slate-700">
                <Text className="font-semibold text-[#111827]">Description :</Text>{" "}
                {intervention.description || "-"}
              </Text>
              <Text className="text-slate-700">
                <Text className="font-semibold text-[#111827]">Position :</Text>{" "}
                {intervention.latitude ?? "-"}, {intervention.longitude ?? "-"}
              </Text>
            </View>
          </View>

          <View className="mt-4 rounded-2xl bg-white p-5 border border-[#E2E8F0]">
            <Text className="text-lg font-semibold text-[#111827] mb-3">Actions</Text>

            <View className="gap-2">
              {currentStatus === "PLANIFIE" && (
                <ActionBtn
                  label="Prendre en charge (EN_COURS)"
                  onPress={() => handleUpdate("EN_COURS")}
                  disabled={saving}
                />
              )}

              {currentStatus === "EN_COURS" && (
                <ActionBtn
                  label="Marquer terminée (TERMINE)"
                  onPress={() => handleUpdate("TERMINE")}
                  disabled={saving}
                />
              )}

              {currentStatus === "TERMINE" && (
                <ActionBtn
                  label="Clôturer (CLOS)"
                  onPress={() => handleUpdate("CLOSE")}
                  disabled={saving}
                />
              )}

              {currentStatus === "CLOS" && (
                <Text className="text-slate-500">Intervention déjà clôturée.</Text>
              )}
            </View>

            {!!error && <Text className="text-red-600 mt-3">{error}</Text>}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function ActionBtn({ label, onPress, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      className={`rounded-xl px-4 py-3 ${disabled ? "bg-slate-300" : "bg-[#1F2937]"}`}
    >
      <Text className="text-white font-semibold text-center">{label}</Text>
    </TouchableOpacity>
  );
}
