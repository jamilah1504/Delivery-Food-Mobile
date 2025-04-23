import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const notifications = [
  {
    id: "1",
    title: "Promo 3.3",
    message: "Jangan lupa nantikan promo menarik lainnya",
    bgColor: "#6A5ACD",
  },
  {
    id: "2",
    title: "Pesananmu sebentar lagi sampai",
    message: "Stand bye di tempat yah!!!",
    bgColor: "#333",
  },
];

export default function NotificationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notification</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[styles.notificationCard, { backgroundColor: item.bgColor }]}
          >
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.message}>{item.message}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton}>
              <Ionicons name="close" size={18} color="white" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F4F9",
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  message: {
    fontSize: 14,
    color: "white",
    marginTop: 4,
  },
  closeButton: {
    padding: 5,
  },
});
