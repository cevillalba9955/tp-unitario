import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ServiceCard from '../../components/services/ServiceCard';
import { getMyServices } from '../../api/servicesApi';
import { setToken } from '../../api/config';

const TABS = [
  { key: 'PUBLISHED', label: 'Publicados' },
  { key: 'DRAFT', label: 'Borradores' },
];

export default function MyServicesScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('PUBLISHED');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = () => {
    setToken(null);
    navigation.replace('Login');
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
          <Text style={{ color: '#1976d2', fontSize: 14 }}>Cerrar sesión</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const loadServices = useCallback(async () => {
    try {
      const result = await getMyServices({ status: activeTab, limit: 50 });
      setServices(result.data);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadServices();
    }, [loadServices])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadServices();
  };

  const handleCardPress = (service) => {
    navigation.navigate('CreateService', { serviceId: service.id });
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => {
              setActiveTab(tab.key);
              setLoading(true);
            }}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceCard service={item} onPress={handleCardPress} onRefresh={handleRefresh} />
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {activeTab === 'PUBLISHED' ? 'No tenés servicios publicados aún.' : 'No tenés borradores.'}
            </Text>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateService')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#ddd' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#1976d2' },
  tabText: { fontSize: 14, color: '#777' },
  tabTextActive: { color: '#1976d2', fontWeight: '700' },
  list: { padding: 12 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 14 },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#1976d2', alignItems: 'center', justifyContent: 'center',
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
});
