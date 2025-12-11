import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';
import { useRouter } from 'expo-router';

export default function CartScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    
    const cartItems = [
        {
            id: '1',
            name: 'Titus Fish (Frozen)',
            price: 4500,
            quantity: 2,
            image: 'https://img.freepik.com/free-photo/fresh-fish-market_144627-26889.jpg'
        },
        {
            id: '2',
            name: 'Indomie Super Pack',
            price: 12500,
            quantity: 1,
            image: 'https://guardian.ng/wp-content/uploads/2022/05/Indomie.jpg'
        }
    ];

    // Calculate Totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 500;
    const total = subtotal + deliveryFee;

    // 2. CHECKOUT FUNCTION
    const handleCheckout = async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from('orders')
            .insert({
                user_id: 'Student_Guest_01',
                status: 'PENDING',
                total_price: total,
                delivery_fee: deliveryFee,
                delivery_address: 'Moremi Hall, Block C, Room 205',
                items: cartItems,
            })
            .select() 
            .single();

        if (!error && data) {
            router.push(`/tracking/${data.id}`);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>My Cart</Text>

           
            <Pressable
                onPress={() => router.push('/runner')}
                style={styles.runnerBtn}
            >
                <Text style={styles.runnerBtnText}>🛵 Switch to Runner Mode</Text>
            </Pressable>

            <FlatList
                data={cartItems}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.itemRow}>
                        <Image source={{ uri: item.image }} style={styles.itemImage} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemPrice}>₦{item.price.toLocaleString()}</Text>
                        </View>
                        <Text style={styles.quantity}>x{item.quantity}</Text>
                    </View>
                )}
            />

          
            <View style={styles.footer}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryText}>Subtotal</Text>
                    <Text style={styles.summaryValue}>₦{subtotal.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryText}>Delivery Fee</Text>
                    <Text style={styles.summaryValue}>₦{deliveryFee}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalText}>Total</Text>
                    <Text style={styles.totalValue}>₦{total.toLocaleString()}</Text>
                </View>

                <Pressable
                    style={styles.checkoutBtn}
                    onPress={handleCheckout}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.btnText}>Checkout • ₦{total.toLocaleString()}</Text>
                    )}
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, marginTop: 40 },

    runnerBtn: { backgroundColor: '#333', padding: 12, borderRadius: 8, marginBottom: 20 },
    runnerBtnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },

    itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 15, backgroundColor: '#eee' },
    itemName: { fontSize: 16, fontWeight: '600' },
    itemPrice: { fontSize: 14, color: '#666', marginTop: 4 },
    quantity: { fontSize: 16, fontWeight: 'bold', marginLeft: 10 },

    footer: { marginTop: 'auto', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    summaryText: { color: '#666', fontSize: 16 },
    summaryValue: { fontSize: 16, fontWeight: '600' },
    totalRow: { marginTop: 10, marginBottom: 20 },
    totalText: { fontSize: 20, fontWeight: 'bold' },
    totalValue: { fontSize: 20, fontWeight: 'bold', color: '#00B761' },
    checkoutBtn: { backgroundColor: '#00B761', padding: 18, borderRadius: 12, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});