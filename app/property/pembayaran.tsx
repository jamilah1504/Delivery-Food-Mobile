import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import React from "react";
import { WebView } from "react-native-webview";

export default function pembayaranWebView() {
  const { url } = useLocalSearchParams();

  if (!url) {
    return (
      <View style={styles.container}>
        <ActivityIndicator style={styles.activity} />
      </View>
    );
  }

  const decodedUrl = decodeURIComponent(url);

  if (Platform.OS === "web") {
    return (
      <iframe
        src={decodedUrl}
        style={{
          width: "100%",
          height: "100%",
          borderWidth: 0,
        }}
        title="Pembayaran"
      />
    );
  }

  return (
    <WebView
      source={{ uri: decodedUrl }}
      startInLoadingState={true}
      javaScriptEnabled
      style={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  activity: {
    color: "blue",
  },
  content: {
    flex: 1,
  },
});