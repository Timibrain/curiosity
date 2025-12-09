import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase'; // Import the connection we made

export default function HomeScreen() {
  const [products, setProducts] = useState<any[]>([]); // Store data from DB
  const [loading, setLoading] = useState(true); // Show spinner while loading

  // --- 1. FETCH DATA FROM SUPABASE ---
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // "SELECT * FROM products"
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) {
        Alert.alert('Error fetching data', error.message);
      } else {
        setProducts(data || []);
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // --- 2. COMPONENTS ---
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.location}>📍 Lekki Phase 1, Lagos</Text>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={{ marginRight: 10 }} />
        <TextInput style={styles.input} placeholder="Search database..." />
      </View>
      <Text style={styles.sectionTitle}>Fresh from Database</Text>
    </View>
  );

  const renderProduct = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image_url }} // Note: Supabase column name is image_url
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>₦{item.price.toLocaleString()}</Text>
        <Pressable style={styles.addBtn}>
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      </View>
    </View>
  );

  // --- 3. LOADING STATE ---
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00B761" />
        <Text>Loading Market...</Text>
      </View>
    );
  }

  // --- 4. MAIN RENDER ---
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderHeader}
        refreshing={loading}
        onRefresh={fetchProducts} // Pull down to reload!
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: { padding: 20, backgroundColor: '#fff', marginBottom: 10 },
  location: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  searchContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', padding: 12, borderRadius: 12 },
  input: { flex: 1, fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 15 },
  row: { justifyContent: 'space-between', paddingHorizontal: 20 },
  card: { backgroundColor: '#fff', width: '48%', borderRadius: 12, marginBottom: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
  cardImage: { width: '100%', height: 120, backgroundColor: '#eee' },
  cardContent: { padding: 10 },
  productName: { fontSize: 14, fontWeight: '600', height: 40 },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  addBtn: { borderWidth: 1, borderColor: '#00B761', borderRadius: 6, paddingVertical: 4, alignItems: 'center' },
  addBtnText: { color: '#00B761', fontSize: 12, fontWeight: 'bold' },
});