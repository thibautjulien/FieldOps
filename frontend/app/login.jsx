import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { login } from "../src/services/AuthService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  async function handleSubmit() {
    if (!isValidEmail(email)) {
      setError("Adresse email invalide");
      return;
    }

    setError("");
    setLoading(true);

    const result = await login({ email, password });

    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }

    console.log("[FieldOps] Login réussi : ", result.data);

    const { token } = result.data;

    if (!token) {
      setError("Token manquant");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.replace("/accueil");
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F4F7FA]">
      <View className="flex-1 px-6">
        <View className="items-center pt-10">
          <Image
            source={require("../assets/images/FieldOps.png")}
            className="h-20 w-52"
            resizeMode="contain"
          />
          <Text className="mt-3 text-sm uppercase text-[#708090]">
            Portail interventions entreprise
          </Text>
        </View>

        <View className="mt-10 rounded-2xl border border-[#D3DCE6] bg-white p-5">
          <Text className="mb-4 text-xl font-bold text-[#334155]">
            Connexion
          </Text>

          {error ? (
            <View className="mb-4 rounded-lg bg-red-50 p-3">
              <Text className="text-red-700">{error}</Text>
            </View>
          ) : null}

          <TextInput
            placeholder="Email professionnel"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            className="mb-3 rounded-lg border border-[#CBD5E1] px-3 py-3 text-[#334155]"
          />

          <TextInput
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="rounded-lg border border-[#CBD5E1] px-3 py-3 text-[#334155]"
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="mt-5 items-center rounded-lg bg-[#334155] py-3"
          >
            <Text className="font-semibold text-white">
              {loading ? "Connexion..." : "Se connecter"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
