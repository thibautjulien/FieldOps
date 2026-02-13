import { useMemo } from "react";
import { View, Text } from "react-native";

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

function isSameDay(dateStr, now = new Date()) {
  const d = new Date(dateStr);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function formatHour(dateStr) {
  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNextPlannedToday(interventions = []) {
  return (
    interventions
      .filter(
        (it) =>
          isSameDay(it.scheduled_at) && normalizeStatus(it.status) === "PLANIFIE",
      )
      .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0] ||
    null
  );
}

export function DashboardSummary({
  userRole,
  interventions = [],
  pendingSyncCount = 0,
}) {
  const summary = useMemo(() => {
    const today = interventions.filter((it) => isSameDay(it.scheduled_at));

    if (userRole === "admin") {
      return {
        totalToday: today.length,
        planified: today.filter(
          (it) => normalizeStatus(it.status) === "PLANIFIE",
        ).length,
        inProgress: today.filter(
          (it) => normalizeStatus(it.status) === "EN_COURS",
        ).length,
        toAssign: today.filter((it) => it.assigned_user_id == null).length,
        closedToday: today.filter((it) => normalizeStatus(it.status) === "CLOS")
          .length,
      };
    }

    const next = getNextPlannedToday(interventions);
    return {
      todayCount: today.length,
      nextHour: next ? formatHour(next.scheduled_at) : "--:--",
      nextCity: next?.city_label || "Ville inconnue",
      nextTitle: next?.title || "Aucune intervention prévue",
    };
  }, [interventions, userRole]);

  return (
    <View className="px-5 mt-8">
      {userRole === "admin" ? (
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
          <Text className="text-[#111827] font-semibold text-lg mb-4">
            Vue globale
          </Text>

          <View className="flex-row flex-wrap justify-between">
            <Stat label="Total" value={interventions.length} />
            <Stat label="Aujourd’hui" value={summary.totalToday} />
            <Stat label="En cours" value={summary.inProgress} />
            <Stat label="Planifiés" value={summary.planified} />
            <Stat label="Closes" value={summary.closedToday} />
          </View>
        </View>
      ) : (
        <View
          className="rounded-2xl bg-white p-5 border border-[#E2E8F0]"
          style={{
            shadowColor: "#0F172A",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.08,
            shadowRadius: 18,
            elevation: 8,
          }}
        >
          <Text className="text-[#111827] font-semibold text-lg mb-2">
            Mon résumé
          </Text>
          <Text className="text-slate-600">
            Interventions prévues aujourd’hui :{" "}
            <Text className="font-bold text-[#111827]">
              {summary.todayCount}
            </Text>
          </Text>
          <Text className="text-slate-600 mt-1">
            Prochaine :{" "}
            <Text className="font-bold text-[#111827]">
              {summary.nextHour} · {summary.nextCity}
            </Text>
          </Text>
          <Text className="text-slate-500 mt-1" numberOfLines={1}>
            {summary.nextTitle}
          </Text>
        </View>
      )}

      <View className="mt-3 px-1">
        <Text className="text-xs text-slate-500">
          {pendingSyncCount > 0
            ? `${pendingSyncCount} action(s) en attente de synchronisation`
            : "Synchronisation à jour"}
        </Text>
      </View>
    </View>
  );
}

function Stat({ label, value }) {
  return (
    <View className="w-[48%] mb-2 px-1 py-1">
      <Text className="text-slate-500 text-xs">{label}</Text>
      <Text className="text-[#111827] font-bold text-xl">{value}</Text>
    </View>
  );
}
