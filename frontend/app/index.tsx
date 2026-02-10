import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl font-bold text-black">NativeWind OK</Text>
      <Text className="mt-2 text-xl text-neutral-600">
        Edit app/index.tsx to change this screen.
      </Text>
    </View>
  );
}
