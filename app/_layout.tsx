import "react-native-reanimated";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router"; // Gunakan Stack dari expo-router
import { useFonts } from "expo-font";
import { SessionProvider } from "@/store/auth/auth-context";

// Prevent splash screen from hiding before assets are loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SessionProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="profile" options={{ title: "Profile" }} />
        <Stack.Screen
          name="order-tracking"
          options={{ title: "Order Tracking" }}
        />
        <Stack.Screen
          name="history-belanja"
          options={{ title: "History Belanja" }}
        />
        <Stack.Screen
          name="alamat-pengiriman"
          options={{ title: "Alamat Pengiriman" }}
        />
        <Stack.Screen name="pengaturan" options={{ title: "Pengaturan" }} />
        <Stack.Screen name="checkout" options={{ title: "checkout" }} />
      </Stack>
      <StatusBar style="dark" />
    </SessionProvider>
  );
}
