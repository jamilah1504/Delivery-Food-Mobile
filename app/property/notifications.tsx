import axiosInstance from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const api = axios.create({
  baseURL: "http://192.168.43.146:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const getNotifications = async () => {
  try {
    const response = await axiosInstance.get("/notifications");
    console.log("API Response:", JSON.stringify(response.data, null, 2));
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Error fetching notifications:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

const deleteNotification = async (id) => {
  try {
    await axiosInstance.delete(`/notifications/${id}`);
    return true;
  } catch (error) {
    console.error("Error deleting notification:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return false;
  }
};

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications();
      console.log("Notifications state:", JSON.stringify(data, null, 2));
      setNotifications(data);
    } catch (error) {
      const status = error.response?.status;
      let errorMessage = "Gagal memuat notifikasi. Silakan coba lagi nanti.";
      if (status === 404) {
        errorMessage = "Endpoint notifikasi tidak ditemukan. Periksa URL API.";
      } else if (status === 500) {
        errorMessage = "Terjadi kesalahan server. Periksa log backend.";
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Koneksi jaringan gagal. Periksa URL atau internet.";
      } else if (status === 401 || status === 403) {
        errorMessage = "Autentikasi gagal. Periksa token.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleDelete = useCallback(
    async (id) => {
      const success = await deleteNotification(id);
      if (success) {
        setNotifications(notifications.filter((item) => item.id !== id));
      } else {
        setError("Gagal menghapus notifikasi.");
      }
    },
    [notifications]
  );

  if (loading && notifications.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Notification</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchNotifications}
        >
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2E5BFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        <View style={{ width: 24 }} />
      </View>
      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>Tidak ada notifikasi tersedia</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          refreshing={loading}
          onRefresh={fetchNotifications}
          renderItem={({ item }) => (
            <View
              style={[
                styles.notificationCard,
                { backgroundColor: item.bgColor || "#2E5BFF" },
              ]}
            >
              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title || "No Title"}</Text>
                <Text style={styles.message}>
                  {item.message || "No Message"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => handleDelete(item.id)}
                accessibilityLabel="Close notification"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={18} color="white" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E5BFF",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 20,
    textAlign: "center",
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
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
    margin: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#7E8B9F",
    margin: 16,
  },
  retryButton: {
    backgroundColor: "#2E5BFF",
    padding: 10,
    borderRadius: 8,
    alignSelf: "center",
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
