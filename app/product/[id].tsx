import React, { useEffect, useState } from 'react';
import {
    View, Text, Image, StyleSheet, Pressable,
    ActivityIndicator, SafeAreaView, Alert
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';

export default function ProductDetails() {
    const { id } = useLocalSearchParams(); // Get "1" or "2" from URL
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchProductDetails();
    }, [id]);

    const fetchProductDetails = async () => {
        if (!id) return;
        try {
            setLoading(true);
            // SELECT * FROM products WHERE id = [id] LIMIT 1
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setProduct(data);
        } catch (err: any) {
            Alert.alert('Error', 'Could not load product');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <ActivityIndicator style={styles.center} size="large" color="#00B761" />;
    if (!product) return <Text style={styles.center}>Product not found</Text>;

    return (
        <SafeAreaView style={styles.container}>
            {/* 1. Custom Stack Header options just for this screen */}
            <Stack.Screen options={{
                headerTitle: "",
                headerTransparent: true,
                headerLeft: () => (
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </Pressable>
                )
            }} />

            <Image source={{ uri: product.image_url }} style={styles.image} />

            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>{product.name}</Text>
                    <Text style={styles.price}>₦{product.price.toLocaleString()}</Text>
                </View>

                <Text style={styles.categoryBadge}>{product.category}</Text>

                <Text style={styles.descriptionTitle}>Description</Text>
                <Text style={styles.description}>
                    Freshly sourced {product.name.toLowerCase()} directly from the market.
                    Quality guaranteed. Great for Nigerian stews and soups.
                </Text>
            </View>

            {/* Floating Bottom Bar */}
            <View style={styles.footer}>
                <Pressable style={styles.addToCartBtn}>
                    <Text style={styles.btnText}>Add to Cart - ₦{product.price.toLocaleString()}</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    backBtn: { backgroundColor: '#fff', padding: 8, borderRadius: 20, marginLeft: 10 },
    image: { width: '100%', height: 300, resizeMode: 'cover', backgroundColor: '#f0f0f0' },
    content: { padding: 20, flex: 1 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    title: { fontSize: 24, fontWeight: 'bold', flex: 1, marginRight: 10 },
    price: { fontSize: 24, fontWeight: 'bold', color: '#00B761' },
    categoryBadge: { alignSelf: 'flex-start', backgroundColor: '#E8F5E9', color: '#00B761', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, overflow: 'hidden', marginBottom: 20, fontWeight: '600' },
    descriptionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    description: { fontSize: 16, color: '#666', lineHeight: 24 },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee' },
    addToCartBtn: { backgroundColor: '#00B761', padding: 16, borderRadius: 12, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});