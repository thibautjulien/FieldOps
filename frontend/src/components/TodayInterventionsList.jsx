import { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

function isSameDay(dateStr, now = new Date()) {
  const d = new Date(dateStr);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function normalizeStatus(status = "") {
  const raw = String(status).trim().toUpperCase();
  const map = {
    PLANIFIE: "PLANIFIE",
    PLANIFIÉ: "PLANIFIE",
    EN_COURS: "EN_COURS",
    "EN COURS": "EN_COURS",
    TERMINE: "TERMINE",
    TERMINÉ: "TERMINE",
    CLOS: "CLOS",
    CLOTURE: "CLOS",
    CLÔTURÉ: "CLOS",
  };
  return map[raw] || raw;
}

function isVisibleStatus(status = "") {
  const s = normalizeStatus(status);
  return s === "PLANIFIE" || s === "EN_COURS";
}

function formatHour(dateStr) {
  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatusLabel(status = "") {
  const s = normalizeStatus(status);
  const map = {
    PLANIFIE: "PLANIFIE",
    EN_COURS: "EN_COURS",
    TERMINE: "TERMINE",
    CLOS: "CLOS",
  };
  return map[s] || s || "-";
}

export default function TodayInterventionsList({ interventions = [] }) {
  const router = useRouter();
  const todayItems = useMemo(() => {
    return interventions
      .filter((it) => isSameDay(it.scheduled_at) && isVisibleStatus(it.status))
      .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
  }, [interventions]);

  const hasScrollableList = todayItems.length > 3;

  return (
    <View className="px-5 mt-10">
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
            Aujourd'hui
          </Text>
          <Text className="text-xs text-slate-500">
            {todayItems.length} intervention(s)
          </Text>
        </View>

        {todayItems.length === 0 ? (
          <Text className="text-slate-500">
            Aucune intervention planifiée/en cours.
          </Text>
        ) : (
          <ScrollView
            style={hasScrollableList ? { maxHeight: 258 } : undefined}
            showsVerticalScrollIndicator={hasScrollableList}
            nestedScrollEnabled
          >
            {todayItems.map((it) => (
              <TouchableOpacity
                key={String(it.id)}
                activeOpacity={0.82}
                onPress={() => router.push(`/interventions/${it.id}`)}
                className="mb-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-3"
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-[#111827] font-semibold flex-1 pr-2"
                    numberOfLines={1}
                  >
                    {it.title}
                  </Text>
                  <Text className="text-[#111827] font-semibold">
                    {formatHour(it.scheduled_at)}
                  </Text>
                </View>

                <View className="mt-1 flex-row items-center justify-between">
                  <Text className="text-slate-500 text-xs" numberOfLines={1}>
                    {it.city_label || "Ville inconnue"}
                  </Text>
                  <Text className="text-xs text-slate-500">
                    {formatStatusLabel(it.status)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
