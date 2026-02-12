import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

    const { token, name, id } = result.data;

    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("name", name);
    await AsyncStorage.setItem("id", String(id));

    setLoading(false);
    router.replace("/accueil");
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1">
      <View className="h-12 mt-6 px-4">
        {error ? (
          <View className="rounded-xl bg-red-500 px-3 py-2">
            <Text className="text-white text-center">{error}</Text>
          </View>
        ) : null}
      </View>

      <View className="flex-1 items-center justify-center px-4">
        <View className="w-full mt-24 gap-4">
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            className="border border-gray-500 rounded-sm px-3 py-2 text-gray-500 bg-transparent"
          />

          <TextInput
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="border border-gray-500 rounded-sm px-3 py-2 text-gray-500 bg-transparent"
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="mt-4 h-14 w-56 self-center items-center justify-center rounded-md bg-blue-600"
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-semibold">
              {loading ? "Connexion..." : "Se connecter"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
