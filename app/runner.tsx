import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../services/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function RunnerScreen() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingOrders();

        // --- REALTIME MAGIC ---
        // This listens for NEW orders instantly!
        const channel = supabase
            .channel('realtime:orders')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                (payload) => {
                    // When a new order comes in, add it to the top of the list
                    console.log('New Order Received!', payload.new);
                    setOrders((currentOrders) => [payload.new, ...currentOrders]);
                    Alert.alert('New Job!', 'A new order just arrived.');
                }
            )
            .subscribe();

        // Cleanup when leaving the screen
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchPendingOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('status', 'PENDING') // Only show jobs nobody has taken yet
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (err: any) {
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const acceptOrder = async (orderId: string) => {
        // 1. Mark the order as ACCEPTED and assign it to "Runner_1"
        const { error } = await supabase
            .from('orders')
            .update({ status: 'ACCEPTED', runner_id: 'Runner_1' })
            .eq('id', orderId);

        if (error) {
            Alert.alert('Error', 'Could not accept order.');
        } else {
            Alert.alert('Success', 'You accepted this job! Go pick it up.');
            // Remove it from the "Pending" list locally
            setOrders(orders.filter(o => o.id !== orderId));
        }
    };

    const renderOrder = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.time}>Job #{item.id}</Text>
                <Text style={styles.earnings}>₦{item.delivery_fee} Earnings</Text>
            </View>

            <Text style={styles.address}>📍 {item.delivery_address}</Text>

            <View style={styles.itemsContainer}>
                {item.items.map((food: any, index: number) => (
                    <Text key={index} style={styles.itemText}>• {food.quantity}x {food.name}</Text>
                ))}
            </View>

            <Pressable
                style={styles.acceptBtn}
                onPress={() => acceptOrder(item.id)}
            >
                <Text style={styles.btnText}>ACCEPT JOB</Text>
            </Pressable>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.title}>Runner Dashboard 🛵</Text>
                <View style={styles.statusBadge}>
                    <View style={styles.greenDot} />
                    <Text style={styles.statusText}>Online</Text>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#00B761" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderOrder}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={<Text style={styles.emptyText}>No pending orders. Rest for now.</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f4', paddingTop: 50 },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center', marginBottom: 10 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e6fffa', padding: 8, borderRadius: 20 },
    greenDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#00B761', marginRight: 6 },
    statusText: { color: '#00B761', fontWeight: 'bold' },

    card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 15, elevation: 2 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    time: { color: '#999', fontWeight: '600' },
    earnings: { color: '#00B761', fontWeight: 'bold', fontSize: 16 },
    address: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    itemsContainer: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, marginBottom: 15 },
    itemText: { fontSize: 14, color: '#555', marginBottom: 4 },

    acceptBtn: { backgroundColor: '#000', padding: 15, borderRadius: 10, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 },
});