import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {  useRouter } from "expo-router";
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const PaymentSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const router = useRouter();
  
  // Data dari route params (optional)
  const orderData = route.params?.orderData || {};
  const orderId = orderData.order_id || 'ORD-XXXXXXXX';
  const totalAmount = orderData.total_amount || 0;

  // Animation
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.5)).current;

  React.useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBackToHome = () => {
    router.replace('/home');
    // atau jika menggunakan navigation stack reset
    // navigation.reset({
    //   index: 0,
    //   routes: [{ name: 'Home' }],
    // });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Icon name="check" size={60} color="#FFFFFF" />
          </View>
        </View>

        {/* Success Message */}
        <Text style={styles.successTitle}>Pembayaran Berhasil!</Text>
        <Text style={styles.successSubtitle}>
          Terima kasih, pesanan Anda telah berhasil diproses
        </Text>

        {/* Order Details */}
        <View style={styles.orderDetailsContainer}>
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderDetailLabel}>Order ID:</Text>
            <Text style={styles.orderDetailValue}>{orderId}</Text>
          </View>
          
          {totalAmount > 0 && (
            <View style={styles.orderDetailRow}>
              <Text style={styles.orderDetailLabel}>Total Pembayaran:</Text>
              <Text style={styles.orderDetailValueAmount}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>
          )}
          
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderDetailLabel}>Status:</Text>
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>Berhasil</Text>
            </View>
          </View>
          
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderDetailLabel}>Waktu:</Text>
            <Text style={styles.orderDetailValue}>
              {new Date().toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.infoContainer}>
          <Icon name="info-outline" size={20} color="#666" />
          <Text style={styles.infoText}>
            Konfirmasi pesanan akan dikirim melalui email dan WhatsApp
          </Text>
        </View>
      </Animated.View>

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={handleBackToHome}
          activeOpacity={0.8}
        >
          <Icon name="home" size={24} color="#FFFFFF" />
          <Text style={styles.homeButtonText}>Kembali ke Beranda</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.orderButton}
          onPress={() => navigation.navigate('OrderHistory')}
          activeOpacity={0.8}
        >
          <Icon name="receipt-long" size={24} color="#4CAF50" />
          <Text style={styles.orderButtonText}>Lihat Pesanan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  orderDetailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderDetailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  orderDetailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  orderDetailValueAmount: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  statusContainer: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  homeButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  orderButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  orderButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default PaymentSuccessScreen;