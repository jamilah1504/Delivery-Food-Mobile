import React, { useState, useEffect } from 'react';
import axios from 'axios';

// =================================================================================
// 1. KONFIGURASI API & TIPE DATA (WAJIB DISESUAIKAN)
// =================================================================================

// Ganti dengan URL backend Anda yang sesungguhnya
const API_BASE_URL = 'http://127.0.0.1:8000/api'; 
const IMAGE_BASE_URL = 'http://127.0.0.1:8000/storage/';

// Konfigurasi instance axios
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    // headers: { 'Authorization': 'Bearer YOUR_AUTH_TOKEN' }
});

// Interface untuk data mentah dari API
interface Product {
    id: number;
    name: string;
    image: string;
}

interface OrderDetail {
    product: Product;
}

interface Order {
    id: string; // "ORDER-..."
    total_amount: string;
    created_at: string;
}

// Interface untuk data yang sudah bersih dan siap ditampilkan
interface DisplayCardData {
    id: string; // Menggunakan order ID sebagai key unik
    imageUrl: string;
    title: string;
    date: string;
    price: string;
}

// =================================================================================
// 2. FUNGSI HELPERS (Diletakkan di luar komponen agar tidak dibuat ulang)
// =================================================================================

const getOrders = async (userId: number): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>(`/order/${userId}`);
    return response.data;
};

const getOrderDetails = async (orderId: string): Promise<OrderDetail[]> => {
    const response = await apiClient.get<OrderDetail[]>(`/order-detail/${orderId}`);
    return response.data;
};

const formatOrderDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
    };
    return new Intl.DateTimeFormat('id-ID', options).format(date).replace('.',':');
};

const formatCurrency = (amount: string): string => {
    const number = parseFloat(amount);
    return new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR',
        minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(number).replace('Rp', 'Rp. ');
};


// =================================================================================
// 3. SUB-KOMPONEN UNTUK KARTU PESANAN (Best Practice)
// =================================================================================

interface OrderCardProps {
    order: DisplayCardData;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => (
    <div className="order-card">
        <img src={order.imageUrl} alt={order.title} onError={(e) => (e.currentTarget.style.display = 'none')} />
        <div className="order-details">
            <h3>{order.title}</h3>
            <p className="date">{order.date}</p>
            <p className="price">{order.price}</p>
            <div className="order-actions">
                <button className="action-button rating">Rating</button>
                <button className="action-button reorder">Pesan Ulang</button>
            </div>
        </div>
    </div>
);


// =================================================================================
// 4. KOMPONEN UTAMA (OrderHistoryPage)
// =================================================================================

const OrderHistoryPage: React.FC = () => {
    // State untuk mengelola data, status loading, dan error
    const [orders, setOrders] = useState<DisplayCardData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // useEffect untuk mengambil data saat komponen pertama kali dimuat
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = 1; // ID pengguna bisa didapat dari state, context, atau props
                const rawOrders = await getOrders(userId);

                const displayPromises = rawOrders.map(async (order) => {
                    const details = await getOrderDetails(order.id);
                    if (details.length === 0) return null;

                    const firstItem = details[0];
                    const title = details.length > 1
                        ? `${firstItem.product.name} & ${details.length - 1} Lainnya`
                        : firstItem.product.name;

                    return {
                        id: order.id,
                        imageUrl: `${IMAGE_BASE_URL}${firstItem.product.image}`,
                        title: title,
                        date: formatOrderDate(order.created_at),
                        price: formatCurrency(order.total_amount),
                    };
                });

                const processedOrders = (await Promise.all(displayPromises)).filter(Boolean) as DisplayCardData[];
                setOrders(processedOrders);

            } catch (err) {
                setError('Gagal memuat riwayat pesanan. Silakan coba lagi.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Array dependensi kosong agar hanya berjalan sekali

    // Fungsi untuk merender konten utama berdasarkan state
    const renderContent = () => {
        if (loading) {
            return <p style={{ textAlign: 'center' }}>Memuat riwayat...</p>;
        }
        if (error) {
            return <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>;
        }
        if (orders.length === 0) {
            return <p style={{ textAlign: 'center' }}>Tidak ada riwayat pesanan.</p>;
        }
        return orders.map(order => <OrderCard key={order.id} order={order} />);
    };

    return (
        <div className="history-container">
            <header className="history-header">
                <button className="back-button" onClick={() => alert('Kembali')}>&#x2190;</button>
                <h1>HISTORY</h1>
            </header>
            <main className="order-list">
                {renderContent()}
            </main>
        </div>
    );
};

export default OrderHistoryPage;