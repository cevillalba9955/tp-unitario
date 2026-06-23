import React from 'react';
import {
  View, Text, Image, TouchableOpacity,
  FlatList, Alert, StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage, deleteImage } from '../../api/servicesApi';
import { API_BASE_URL } from '../../api/config';

const MAX_IMAGES = 5;

export default function ImageGallery({ serviceId, images, onChange }) {
  const handleAdd = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para subir imágenes.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    try {
      const uploaded = await uploadImage(serviceId, asset.uri, asset.mimeType || 'image/jpeg');
      onChange([...images, uploaded]);
    } catch (e) {
      const msg = e.response?.data?.message || 'Error al subir la imagen.';
      Alert.alert('Error de subida', msg);
    }
  };

  const handleDelete = (image) => {
    Alert.alert('Eliminar imagen', '¿Eliminar esta imagen del servicio?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteImage(serviceId, image.id);
            onChange(images.filter((i) => i.id !== image.id));
          } catch (e) {
            Alert.alert('Error', e.response?.data?.message || 'No se pudo eliminar la imagen.');
          }
        },
      },
    ]);
  };

  return (
    <View>
      <FlatList
        data={images}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: `${API_BASE_URL}${item.imageUrl}` }}
              style={styles.image}
            />
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
              <Text style={styles.deleteBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          images.length < MAX_IMAGES ? (
            <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
              <Text style={styles.addBtnText}>+</Text>
              <Text style={styles.addBtnLabel}>Agregar</Text>
            </TouchableOpacity>
          ) : null
        }
        contentContainerStyle={styles.list}
      />
      <Text style={styles.counter}>
        {images.length}/{MAX_IMAGES} imágenes (JPG, PNG, WebP · max 5 MB c/u)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 8, gap: 8 },
  imageWrapper: { width: 90, height: 90, marginRight: 8, position: 'relative' },
  image: { width: 90, height: 90, borderRadius: 8, backgroundColor: '#eee' },
  deleteBtn: {
    position: 'absolute', top: -6, right: -6,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#e53935', alignItems: 'center', justifyContent: 'center',
  },
  deleteBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  addBtn: {
    width: 90, height: 90, borderRadius: 8, borderWidth: 2,
    borderColor: '#1976d2', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { fontSize: 28, color: '#1976d2', lineHeight: 32 },
  addBtnLabel: { fontSize: 11, color: '#1976d2' },
  counter: { fontSize: 11, color: '#888', marginTop: 4 },
});
