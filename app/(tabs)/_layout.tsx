import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useFonts } from "expo-font";
import { Tabs } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const colorScheme = useColorScheme();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null; // Tetap tampilkan splash screen sampai font selesai dimuat
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "#2E5BFF",
            tabBarInactiveTintColor: "#999",
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarBackground: TabBarBackground,
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
                  color={focused ? "#2E5BFF" : "#999"}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="index"
            options={{
              href: null, // Gunakan href: null di dalam options
            }}
          />
          <Tabs.Screen
            name="home"
            options={{
              title: "Home",
              tabBarIcon: ({ focused }) => (
                <AntDesign
                  name="home"
                  size={24}
                  color={focused ? "#2E5BFF" : "#999"}
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
                  color={focused ? "#2E5BFF" : "#999"}
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
                  color={focused ? "#2E5BFF" : "#999"}
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
                  color={focused ? "#2E5BFF" : "#999"}
                />
              ),
            }}
          />
        </Tabs>
        <StatusBar style="dark" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBarItem: {
    borderRadius: 20,
    paddingVertical: 10,
  },
});
