import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, FlatList, Image,
  Pressable, SafeAreaView, StatusBar, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../services/supabase';

export default function HomeScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Fake categories for the Instacart look
  const CATEGORIES = ["All", "Vegetables", "Fruits", "Drinks", "Meat", "Bakery"];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderHeader = () => (
    <View>
      {/* 1. Green Header Area */}
      <View style={styles.greenHeader}>
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={18} color="#fff" />
          <Text style={styles.addressText}>Lekki Phase 1, Lagos</Text>
          <Ionicons name="chevron-down" size={16} color="#fff" style={{ marginLeft: 4 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#333" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stores and products..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* 2. Banner */}
      <View style={styles.bannerContainer}>
        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Order groceries for delivery today.</Text>
            <Text style={styles.bannerSubtitle}>Free delivery on your first order.</Text>
          </View>
          {/* Simple icon for banner */}
          <Ionicons name="basket" size={60} color="#0C3B2E" />
        </View>
      </View>

      {/* 3. Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {CATEGORIES.map((cat, index) => (
          <Pressable key={index} style={[styles.chip, index === 0 && styles.activeChip]}>
            <Text style={[styles.chipText, index === 0 && styles.activeChipText]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Best Sellers in Lekki</Text>
    </View>
  );

  const renderProduct = ({ item }: { item: any }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <Image source={{ uri: item.image_url }} style={styles.cardImage} />

      {/* Floating Plus Button */}
      <Pressable style={styles.quickAddBtn}>
        <Ionicons name="add" size={20} color="#fff" />
      </Pressable>

      <View style={styles.cardContent}>
        <Text style={styles.productPrice}>₦{item.price.toLocaleString()}</Text>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0C3B2E" />
      {loading ? (
        <View style={styles.center}><ActivityIndicator color="#00B761" /></View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.id.toString()}
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header Styles
  greenHeader: {
    backgroundColor: '#0C3B2E',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  addressText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginHorizontal: 5 },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 5, // Android Shadow
    shadowColor: '#000', // iOS Shadow
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  searchInput: { marginLeft: 10, flex: 1, fontSize: 16, color: '#333' },

  // Banner Styles
  bannerContainer: { padding: 20 },
  banner: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerTitle: { fontSize: 18, fontWeight: '800', color: '#0C3B2E', marginBottom: 5 },
  bannerSubtitle: { fontSize: 14, color: '#43B02A', fontWeight: '600' },

  // Category Styles
  categoryScroll: { paddingLeft: 20, marginBottom: 20 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  activeChip: { backgroundColor: '#0C3B2E', borderColor: '#0C3B2E' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#333' },
  activeChipText: { color: '#fff' },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 20, marginBottom: 15, color: '#333' },

  // Grid Styles
  gridRow: { justifyContent: 'space-between', paddingHorizontal: 20 },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 2,
  },
  cardImage: { width: '100%', height: 130, resizeMode: 'contain', marginVertical: 10 },
  quickAddBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#00B761',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cardContent: { padding: 12 },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  productName: { fontSize: 14, color: '#555', marginTop: 4, height: 40 },
});