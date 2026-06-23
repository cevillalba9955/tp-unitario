import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { deleteService, publishService, unpublishService } from '../../api/servicesApi';

export default function ServiceCard({ service, onPress, onRefresh }) {
  const isDraft = service.status === 'DRAFT';

  const handleDelete = () => {
    Alert.alert(
      'Eliminar servicio',
      `¿Eliminar "${service.title || 'Sin título'}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteService(service.id);
              onRefresh();
            } catch (e) {
              Alert.alert('Error', e.response?.data?.message || 'No se pudo eliminar el servicio.');
            }
          },
        },
      ]
    );
  };

  const handlePublish = async () => {
    try {
      await publishService(service.id);
      onRefresh();
    } catch (e) {
      const missing = e.response?.data?.missing?.join(', ') || '';
      Alert.alert('No se puede publicar', `Campos faltantes: ${missing || 'ver detalles'}.`);
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishService(service.id);
      onRefresh();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'No se pudo despublicar.');
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(service)}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {service.title || '(Sin título)'}
        </Text>
        <View style={[styles.badge, isDraft ? styles.draft : styles.published]}>
          <Text style={styles.badgeText}>{isDraft ? 'Borrador' : 'Publicado'}</Text>
        </View>
      </View>

      <Text style={styles.meta}>
        {service.packageCount} paquete{service.packageCount !== 1 ? 's' : ''} ·{' '}
        {service.imageCount} imagen{service.imageCount !== 1 ? 'es' : ''}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btn} onPress={() => onPress(service)}>
          <Text style={styles.btnText}>Editar</Text>
        </TouchableOpacity>

        {isDraft ? (
          <>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handlePublish}>
              <Text style={[styles.btnText, styles.btnPrimaryText]}>Publicar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={handleDelete}>
              <Text style={[styles.btnText, styles.btnDangerText]}>Eliminar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.btn} onPress={handleUnpublish}>
            <Text style={styles.btnText}>Despublicar</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  draft: { backgroundColor: '#fff3e0' },
  published: { backgroundColor: '#e8f5e9' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  meta: { fontSize: 12, color: '#777', marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 },
  btnText: { fontSize: 13, color: '#333' },
  btnPrimary: { backgroundColor: '#1976d2', borderColor: '#1976d2' },
  btnPrimaryText: { color: '#fff' },
  btnDanger: { borderColor: '#e53935' },
  btnDangerText: { color: '#e53935' },
});
