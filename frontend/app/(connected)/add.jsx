import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRouter } from "expo-router";
import { getMe } from "../../src/services/AuthService";
import { apiCreateIntervention } from "../../src/api/interventions";
import { apiGetAgents } from "../../src/api/users";
import { api } from "../../src/api/client";

export default function AddInterventionScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [name, setName] = useState("");

  const [agents, setAgents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [scheduledAtInput, setScheduledAtInput] = useState(""); // YYYY-MM-DD HH:mm
  const [cityLabel, setCityLabel] = useState("");

  const loadAddData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const me = await getMe();
      if (!me.success) {
        setError("[FieldOps] Impossible de récupérer le profil");
        return;
      }

      const meData = me.data?.user || me.data || {};
      const role = String(meData.role || "")
        .trim()
        .toLowerCase();

      setName(meData.name || "Inconnu");

      if (role !== "admin") {
        setError("[FieldOps] Accès réservé admin");
        return;
      }

      const list = await apiGetAgents();
      setAgents(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(
        err?.response?.data?.error || "Impossible de charger les agents.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAddData();
    }, [loadAddData]),
  );

  const initial = name?.trim()?.[0] || "A".toUpperCase();

  function toIsoDateTime(value) {
    // attendu: "2026-02-20 14:30"
    const normalized = value.trim().replace(" ", "T");
    const d = new Date(normalized);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  }

  const handleCreate = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const scheduled_at = toIsoDateTime(scheduledAtInput);
      if (!scheduled_at) {
        setError("Format date invalide. Utilise: YYYY-MM-DD HH:mm");
        return;
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        assigned_user_id: Number(assignedUserId),
        scheduled_at,
        city_label: cityLabel.trim(),
        status: "PLANIFIE",
      };

      await apiCreateIntervention(payload);

      setSuccess("Intervention créée.");
      setTitle("");
      setDescription("");
      setAssignedUserId("");
      setScheduledAtInput("");
      setCityLabel("");
    } catch (err) {
      setError(err?.response?.data?.error || "Création impossible.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        edges={["top"]}
        className="flex-1 items-center justify-center bg-[#F4F7FA]"
      >
        <Text>Chargement...</Text>
      </SafeAreaView>
    );
  }

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

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
          <Text className="mb-1 text-slate-600">Titre</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            className="mb-3 rounded-xl border border-[#E2E8F0] bg-white px-3 py-3"
          />

          <Text className="mb-1 text-slate-600">Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            className="mb-3 rounded-xl border border-[#E2E8F0] bg-white px-3 py-3 min-h-[90px]"
          />

          <Text className="mb-1 text-slate-600">Agent assigné</Text>
          <View className="mb-3 rounded-xl border border-[#E2E8F0] bg-white">
            <Picker
              selectedValue={assignedUserId}
              onValueChange={(value) => setAssignedUserId(value)}
            >
              <Picker.Item label="Sélectionner un agent" value="" />
              {agents.map((a) => (
                <Picker.Item
                  key={a.id}
                  label={`${a.name} (${a.email})`}
                  value={String(a.id)}
                />
              ))}
            </Picker>
          </View>

          <Text className="mb-1 text-slate-600">
            Date/heure (YYYY-MM-DD HH:mm)
          </Text>
          <TextInput
            value={scheduledAtInput}
            onChangeText={setScheduledAtInput}
            placeholder="2026-02-20 14:30"
            className="mb-3 rounded-xl border border-[#E2E8F0] bg-white px-3 py-3"
          />

          <Text className="mb-1 text-slate-600">Ville</Text>
          <TextInput
            value={cityLabel}
            onChangeText={setCityLabel}
            className="mb-3 rounded-xl border border-[#E2E8F0] bg-white px-3 py-3"
          />

          {!!error && <Text className="text-red-600 mb-3">{error}</Text>}
          {!!success && <Text className="text-green-600 mb-3">{success}</Text>}

          <TouchableOpacity
            onPress={handleCreate}
            disabled={saving}
            className={`rounded-xl py-3 items-center ${saving ? "bg-slate-300" : "bg-[#1F2937]"}`}
          >
            <Text className="text-white font-semibold">
              {saving ? "Création..." : "Créer l'intervention"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
