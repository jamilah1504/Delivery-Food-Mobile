import React, { useState } from 'react';
import { View, Button, Modal, SafeAreaView, Alert } from 'react-native';
import { WebView } from 'react-native-webview';

// Ganti dengan URL ngrok Anda!
const BACKEND_URL = 'http://127.0.0.1:8000'; 

const PaymentScreen = () => {
  const [snapToken, setSnapToken] = useState('');
  const [showWebView, setShowWebView] = useState(false);

  // Fungsi untuk memanggil backend dan mendapatkan Snap Token
  const createTransaction = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/create-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          amount: 50000, // Contoh jumlah transaksi
          customer_name: 'John Doe',
          customer_email: 'john.doe@example.com',
        }),
      });

      const data = await response.json();

      if (data.snap_token) {
        setSnapToken(data.snap_token);
        setShowWebView(true); // Tampilkan WebView setelah token didapat
      } else {
        Alert.alert('Error', 'Gagal mendapatkan token pembayaran.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Terjadi kesalahan saat membuat transaksi.');
    }
  };

  // Fungsi untuk menangani status navigasi di WebView
  const handleWebViewNavigationStateChange = (newNavState) => {
    const { url } = newNavState;
    if (!url) return;

    // Jika URL mengandung kata 'close', berarti transaksi selesai/ditutup
    if (url.includes('?order_id=') && (url.includes('&status_code=') || url.includes('&transaction_status='))) {
      // Anda bisa mem-parsing URL di sini untuk mendapatkan status detail
      // Contoh: Menampilkan status berdasarkan URL redirect
      if (url.includes('transaction_status=capture') || url.includes('transaction_status=settlement')) {
         Alert.alert('Success', 'Pembayaran Berhasil!');
      } else if (url.includes('transaction_status=pending')) {
         Alert.alert('Pending', 'Pembayaran Tertunda.');
      } else {
         Alert.alert('Failed', 'Pembayaran Gagal.');
      }
      setShowWebView(false);
      setSnapToken('');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Bayar Sekarang (Rp 50.000)" onPress={createTransaction} />
      
      {snapToken ? (
        <Modal
          visible={showWebView}
          onRequestClose={() => setShowWebView(false)}
        >
          <WebView
            source={{ uri: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}` }}
            onNavigationStateChange={handleWebViewNavigationStateChange}
          />
        </Modal>
      ) : null}
    </SafeAreaView>
  );
};

export default PaymentScreen;