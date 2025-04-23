import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";

export default function HistoryBelanjaScreen() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState({});

  const loadHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem("transactionHistory");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const handleImageError = (itemId) => {
    setImageLoadErrors((prev) => ({ ...prev, [itemId]: true }));
  };

  const renderItemImage = (item) => {
    if (imageLoadErrors[item.id]) {
      return (
        <View style={[styles.previewImage, styles.imagePlaceholder]}>
          <FontAwesome name="image" size={16} color="#999" />
        </View>
      );
    }

    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.previewImage}
          resizeMode="cover"
          onError={() => handleImageError(item.id)}
        />
      </View>
    );
  };

  const renderTransaction = ({ item }) => (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => router.push(`/history/${item.id}`)}
    >
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionId}>#{item.id}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: item.status === "Sukses" ? "#A6F4C5" : "#FFD452",
            },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.transactionDate}>
        {item.date} {item.time}
      </Text>

      <View style={styles.itemPreview}>
        {item.cartItems.slice(0, 2).map((cartItem, index) => (
          <View key={`${item.id}-${index}`} style={styles.previewItem}>
            {renderItemImage(cartItem)}
            <Text style={styles.previewName}>
              {cartItem.name} ({cartItem.quantity})
            </Text>
          </View>
        ))}
        {item.cartItems.length > 2 && (
          <Text style={styles.moreItems}>
            +{item.cartItems.length - 2} item lainnya
          </Text>
        )}
      </View>

      <View style={styles.transactionFooter}>
        <Text style={styles.totalText}>
          Total: Rp. {item.totalAmount.toLocaleString("id-ID")}
        </Text>
        <FontAwesome name="chevron-right" size={14} color="#666" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Riwayat Transaksi</Text>
      <Text style={styles.description}>Daftar pembelian Anda</Text>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="history" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Belum ada riwayat transaksi</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#000"]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    color: "#888",
    marginTop: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  transactionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  transactionId: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  transactionDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  itemPreview: {
    marginBottom: 12,
  },
  previewItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  imageContainer: {
    position: "relative",
  },
  previewImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
  },
  previewName: {
    fontSize: 14,
    color: "#333",
    flexShrink: 1,
  },
  moreItems: {
    fontSize: 12,
    color: "#666",
    marginLeft: 50,
    fontStyle: "italic",
  },
  transactionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  totalText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
});
