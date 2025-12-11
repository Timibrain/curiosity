import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { supabase } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function OrderTracking() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [order, setOrder] = useState<any>(null);

    useEffect(() => {
        fetchOrder();

        // --- REALTIME LISTENER ---
        const channel = supabase
            .channel(`tracking:${id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `id=eq.${id}` // Only listen to THIS order
                },
                (payload) => {
                    console.log("Status Changed!", payload.new);
                    setOrder(payload.new); // Update the screen instantly
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [id]);

    const fetchOrder = async () => {
        const { data } = await supabase.from('orders').select('*').eq('id', id).single();
        setOrder(data);
    };

    if (!order) return <ActivityIndicator style={styles.center} color="#00B761" />;

    // PROGRESS LOGIC
    const getProgress = () => {
        if (order.status === 'PENDING') return 0.1;
        if (order.status === 'ACCEPTED') return 0.5;
        if (order.status === 'DELIVERED') return 1.0;
        return 0;
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Track Order', headerBackTitle: 'Shop' }} />

            {/* 1. STATUS HEADER */}
            <View style={styles.statusBox}>
                <Text style={styles.statusTitle}>
                    {order.status === 'PENDING' ? 'Looking for a Runner...' :
                        order.status === 'ACCEPTED' ? 'Runner is on the way!' :
                            'Order Delivered!'}
                </Text>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { flex: getProgress() }]} />
                </View>
            </View>

            {/* 2. MAP PLACEHOLDER (Static for now) */}
            <View style={styles.mapArea}>
                <Image
                    source={{ uri: 'https://img.freepik.com/free-vector/city-map-navigation-background-with-pins_23-2148753856.jpg' }}
                    style={styles.mapImage}
                />
                <View style={styles.riderPin}>
                    <Text style={{ fontSize: 30 }}>🛵</Text>
                </View>
            </View>

            {/* 3. ORDER DETAILS */}
            <View style={styles.details}>
                <Text style={styles.detailTitle}>Your Order #{order.id}</Text>
                <Text style={styles.detailText}>{order.items?.length} Items • ₦{order.total_price}</Text>
                <Text style={styles.detailText}>📍 {order.delivery_address}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    statusBox: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
    statusTitle: { fontSize: 20, fontWeight: 'bold', color: '#00B761', marginBottom: 15, textAlign: 'center' },
    progressBar: { height: 6, backgroundColor: '#eee', borderRadius: 3, flexDirection: 'row', overflow: 'hidden' },
    progressFill: { backgroundColor: '#00B761', height: '100%' },

    mapArea: { height: 300, position: 'relative' },
    mapImage: { width: '100%', height: '100%' },
    riderPin: { position: 'absolute', top: '40%', left: '45%', backgroundColor: '#fff', padding: 5, borderRadius: 20, elevation: 5 },

    details: { padding: 20 },
    detailTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    detailText: { fontSize: 16, color: '#666', marginBottom: 5 },
});