import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
interface User {
  id: number;
}


type CartItem = {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  product: {
    id: number;
    kategori_id: number;
    name: string;
    description: string;
    excerpt: string;
    price: string;
    image: string;
    created_at: string;
    updated_at: string;
    kategori: {
      id: number;
      kategori: string;
      created_at: string;
      updated_at: string;
    };
  };
};

// Custom notification component
type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

export default function Keranjang() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<User | null>(null); // State for user
  
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Show notification function
  const showNotification = (type: NotificationType, title: string, message: string) => {
    const id = Date.now().toString();
    const notification: Notification = { id, type, title, message };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Show confirmation dialog
  const showConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      visible: true,
      title,
      message,
      onConfirm,
    });
  };

  // Hide confirmation dialog
  const hideConfirmDialog = () => {
    setConfirmDialog({
      visible: false,
      title: '',
      message: '',
      onConfirm: () => {},
    });
  };

  // Fetch cart data dari API menggunakan Axios
  const fetchCartData = async () => {
    try {
        const userData = await AsyncStorage.getItem("user");
        const fetchedUser: User | null = userData ? JSON.parse(userData) : null;
        setUser(fetchedUser);
        const response = await axiosInstance.get(`/cart/${fetchedUser?.id}`);
      
      if (response.data && response.data.cart) {
        setCartItems(response.data.cart);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          showNotification('error', 'Error', `Gagal mengambil data keranjang: ${error.response.status}`);
        } else if (error.request) {
          showNotification('error', 'Network Error', 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
        } else {
          showNotification('error', 'Error', 'Terjadi kesalahan saat mengambil data keranjang');
        }
      } else {
        showNotification('error', 'Error', 'Terjadi kesalahan yang tidak diketahui');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data saat komponen pertama kali dimount
  useEffect(() => {
    fetchCartData();
  }, []);

  // Tambah item ke keranjang via API menggunakan Axios
  const addToCart = async (productId: number, quantity: number = 1) => {
    try {
      const response = await axiosInstance.post('/cart', {
        user_id: user?.id,
        product_id: productId,
        quantity: quantity,
      });

      if (response.status === 200 || response.status === 201) {
        await fetchCartData(); // Refresh data setelah menambah item
        showNotification('success', 'Success', 'Item berhasil ditambahkan ke keranjang');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          showNotification('error', 'Error', `Gagal menambahkan item: ${error.response.data.message || 'Unknown error'}`);
        } else {
          showNotification('error', 'Network Error', 'Tidak dapat terhubung ke server');
        }
      } else {
        showNotification('error', 'Error', 'Terjadi kesalahan saat menambahkan item');
      }
    }
  };

  // Update quantity item di keranjang via API menggunakan Axios
  const updateCartItem = async (cartId: number, newQuantity: number) => {
    try {
      const response = await axiosInstance.put(`/cart/${cartId}`, {
        quantity: newQuantity,
      });

      if (response.status === 200) {
        await fetchCartData(); // Refresh data setelah update
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          showNotification('error', 'Error', `Gagal mengupdate item: ${error.response.data.message || 'Unknown error'}`);
        } else {
          showNotification('error', 'Network Error', 'Tidak dapat terhubung ke server');
        }
      } else {
        showNotification('error', 'Error', 'Terjadi kesalahan saat mengupdate item');
      }
    }
  };

  // Hapus item dari keranjang via API menggunakan Axios
  const deleteCartItem = async (cartId: number) => {
    try {
      const response = await axiosInstance.delete(`/cart/${cartId}`);

      if (response.status === 200 || response.status === 204) {
        await fetchCartData(); // Refresh data setelah hapus
        showNotification('success', 'Success', 'Item berhasil dihapus dari keranjang');
      }
    } catch (error) {
      console.error('Error deleting cart item:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          showNotification('error', 'Error', `Gagal menghapus item: ${error.response.data.message || 'Unknown error'}`);
        } else {
          showNotification('error', 'Network Error', 'Tidak dapat terhubung ke server');
        }
      } else {
        showNotification('error', 'Error', 'Terjadi kesalahan saat menghapus item');
      }
    }
  };

  // Fungsi untuk menambah quantity
  const increaseQuantity = (cartId: number, currentQuantity: number) => {
    updateCartItem(cartId, currentQuantity + 1);
  };

  // Fungsi untuk mengurangi quantity
  const decreaseQuantity = (cartId: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateCartItem(cartId, currentQuantity - 1);
    } else {
      // Jika quantity 1, hapus item
      showConfirmDialog(
        'Hapus Item',
        'Apakah Anda yakin ingin menghapus item ini dari keranjang?',
        () => deleteCartItem(cartId)
      );
    }
  };

  // Fungsi untuk menghapus item dengan konfirmasi
  const removeItem = (cartId: number) => {
    showConfirmDialog(
      'Hapus Item',
      'Apakah Anda yakin ingin menghapus item ini dari keranjang?',
      () => deleteCartItem(cartId)
    );
  };

  // Refresh data keranjang
  const onRefresh = () => {
    setRefreshing(true);
    fetchCartData();
  };

  // Hitung total harga
  const totalAmount = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.product.price);
    return sum + (price * item.quantity);
  }, 0);

  // Handle checkout - validasi dan kirim data yang diperlukan
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showNotification('warning', 'Peringatan', 'Keranjang Anda kosong');
      return;
    }

    // Validasi setiap item di keranjang
    const invalidItems = cartItems.filter(item => 
      !item.product || 
      !item.product.name || 
      !item.product.price || 
      item.quantity <= 0
    );

    if (invalidItems.length > 0) {
      showNotification('error', 'Error', 'Ada item yang tidak valid di keranjang');
      return;
    }

    // Prepare checkout data
    const checkoutData = {
      items: cartItems.map(item => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image,
          kategori: {
            id: item.product.kategori.id,
            kategori: item.product.kategori.kategori
          }
        }
      })),
      totalAmount: totalAmount,
      itemCount: cartItems.length,
      summary: {
        subtotal: totalAmount,
        shipping: 0, // Bisa diatur sesuai kebutuhan
        tax: 0, // Bisa diatur sesuai kebutuhan
        total: totalAmount
      }
    };

    try {
      // Navigate to confirmation/checkout page
      router.push({
        pathname: "/property/ConfirmationPayment",
        params: {
          items: JSON.stringify(checkoutData.items),
          totalAmount: totalAmount.toString(),
          itemCount: checkoutData.itemCount.toString(),
          checkoutData: JSON.stringify(checkoutData)
        },
      });
    } catch (error) {
      console.error('Error navigating to checkout:', error);
      showNotification('error', 'Error', 'Gagal menuju halaman checkout');
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FFB337" />
        <Text style={styles.loadingText}>Memuat keranjang...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Notifications */}
      <View style={styles.notificationContainer}>
        {notifications.map((notification) => (
          <View
            key={notification.id}
            style={[
              styles.notification,
              styles[`notification${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}`]
            ]}
          >
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
              style={styles.notificationClose}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Confirmation Dialog */}
      <Modal
        visible={confirmDialog.visible}
        transparent
        animationType="fade"
        onRequestClose={hideConfirmDialog}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmTitle}>{confirmDialog.title}</Text>
            <Text style={styles.confirmMessage}>{confirmDialog.message}</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={hideConfirmDialog}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.deleteButton]}
                onPress={() => {
                  confirmDialog.onConfirm();
                  hideConfirmDialog();
                }}
              >
                <Text style={styles.deleteButtonText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Text style={styles.title}>Keranjang</Text>

      {cartItems.length === 0 ? (
        <View style={[styles.container, styles.centered]}>
          <Ionicons name="cart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Keranjang Anda kosong</Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={onRefresh}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            refreshing={refreshing}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Image 
                  source={{ uri: item.product.image === 'default.jpg' 
                    ? 'https://via.placeholder.com/150' 
                    : item.product.image 
                  }} 
                  style={styles.itemImage} 
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.itemPrice}>
                    Rp. {parseFloat(item.product.price).toLocaleString('id-ID')}
                  </Text>
                  <Text style={styles.itemCategory}>
                    {item.product.kategori.kategori}
                  </Text>
                </View>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    onPress={() => decreaseQuantity(item.id, item.quantity)}
                    style={styles.quantityButton}
                  >
                    <Ionicons name="remove-circle-outline" size={24} color="#555" />
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => increaseQuantity(item.id, item.quantity)}
                    style={styles.quantityButton}
                  >
                    <Ionicons name="add-circle-outline" size={24} color="#555" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() => removeItem(item.id)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle-outline" size={24} color="red" />
                </TouchableOpacity>
              </View>
            )}
          />

          <View style={styles.footer}>
            <View style={styles.footerInfo}>
              <Text style={styles.itemCountText}>
                {cartItems.length} Item{cartItems.length > 1 ? 's' : ''}
              </Text>
              <Text style={styles.totalText}>Total Belanja</Text>
            </View>
            <Text style={styles.totalPrice}>
              Rp. {totalAmount.toLocaleString('id-ID')}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.checkoutButton,
              { opacity: cartItems.length === 0 ? 0.5 : 1 }
            ]}
            onPress={handleCheckout}
            disabled={cartItems.length === 0}
          >
            <Text style={styles.checkoutText}>
              CHECK OUT ({cartItems.length} Item{cartItems.length > 1 ? 's' : ''})
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#161b44",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: "#666",
    textAlign: 'center',
  },
  refreshButton: {
    marginTop: 20,
    backgroundColor: "#FFB337",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#FFB337",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  itemPrice: {
    fontSize: 16,
    color: "#FF7C71",
    marginTop: 2,
  },
  itemCategory: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  quantityButton: {
    padding: 5,
  },
  quantity: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  removeButton: {
    padding: 5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#FFDAB9",
    borderRadius: 10,
    marginTop: 10,
  },
  footerInfo: {
    flex: 1,
  },
  itemCountText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    textAlign: "right",
  },
  checkoutButton: {
    backgroundColor: "#FFB337",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  notificationContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  notificationSuccess: {
    backgroundColor: '#4CAF50',
  },
  notificationError: {
    backgroundColor: '#F44336',
  },
  notificationWarning: {
    backgroundColor: '#FF9800',
  },
  notificationInfo: {
    backgroundColor: '#2196F3',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  notificationMessage: {
    color: '#fff',
    fontSize: 14,
  },
  notificationClose: {
    padding: 4,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmDialog: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    minWidth: 300,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  confirmMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#333',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  deleteButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});