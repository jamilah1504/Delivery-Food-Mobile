import "react-native-reanimated";
import { Platform, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Tabs } from "expo-router";
import { useFonts } from "expo-font";
import { SessionProvider, useSession } from "@/store/auth/auth-context";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import AntDesign from "@expo/vector-icons/AntDesign";

SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const colorScheme = useColorScheme();
  const { session, isLoading } = useSession();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  return (
    <SessionProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: "#536001", // Warna aktif yang diminta
              tabBarInactiveTintColor: "#999", // Warna default ketika tidak aktif
              headerShown: false,
              tabBarButton: HapticTab,
              tabBarBackground: TabBarBackground,
              tabBarStyle: styles.tabBar,
              tabBarItemStyle: styles.tabBarItem,
            }}
          >
            <Tabs.Screen
              name="keranjang"
              options={{
                title: "Keranjang",
                tabBarIcon: ({ focused }) => (
                  <AntDesign
                    name="shoppingcart"
                    size={24}
                    color={focused ? "#536001" : "#999"}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="wishlist"
              options={{
                title: "Wishlist",
                tabBarIcon: ({ focused }) => (
                  <AntDesign
                    name="hearto"
                    size={24}
                    color={focused ? "#536001" : "#999"}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="index"
              options={{
                title: "Home",
                tabBarIcon: ({ focused }) => (
                  <AntDesign
                    name="home"
                    size={24}
                    color={focused ? "#536001" : "#999"}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="explore"
              options={{
                title: "Explore",
                tabBarIcon: ({ focused }) => (
                  <IconSymbol
                    size={28}
                    name="paperplane.fill"
                    color={focused ? "#536001" : "#999"}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="notification"
              options={{
                title: "Notifikasi",
                tabBarIcon: ({ focused }) => (
                  <AntDesign
                    name="notification"
                    size={24}
                    color={focused ? "#536001" : "#999"}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                title: "Profil",
                tabBarIcon: ({ focused }) => (
                  <AntDesign
                    name="user"
                    size={24}
                    color={focused ? "#536001" : "#999"}
                  />
                ),
              }}
            />
          </Tabs>
          <StatusBar style="dark" />
        </SafeAreaView>
      </SafeAreaProvider>
    </SessionProvider>
  );
}

// 🔧 Styling untuk Tab Bar Oval/Square
const styles = StyleSheet.create({
  // tabBar: {
  //   position: "absolute",
  //   bottom: 20,
  //   left: 20,
  //   right: 20,
  //   height: 60,
  //   borderRadius: 30, // Membuat oval
  //   backgroundColor: "#fff",
  //   elevation: 5,
  //   shadowColor: "#000",
  //   shadowOpacity: 0.1,
  //   shadowRadius: 10,
  //   shadowOffset: { width: 0, height: 5 },
  // },
  tabBarItem: {
    borderRadius: 20,
    paddingVertical: 10,
  },
});
