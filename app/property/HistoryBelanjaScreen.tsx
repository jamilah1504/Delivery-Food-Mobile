import React, { useEffect, useState, useCallback } from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import axiosInstance from "../../utils/axiosInstance"; // Import axiosInstance

export default function HistoryBelanjaScreen() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      // Mengambil data dari API /order/1
      const response = await axiosInstance.get("/order/1");
      console.log("API Response:", response.data); // Debug log
      
      // Sesuaikan dengan struktur API yang sebenarnya
      if (response.data && response.data.data) {
        setHistory(response.data.data); // API mengembalikan array di response.data.data
      } else if (response.data && Array.isArray(response.data)) {
        setHistory(response.data); // Jika langsung array
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
      setHistory([]); // Set empty array jika error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };
  
  // Fungsi untuk memformat tanggal
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };
  
  // Fungsi untuk mendapatkan warna status
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "settlement":
      case "success":
        return "#4CAF50"; // Hijau
      case "pending":
        return "#FF9800"; // Orange
      case "cancel":
      case "failure":
        return "#F44336"; // Merah
      default:
        return "#9E9E9E"; // Abu-abu
    }
  };

  // Fungsi untuk mendapatkan warna teks status
  const getStatusTextColor = (status) => {
    switch (status.toLowerCase()) {
      case "settlement":
      case "success":
        return "#FFFFFF";
      case "pending":
        return "#FFFFFF";
      case "cancel":
      case "failure":
        return "#FFFFFF";
      default:
        return "#FFFFFF";
    }
  };

  // Fungsi untuk handle Detail
  const handleDetail = (order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  // Fungsi untuk handle Review
  const handleReview = (orderId) => {
    router.push(`./Riview?orderId=${orderId}`);
  };

  const API_IMAGE_URL = "http://127.0.0.1:8000/storage";

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={styles.cardContent}>
        {/* Product Image */}
        <Image 
          source={{ 
            uri: item.order_items && item.order_items.length > 0 
              ? `${API_IMAGE_URL}${item.order_items[0].product.image}` 
              : 'https://via.placeholder.com/80x80'
          }} 
          style={styles.productImage} 
        />
        
        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.productTitle}>
            {item.order_items && item.order_items.length > 0 
              ? item.order_items[0].product.name 
              : 'Produk tidak tersedia'
            }
            {item.order_items && item.order_items.length > 1 
              ? ` & ${item.order_items.length - 1} Lainnya` 
              : ''
            }
          </Text>
          
          <Text style={styles.dateText}>
            {formatDate(item.created_at)}
          </Text>
          
          <Text style={styles.priceText}>
            Rp. {parseFloat(item.total_amount).toLocaleString("id-ID", { minimumFractionDigits: 0 })}
          </Text>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleReview(item.id)}
            >
              <Text style={styles.actionButtonText}>Rating</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDetail(item)}
            >
              <Text style={styles.actionButtonText}>Detail</Text>
            </TouchableOpacity>
            
            <View style={styles.chevronContainer}>
              <FontAwesome name="chevron-right" size={16} color="#87CEEB" />
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  // Modal untuk Detail
  const DetailModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={detailModalVisible}
      onRequestClose={() => setDetailModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detail Pesanan</Text>
            <TouchableOpacity 
              onPress={() => setDetailModalVisible(false)}
              style={styles.closeButton}
            >
              <FontAwesome name="times" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          {selectedOrder && (
            <View style={styles.modalBody}>
              <Text style={styles.detailLabel}>ID Pesanan: {selectedOrder.id}</Text>
              <Text style={styles.detailLabel}>Status: {selectedOrder.status}</Text>
              <Text style={styles.detailLabel}>Tanggal: {formatDate(selectedOrder.created_at)}</Text>
              
              <Text style={styles.itemsTitle}>Item Pesanan:</Text>
              {selectedOrder.order_items && selectedOrder.order_items.map((orderItem, index) => (
                <View key={orderItem.id} style={styles.modalOrderItem}>
                  <Image 
                    source={{ uri: `${API_IMAGE_URL}${orderItem.product.image}` }} 
                    style={styles.modalProductImage} 
                  />
                  <View style={styles.modalItemDetails}>
                    <Text style={styles.modalProductName}>
                      {orderItem.product.name}
                    </Text>
                    <Text style={styles.modalProductInfo}>
                      {orderItem.quantity} x Rp {parseFloat(orderItem.price).toLocaleString("id-ID")}
                    </Text>
                    <Text style={styles.modalSubtotalText}>
                      Subtotal: Rp {(parseFloat(orderItem.price) * orderItem.quantity).toLocaleString("id-ID")}
                    </Text>
                  </View>
                </View>
              ))}
              
              <View style={styles.modalFooter}>
                <Text style={styles.modalTotalText}>
                  Total: Rp {parseFloat(selectedOrder.total_amount).toLocaleString("id-ID")}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Memuat riwayat transaksi...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HISTORY</Text>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="history" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Belum ada riwayat transaksi</Text>
          <Text style={styles.emptySubText}>
            Transaksi Anda akan muncul di sini setelah melakukan pembelian
          </Text>
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
              colors={["#007AFF"]}
              tintColor="#007AFF"
            />
          }
        />
      )}
      
      <DetailModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 20,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#888",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: "center",
    color: "#AAA",
    marginTop: 8,
    lineHeight: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  transactionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
  },
  contentContainer: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 0,
    paddingVertical: 4,
    marginRight: 20,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#87CEEB",
    fontWeight: "500",
  },
  chevronContainer: {
    marginLeft: 'auto',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  modalOrderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#F5F5F5',
  },
  modalProductImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
  },
  modalItemDetails: {
    flex: 1,
  },
  modalProductName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  modalProductInfo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  modalSubtotalText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  modalFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: '#E5E5E5',
  },
  modalTotalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    textAlign: 'right',
  },
});