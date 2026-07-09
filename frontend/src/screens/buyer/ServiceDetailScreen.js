import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
import { getService, getCategories } from '../../api/servicesApi';
import { API_BASE_URL, getToken } from '../../api/config';
import { createOrder } from '../../api/ordersApi';

const PRIMARY = '#7b1fa2';

function ImageCarousel({ images }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View style={carouselStyles.wrapper}>
      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <Image
            source={{ uri: `${API_BASE_URL}${item.imageUrl}` }}
            style={carouselStyles.image}
            resizeMode="cover"
          />
        )}
      />
      {images.length > 1 && (
        <View style={carouselStyles.dots}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[carouselStyles.dot, i === activeIndex && carouselStyles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const carouselStyles = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  image: { width: SCREEN_WIDTH - 40, height: 300, borderRadius: 10 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 8, gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ccc' },
  dotActive: { backgroundColor: PRIMARY, width: 18 },
});

export default function ServiceDetailScreen({ route, navigation }) {
  const { serviceId } = route.params;
  const [service, setService] = useState(null);
  const [categoryName, setCategoryName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contratandoId, setContratandoId] = useState(null);

  // US1: contratar un paquete. Sin sesión, dirige al login del comprador.
  const handleContratar = async (pkg) => {
    if (!getToken()) {
      navigation.navigate('BuyerLogin');
      return;
    }
    setContratandoId(pkg.id);
    try {
      await createOrder(serviceId, pkg.id);
      Alert.alert(
        'Pedido creado',
        `Contrataste "${pkg.name}". Podés seguir su estado en Mis pedidos.`,
        [
          { text: 'Ver mis pedidos', onPress: () => navigation.navigate('BuyerOrders') },
          { text: 'Seguir viendo', style: 'cancel' },
        ]
      );
    } catch (e) {
      const status = e?.response?.status;
      const msg =
        status === 403
          ? 'No podés contratar tus propios servicios.'
          : status === 409
            ? 'Este servicio ya no está disponible.'
            : 'No se pudo crear el pedido. Intentá de nuevo.';
      Alert.alert('Error', msg);
    } finally {
      setContratandoId(null);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [svc, categories] = await Promise.all([
          getService(serviceId),
          getCategories(),
        ]);
        setService(svc);
        if (svc.categoryId) {
          const cat = categories.find((c) => c.id === svc.categoryId);
          setCategoryName(cat ? cat.name : null);
        }
      } catch (err) {
        // FR-013: un 404 significa que el servicio fue despublicado o ya no existe;
        // se oculta como "no disponible" en lugar de un error genérico de carga.
        if (err?.response?.status === 404) {
          setError('Servicio no disponible. Puede haber sido despublicado o ya no existe.');
        } else {
          setError('No se pudo cargar el detalle del servicio.');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [serviceId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Volver al catálogo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{service.title}</Text>
      {categoryName && <Text style={styles.category}>{categoryName}</Text>}
      <Text style={styles.description}>{service.description}</Text>

      {service.images && service.images.length > 0 && (
        <ImageCarousel images={service.images} />
      )}

      {service.packages && service.packages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paquetes disponibles</Text>
          {service.packages.map((pkg) => (
            <View key={pkg.id} style={styles.packageCard}>
              <View style={styles.packageHeader}>
                <Text style={styles.packageName}>{pkg.name}</Text>
                <Text style={styles.packagePrice}>${pkg.price}</Text>
              </View>
              <Text style={styles.packageScope}>{pkg.scope}</Text>
              <Text style={styles.packageDelivery}>Entrega: {pkg.deliveryDays} días</Text>
              <TouchableOpacity
                style={[styles.contractButton, contratandoId === pkg.id && styles.contractButtonDisabled]}
                onPress={() => handleContratar(pkg)}
                disabled={contratandoId !== null}
              >
                <Text style={styles.contractButtonText}>
                  {contratandoId === pkg.id ? 'Contratando…' : 'Contratar'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', marginBottom: 6 },
  category: { fontSize: 13, color: PRIMARY, fontWeight: '600', marginBottom: 12 },
  description: { fontSize: 15, color: '#444', lineHeight: 22, marginBottom: 20 },
  imageRow: { marginBottom: 20 },
  image: { width: 200, height: 140, borderRadius: 8, marginRight: 10 },
  section: { marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a2e', marginBottom: 12 },
  packageCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  packageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  packageName: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  packagePrice: { fontSize: 15, fontWeight: '700', color: PRIMARY },
  packageScope: { fontSize: 13, color: '#555', marginBottom: 4 },
  packageDelivery: { fontSize: 12, color: '#888' },
  contractButton: { marginTop: 10, backgroundColor: PRIMARY, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  contractButtonDisabled: { opacity: 0.6 },
  contractButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  errorText: { fontSize: 15, color: '#c62828', textAlign: 'center' },
  backButton: {
    marginTop: 20,
    backgroundColor: PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
