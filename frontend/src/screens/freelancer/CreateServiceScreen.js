import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import PackageForm from '../../components/services/PackageForm';
import { getCategories, createService, publishService } from '../../api/servicesApi';

const emptyPackage = () => ({ name: '', scope: '', price: '', deliveryDays: '' });

export default function CreateServiceScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([emptyPackage()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const updatePackage = (index, value) => {
    const updated = [...packages];
    updated[index] = value;
    setPackages(updated);
  };

  const addPackage = () => {
    if (packages.length < 3) setPackages([...packages, emptyPackage()]);
  };

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
      price: parseFloat(p.price),
      deliveryDays: parseInt(p.deliveryDays),
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
    try {
      const payload = buildPayload();
      const service = await createService(payload);
      await publishService(service.id);
      navigation.goBack();
    } catch (e) {
      const missing = e.response?.data?.missing;
      setError(
        missing
          ? `No se puede publicar. Campos faltantes: ${missing.join(', ')}.`
          : e.response?.data?.message || 'Error al publicar.'
      );
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
        <PackageForm
          key={i}
          index={i}
          value={pkg}
          onChange={(v) => updatePackage(i, v)}
          onRemove={() => removePackage(i)}
        />
      ))}
      {packages.length < 3 && (
        <TouchableOpacity style={styles.addPkg} onPress={addPackage}>
          <Text style={styles.addPkgText}>+ Agregar paquete</Text>
        </TouchableOpacity>
      )}

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
  error: { color: '#e53935', marginBottom: 12, fontSize: 13 },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 8 },
  btn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnSecondary: { borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff' },
  btnSecondaryText: { color: '#333', fontWeight: '600' },
  btnPrimary: { backgroundColor: '#1976d2' },
  btnPrimaryText: { color: '#fff', fontWeight: '600' },
});
