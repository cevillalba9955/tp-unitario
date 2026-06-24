import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import PackageFormModal from '../../components/services/PackageFormModal';
import { getCategories, createService, publishService } from '../../api/servicesApi';

export default function CreateServiceScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const openAddModal = () => {
    if (packages.length >= 3) return;
    setEditingIndex(null);
    setModalVisible(true);
  };

  const openEditModal = (index) => {
    setEditingIndex(index);
    setModalVisible(true);
  };

  const handleModalConfirm = (pkg) => {
    if (editingIndex !== null) {
      const updated = [...packages];
      updated[editingIndex] = pkg;
      setPackages(updated);
    } else {
      setPackages([...packages, pkg]);
    }
    setModalVisible(false);
  };

  const handleModalCancel = () => setModalVisible(false);

  const removePackage = (index) => {
    setPackages(packages.filter((_, i) => i !== index));
  };

  const buildPayload = () => ({
    title: title.trim(),
    description: description.trim(),
    categoryId: categoryId || null,
    packages: packages.map((p, i) => ({
      name: p.name,
      scope: p.scope,
      price: p.price,
      deliveryDays: p.deliveryDays,
      displayOrder: i + 1,
    })),
  });

  const handleSaveDraft = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = buildPayload();
      await createService(payload);
      navigation.goBack();
    } catch (e) {
      setError(e.response?.data?.message || 'Error al guardar el borrador.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndPublish = async () => {
    setLoading(true);
    setError(null);
    let savedService = null;
    try {
      const payload = buildPayload();
      savedService = await createService(payload);
    } catch (e) {
      setError(e.response?.data?.message || 'Error al guardar el servicio.');
      setLoading(false);
      return;
    }
    try {
      await publishService(savedService.id);
      navigation.goBack();
    } catch (e) {
      const missing = e.response?.data?.missing;
      const message = missing
        ? `Revisá los campos faltantes: ${missing.join(', ')}.`
        : 'Ocurrió un error al publicarlo.';
      Alert.alert('Servicio guardado como borrador', message, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Información del servicio</Text>

      <Text style={styles.label}>Título (max 80 chars)</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        maxLength={80}
        placeholder="ej. Diseño de logo profesional"
      />

      <Text style={styles.label}>Descripción (max 1200 chars)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={description}
        onChangeText={setDescription}
        maxLength={1200}
        multiline
        numberOfLines={5}
        placeholder="Describe tu servicio en detalle..."
      />

      <Text style={styles.label}>Categoría</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={categoryId} onValueChange={setCategoryId}>
          <Picker.Item label="Seleccionar categoría..." value={null} />
          {categories.map((c) => (
            <Picker.Item key={c.id} label={c.name} value={c.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.sectionTitle}>Paquetes de contratación</Text>
      {packages.map((pkg, i) => (
        <View key={i} style={styles.pkgRow}>
          <View style={styles.pkgInfo}>
            <Text style={styles.pkgName}>{pkg.name || `Paquete ${i + 1}`}</Text>
            <Text style={styles.pkgDetail}>${pkg.price} · {pkg.deliveryDays} días</Text>
          </View>
          <View style={styles.pkgActions}>
            <TouchableOpacity onPress={() => openEditModal(i)} style={styles.pkgBtn}>
              <Text style={styles.pkgBtnEdit}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removePackage(i)} style={styles.pkgBtn}>
              <Text style={styles.pkgBtnRemove}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      {packages.length < 3 && (
        <TouchableOpacity style={styles.addPkg} onPress={openAddModal}>
          <Text style={styles.addPkgText}>+ Agregar paquete</Text>
        </TouchableOpacity>
      )}

      <PackageFormModal
        visible={modalVisible}
        initialData={editingIndex !== null ? packages[editingIndex] : null}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={handleSaveDraft} disabled={loading}>
          <Text style={styles.btnSecondaryText}>Guardar borrador</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleSaveAndPublish} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.btnPrimaryText}>Guardar y publicar</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  label: { fontSize: 13, color: '#555', marginBottom: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 12 },
  multiline: { height: 100, textAlignVertical: 'top' },
  pickerContainer: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 12, overflow: 'hidden' },
  addPkg: { borderWidth: 1, borderColor: '#1976d2', borderStyle: 'dashed', borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 12 },
  addPkgText: { color: '#1976d2', fontWeight: '600' },
  pkgRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 8, backgroundColor: '#fff' },
  pkgInfo: { flex: 1 },
  pkgName: { fontWeight: '600', fontSize: 14 },
  pkgDetail: { color: '#777', fontSize: 12, marginTop: 2 },
  pkgActions: { flexDirection: 'row', gap: 8 },
  pkgBtn: { padding: 4 },
  pkgBtnEdit: { color: '#1976d2', fontWeight: '600', fontSize: 13 },
  pkgBtnRemove: { color: '#e53935', fontWeight: '600', fontSize: 13 },
  error: { color: '#e53935', marginBottom: 12, fontSize: 13 },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 8 },
  btn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnSecondary: { borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff' },
  btnSecondaryText: { color: '#333', fontWeight: '600' },
  btnPrimary: { backgroundColor: '#1976d2' },
  btnPrimaryText: { color: '#fff', fontWeight: '600' },
});
