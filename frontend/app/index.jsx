import { View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F4F7FA]">
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-md items-center">
          <Image
            source={require("../assets/images/FieldOps.png")}
            className="h-20 w-52"
            resizeMode="contain"
          />
          <Text className="mt-3 text-sm text-[#708090] uppercase">
            Plateforme de gestion des interventions
          </Text>

          <View className="mt-8 w-full rounded-2xl border border-[#D3DCE6] bg-white p-6">
            <Text className="text-center text-2xl font-bold text-[#334155]">
              Bienvenue sur votre espace
            </Text>

            <Text className="text-center mt-3 text-base leading-6 text-[#64748B]">
              Accédez à vos interventions, suivez leur avancement et centralisez
              vos comptes-rendus terrain depuis un espace dédié à votre
              activité.
            </Text>

            <TouchableOpacity
              onPress={() => router.replace("/login")}
              className="mt-8 items-center rounded-lg bg-[#334155] py-3"
              activeOpacity={0.85}
            >
              <Text className="text-base font-semibold text-white">
                Connexion
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
