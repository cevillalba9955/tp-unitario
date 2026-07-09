import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getOrder, transitionOrder } from '../../api/ordersApi';
import OrderTimeline, { stageLabel, stageColor } from '../../components/OrderTimeline';

const PRIMARY = '#7b1fa2';

export default function BuyerOrderDetailScreen({ route }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrder(await getOrder(orderId));
    } catch {
      setError('No se pudo cargar el pedido.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const act = async (action) => {
    setActing(true);
    try {
      const updated = await transitionOrder(orderId, action);
      setOrder(updated);
    } catch (e) {
      const status = e?.response?.status;
      const msg =
        status === 409
          ? 'La acción ya no es válida para el estado actual del pedido.'
          : status === 403
            ? 'No tenés permiso para esta acción.'
            : 'No se pudo actualizar el pedido.';
      Alert.alert('Error', msg);
    } finally {
      setActing(false);
    }
  };

  const confirmCancel = () => {
    Alert.alert('Cancelar pedido', '¿Seguro que querés cancelar este pedido?', [
      { text: 'No', style: 'cancel' },
      { text: 'Sí, cancelar', style: 'destructive', onPress: () => act('cancel') },
    ]);
  };

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
      </View>
    );
  }

  const snap = order.packageSnapshot;
  const canReview = order.stage === 'EN_REVISION';
  const canCancel = ['PENDIENTE', 'CONFIRMADO', 'EN_REVISION'].includes(order.stage);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{snap.serviceTitle}</Text>
      <View style={styles.snapCard}>
        <Text style={styles.snapPackage}>{snap.packageName}</Text>
        <Text style={styles.snapMeta}>Precio: ${snap.price}</Text>
        <Text style={styles.snapMeta}>Entrega: {snap.deliveryDays} días</Text>
        <View style={[styles.badge, { backgroundColor: stageColor(order.stage) }]}>
          <Text style={styles.badgeText}>{stageLabel(order.stage)}</Text>
        </View>
      </View>

      <OrderTimeline history={order.history} stage={order.stage} />

      {acting && <ActivityIndicator color={PRIMARY} style={{ marginVertical: 8 }} />}

      {canReview && (
        <>
          <TouchableOpacity style={styles.primaryButton} disabled={acting} onPress={() => act('accept_delivery')}>
            <Text style={styles.primaryButtonText}>Aceptar entrega</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} disabled={acting} onPress={() => act('request_changes')}>
            <Text style={styles.secondaryButtonText}>Solicitar cambios</Text>
          </TouchableOpacity>
        </>
      )}

      {canCancel && (
        <TouchableOpacity style={styles.dangerButton} disabled={acting} onPress={confirmCancel}>
          <Text style={styles.dangerButtonText}>Cancelar pedido</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  content: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { fontSize: 20, fontWeight: '800', color: '#1a1a2e', marginBottom: 12 },
  snapCard: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: PRIMARY },
  snapPackage: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  snapMeta: { fontSize: 13, color: '#555' },
  badge: { alignSelf: 'flex-start', backgroundColor: PRIMARY, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, marginTop: 10 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  primaryButton: { backgroundColor: PRIMARY, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryButton: { borderWidth: 1, borderColor: PRIMARY, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  secondaryButtonText: { color: PRIMARY, fontWeight: '700', fontSize: 15 },
  dangerButton: { borderWidth: 1, borderColor: '#c62828', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  dangerButtonText: { color: '#c62828', fontWeight: '700', fontSize: 15 },
  errorText: { fontSize: 15, color: '#c62828', textAlign: 'center' },
});
