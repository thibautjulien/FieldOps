import { View, TouchableOpacity, Image } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BottomMenu({ isAdmin }) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const tabsLeft = [
    {
      key: "accueil",
      route: "/accueil",
      iconActive: require("../../assets/images/accueil.png"),
      iconInactive: require("../../assets/images/accueil-gray.png"),
    },
    {
      key: "list",
      route: "/list",
      iconActive: require("../../assets/images/list.png"),
      iconInactive: require("../../assets/images/list-gray.png"),
    },
  ];

  const tabsRight = [
    {
      key: "cloche",
      route: "/cloche",
      iconActive: require("../../assets/images/cloche.png"),
      iconInactive: require("../../assets/images/cloche-gray.png"),
    },
    {
      key: "user",
      route: "/user",
      iconActive: require("../../assets/images/user.png"),
      iconInactive: require("../../assets/images/user-gray.png"),
    },
  ];

  const renderTab = (tab) => {
    const active = pathname === tab.route;

    return (
      <TouchableOpacity
        key={tab.key}
        onPress={() => router.replace(tab.route)}
        activeOpacity={0.8}
        className="items-center"
      >
        <Image
          source={active ? tab.iconActive : tab.iconInactive}
          style={{ width: 20, height: 20 }}
          resizeMode="contain"
        />
        <View
          className={`mt-1 h-1.5 w-1.5 rounded-full ${
            active ? "bg-black" : "bg-transparent"
          }`}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: Math.max(insets.bottom, 8),
        zIndex: 1000,
        elevation: 20,
      }}
    >
      <View
        style={{
          height: 72,
          borderRadius: 24,
          backgroundColor: "#FFFFFF",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 28,
        }}
      >
        <View style={{ flexDirection: "row", gap: 28 }}>
          {tabsLeft.map(renderTab)}
        </View>

        {isAdmin ? (
          <TouchableOpacity
            onPress={() => router.replace("/add")}
            activeOpacity={0.85}
            style={{
              marginTop: 0,
              width: 66,
              height: 66,
              borderRadius: 29,
              borderWidth: 4,
              borderColor: "#CFE1E4", // halo turquoise clair
              backgroundColor: "#1F2329",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("../../assets/images/add.png")}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 58, height: 58 }} />
        )}

        <View style={{ flexDirection: "row", gap: 28 }}>
          {tabsRight.map(renderTab)}
        </View>
      </View>
    </View>
  );
}
