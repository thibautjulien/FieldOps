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
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAccueilData = useCallback(async () => {
    try {
      setLoading(true);

      const meResult = await getMe();
      if (meResult.success) {
        setName(meResult.data?.name || "Inconnu");
        setUserRole(meResult.data?.role || "agent");
        setEmail(meResult.data?.email || "Inconnu");
        setNameInput(meResult.data?.name || "");
        setEmailInput(meResult.data?.email || "");
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

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const result = await updateMe({
        name: nameInput.trim(),
        email: emailInput.trim(),
      });

      if (!result.success) {
        setError(result.message || "Erreur de mise à jour");
        return;
      }

      setSuccess("Profil mis à jour");
      await loadAccueilData();
    } finally {
      setSaving(false);
    }
  };

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
                Affichage du{"\n"}profil
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

            <View className="mt-20">
              <Text className="text-slate-600 mb-1">Modifier votre nom</Text>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-3 text-[#111827]"
                placeholder="Votre nom"
              />

              <Text className="text-slate-600 mt-4 mb-1">
                Modifier votre email
              </Text>
              <TextInput
                value={emailInput}
                onChangeText={setEmailInput}
                autoCapitalize="none"
                keyboardType="email-address"
                className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-3 text-[#111827]"
              />

              {error ? (
                <Text className="text-red-500 mt-3">{error}</Text>
              ) : null}
              {success ? (
                <Text className="text-green-600 mt-3">{success}</Text>
              ) : null}

              <TouchableOpacity
                onPress={handleSaveProfile}
                disabled={saving}
                className="mt-5 rounded-xl bg-[#1E293B] py-3 items-center"
              >
                <Text className="text-white font-semibold">
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
