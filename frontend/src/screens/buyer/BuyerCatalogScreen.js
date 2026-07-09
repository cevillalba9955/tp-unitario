import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { setToken, getToken } from '../../api/config';
import { getCatalog, getCategories } from '../../api/servicesApi';

const PRIMARY = '#7b1fa2';

export default function BuyerCatalogScreen({ navigation }) {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());

  const handleLogout = useCallback(() => {
    setToken(null);
    setIsLoggedIn(false);
  }, []);

  const handleLogin = useCallback(() => {
    navigation.navigate('BuyerLogin');
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
      headerRight: () =>
        isLoggedIn ? (
          <View style={{ flexDirection: 'row', marginRight: 12, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.navigate('BuyerOrders')} style={{ marginRight: 16 }}>
              <Text style={{ color: '#fff', fontSize: 14 }}>Mis pedidos</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={{ color: '#fff', fontSize: 14 }}>Salir</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={handleLogin} style={{ marginRight: 16 }}>
            <Text style={{ color: '#fff', fontSize: 14 }}>Iniciar sesión</Text>
          </TouchableOpacity>
        ),
    });
  }, [navigation, isLoggedIn, handleLogout, handleLogin]);

  useFocusEffect(
    useCallback(() => {
      setIsLoggedIn(!!getToken());
    }, [])
  );

  const loadData = useCallback(async (categoryId) => {
    setLoading(true);
    setError(null);
    try {
      const [catalogResult, categoriesResult] = await Promise.allSettled([
        getCatalog(categoryId),
        getCategories(),
      ]);

      if (catalogResult.status === 'rejected') {
        throw catalogResult.reason;
      }
      setServices(catalogResult.value);

      if (categoriesResult.status === 'fulfilled') {
        setCategories(categoriesResult.value);
      }
      // Si categories falla, el filtro se oculta pero el catálogo sigue visible
    } catch (e) {
      setError('No se pudo cargar el catálogo. Verificá tu conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(selectedCategory);
  }, [selectedCategory]);

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ServiceDetail', { serviceId: item.id })}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardCategory}>{item.categoryName || 'Sin categoría'}</Text>
      {item.minPrice != null && (
        <Text style={styles.cardPrice}>Desde ${item.minPrice}</Text>
      )}
    </TouchableOpacity>
  );

  const emptyMessage = selectedCategory
    ? 'No hay servicios en esta categoría.'
    : 'Aún no hay servicios disponibles.';

  return (
    <View style={styles.container}>
      {/* Filtro de categorías */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[styles.chip, !selectedCategory && styles.chipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
              onPress={() => handleSelectCategory(cat.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedCategory === cat.id && styles.chipTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      )}

      {!loading && error && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadData(selectedCategory)}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={services.length === 0 ? styles.centered : styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>{emptyMessage}</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  filterRow: { maxHeight: 52, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  filterContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: 'row', alignItems: 'center' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PRIMARY,
    backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: PRIMARY },
  chipText: { color: PRIMARY, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  cardCategory: { fontSize: 13, color: '#666', marginBottom: 6 },
  cardPrice: { fontSize: 14, fontWeight: '700', color: PRIMARY },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 15, color: '#888', textAlign: 'center' },
  errorText: { fontSize: 15, color: '#c62828', textAlign: 'center', marginBottom: 16 },
  retryButton: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
