import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, StyleSheet, Banner,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import PackageForm from '../../components/services/PackageForm';
import ImageGallery from '../../components/services/ImageGallery';
import { getService, getCategories, updateService, publishService, unpublishService } from '../../api/servicesApi';

const emptyPackage = () => ({ name: '', scope: '', price: '', deliveryDays: '' });

export default function EditServiceScreen({ route, navigation }) {
  const { serviceId } = route.params;

  const [service, setService] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([emptyPackage()]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [autoUnpublished, setAutoUnpublished] = useState(false);

  useEffect(() => {
    Promise.all([getService(serviceId), getCategories()])
      .then(([svc, cats]) => {
        setService(svc);
        setTitle(svc.title || '');
        setDescription(svc.description || '');
        setCategoryId(svc.categoryId);
        setPackages(
          svc.packages.length > 0
            ? svc.packages.map((p) => ({ ...p, price: String(p.price), deliveryDays: String(p.deliveryDays) }))
            : [emptyPackage()]
        );
        setImages(svc.images || []);
        setCategories(cats);
      })
      .catch(() => Alert.alert('Error', 'No se pudo cargar el servicio.'))
      .finally(() => setLoading(false));
  }, [serviceId]);

  const updatePackage = (i, v) => {
    const updated = [...packages];
    updated[i] = v;
    setPackages(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setAutoUnpublished(false);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        packages: packages.map((p, i) => ({
          ...(p.id ? { id: p.id } : {}),
          name: p.name,
          scope: p.scope,
          price: parseFloat(p.price),
          deliveryDays: parseInt(p.deliveryDays),
          displayOrder: i + 1,
        })),
      };

      const response = await updateService(serviceId, payload);
      if (response.headers?.['x-auto-unpublished'] === 'true') {
        setAutoUnpublished(true);
      }
      setService(response.data);
      Alert.alert('Guardado', 'Los cambios se guardaron correctamente.');
    } catch (e) {
      setError(e.response?.data?.message || 'Error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishError(null);
    try {
      await publishService(serviceId);
      setService((s) => ({ ...s, status: 'PUBLISHED' }));
      setAutoUnpublished(false);
    } catch (e) {
      const missing = e.response?.data?.missing;
      setPublishError(
        missing
          ? `El servicio permanece como borrador. Campos faltantes: ${missing.join(', ')}.`
          : `El servicio permanece como borrador. ${e.response?.data?.message || 'Error al intentar publicar el servicio.'}`
      );
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishService(serviceId);
      setService((s) => ({ ...s, status: 'DRAFT' }));
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Error al despublicar.');
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 60 }} size="large" />;

  const isDraft = service?.status === 'DRAFT';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {autoUnpublished && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            ⚠️ El servicio fue despublicado automáticamente porque ya no cumple los requisitos mínimos.
          </Text>
        </View>
      )}

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Estado:</Text>
        <Text style={[styles.statusValue, isDraft ? styles.draft : styles.published]}>
          {isDraft ? 'Borrador' : 'Publicado'}
        </Text>
        {isDraft ? (
          <TouchableOpacity style={styles.statusBtn} onPress={handlePublish}>
            <Text style={styles.statusBtnText}>Publicar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.statusBtn} onPress={handleUnpublish}>
            <Text style={styles.statusBtnText}>Despublicar</Text>
          </TouchableOpacity>
        )}
      </View>

      {publishError ? (
        <Text style={styles.publishError}>{publishError}</Text>
      ) : null}

      <Text style={styles.sectionTitle}>Información del servicio</Text>

      <Text style={styles.label}>Título (max 80 chars)</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        maxLength={80}
      />

      <Text style={styles.label}>Descripción (max 1200 chars)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={description}
        onChangeText={setDescription}
        maxLength={1200}
        multiline
        numberOfLines={5}
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
          onRemove={() => setPackages(packages.filter((_, idx) => idx !== i))}
        />
      ))}
      {packages.length < 3 && (
        <TouchableOpacity style={styles.addPkg} onPress={() => setPackages([...packages, emptyPackage()])}>
          <Text style={styles.addPkgText}>+ Agregar paquete</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>Multimedia</Text>
      <ImageGallery serviceId={serviceId} images={images} onChange={setImages} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.saveBtnText}>Guardar cambios</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 40 },
  banner: { backgroundColor: '#fff3e0', borderRadius: 8, padding: 12, marginBottom: 12 },
  bannerText: { color: '#e65100', fontSize: 13 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  statusLabel: { fontSize: 14, color: '#555' },
  statusValue: { fontSize: 14, fontWeight: '700', flex: 1 },
  draft: { color: '#f57c00' },
  published: { color: '#388e3c' },
  statusBtn: { borderWidth: 1, borderColor: '#1976d2', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 4 },
  statusBtnText: { color: '#1976d2', fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  label: { fontSize: 13, color: '#555', marginBottom: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 12 },
  multiline: { height: 100, textAlignVertical: 'top' },
  pickerContainer: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 12, overflow: 'hidden' },
  addPkg: { borderWidth: 1, borderColor: '#1976d2', borderStyle: 'dashed', borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 12 },
  addPkgText: { color: '#1976d2', fontWeight: '600' },
  error: { color: '#e53935', marginBottom: 12, fontSize: 13 },
  publishError: { color: '#e53935', backgroundColor: '#fdecea', borderRadius: 6, padding: 10, marginBottom: 12, fontSize: 13 },
  saveBtn: { backgroundColor: '#1976d2', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
