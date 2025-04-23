import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PengaturanScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pengaturan</Text>
      <Text style={styles.description}>Kelola preferensi akun Anda.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
});
