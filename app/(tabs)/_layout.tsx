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

  const isLoggedIn = true; // contoh kondisi

  // 🎯 Konfigurasi tab yang akan ditampilkan
  const tabsConfig = {
    keranjang: { 
      visible: true, // Hanya tampil jika sudah login
      requiresAuth: true 
    },
    wishlist: { 
      visible: true, // Hanya tampil jika sudah login
      requiresAuth: true 
    },
    home: { 
      visible: true, // Selalu tampil
      requiresAuth: true 
    },
    explore: { 
      visible: true, // Selalu tampil
      requiresAuth: true 
    },
    notification: { 
      visible: true, // Hanya tampil jika sudah login
      requiresAuth: true 
    },
    index: { 
      visible: false, // Hanya tampil jika sudah login
      requiresAuth: true 
    },
    profile: { 
      visible: true, // Hanya tampil jika sudah login
      requiresAuth: true 
    },
  };

  // 🎯 Alternatif: Bisa juga menggunakan array sederhana
  // const visibleTabs = ['home', 'explore', 'profile']; // Hanya 3 tab ini yang akan muncul

  return (
    <SessionProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: "#536001",
              tabBarInactiveTintColor: "#999",
              headerShown: false,
              tabBarButton: HapticTab,
              tabBarBackground: TabBarBackground,
              tabBarStyle: styles.tabBar,
              tabBarItemStyle: styles.tabBarItem,
            }}
          >
            {/* Tab Keranjang */}
            <Tabs.Screen
              name="keranjang"
              options={{
                title: "Keranjang",
                href: tabsConfig.keranjang.visible ? "/keranjang" : null, // 🎯 Key solution!
                tabBarIcon: ({ focused }) => (
                  <AntDesign
                    name="shoppingcart"
                    size={24}
                    color={focused ? "#536001" : "#999"}
                  />
                ),
              }}
            />

            {/* Tab Wishlist */}
            <Tabs.Screen
              name="wishlist"
              options={{
                title: "Wishlist",
                href: tabsConfig.wishlist.visible ? "/wishlist" : null, // 🎯 Key solution!
                tabBarIcon: ({ focused }) => (
                  <AntDesign
                    name="hearto"
                    size={24}
                    color={focused ? "#536001" : "#999"}
                  />
                ),
              }}
            />

            {/* Tab Home - Selalu Tampil */}
            <Tabs.Screen
              name="home"
              options={{
                title: "Home",
                href: tabsConfig.home.visible ? "/home" : null, // 🎯 Key solution!
                tabBarIcon: ({ focused }) => (
                  <AntDesign
                    name="home"
                    size={24}
                    color={focused ? "#536001" : "#999"}
                  />
                ),
              }}
            />

            {/* Tab Explore - Selalu Tampil */}
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

            {/* Tab Notification */}
            <Tabs.Screen
              name="notification"
              options={{
                title: "Notifikasi",
                href: tabsConfig.notification.visible ? "/notification" : null, // 🎯 Key solution!
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
              name="index"
              options={{
                title: "Login",
                href: tabsConfig.index.visible ? "/index" : null, // 🎯 Key solution!
                tabBarIcon: ({ focused }) => (
                  <AntDesign
                    name="notification"
                    size={24}
                    color={focused ? "#536001" : "#999"}
                  />
                ),
              }}
            />

            {/* Tab Profile */}
            <Tabs.Screen
              name="profile"
              options={{
                title: "Profil",
                href: tabsConfig.profile.visible ? "/profile" : null, // 🎯 Key solution!
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

// 🔧 Styling untuk Tab Bar
const styles = StyleSheet.create({
  tabBar: {
    // Uncomment jika ingin style oval/floating
    // position: "absolute",
    // bottom: 20,
    // left: 20,
    // right: 20,
    // height: 60,
    // borderRadius: 30,
    // backgroundColor: "#fff",
    // elevation: 5,
    // shadowColor: "#000",
    // shadowOpacity: 0.1,
    // shadowRadius: 10,
    // shadowOffset: { width: 0, height: 5 },
  },
  tabBarItem: {
    borderRadius: 20,
    paddingVertical: 10,
  },
}
);