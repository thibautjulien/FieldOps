import { View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <View className="flex-1 justify-center items-center">
        <Image
          className="w-96 h-46"
          resizeMethod="contain"
          source={require("../assets/images/FieldOps.png")}
        />
        <TouchableOpacity className="" onPress={() => router.replace("/login")}>
          <Text className="text-2xl text-[#708090] font-bold mt-5">
            CONNEXION
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
