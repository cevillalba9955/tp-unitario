import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  Modal, Pressable,
  KeyboardAvoidingView, Platform,
  ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import PackageForm from '../../components/services/PackageForm';
import PackageFormModal from '../../components/services/PackageFormModal';
import ImageGallery from '../../components/services/ImageGallery';
import {
  getCategories,
  getService,
  createService,
  updateService,
  publishService,
  unpublishService,
} from '../../api/servicesApi';

const emptyPackage = () => ({ name: '', scope: '', price: '', deliveryDays: '' });

export default function CreateServiceScreen({ route, navigation }) {
  const descriptionInputRef = useRef(null);
  const [serviceId, setServiceId] = useState(route?.params?.serviceId);
  const isEditing = Boolean(serviceId);
  
  const [service, setService] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState(isEditing ? [emptyPackage()] : []);
  const [images, setImages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [categorySelectVisible, setCategorySelectVisible] = useState(false);
  const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [autoUnpublished, setAutoUnpublished] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Editar Servicio' : 'Nuevo Servicio' });
  }, [isEditing, navigation]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const cats = await getCategories();
        if (!mounted) return;
        setCategories(cats);

        if (!isEditing) {
          setLoading(false);
          return;
        }

        const svc = await getService(serviceId);
        if (!mounted) return;

        setService(svc);
        setTitle(svc.title || '');
        setDescription(svc.description || '');
        setCategoryId(svc.categoryId ?? null);
        setPackages(
          svc.packages?.length > 0
            ? svc.packages.map((pkg) => ({
                ...pkg,
                price: String(pkg.price),
                deliveryDays: String(pkg.deliveryDays),
              }))
              :[]
            // : [emptyPackage()]
        );
        setImages(svc.images || []);
      } catch {
        if (mounted) {
          Alert.alert('Error', 'No se pudo cargar la información del servicio.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [isEditing, serviceId]);

  const buildCreatePayload = () => ({
    title: title.trim(),
    description: description.trim(),
    categoryId: categoryId || null,
    packages: packages.map((pkg, index) => ({
      name: pkg.name,
      scope: pkg.scope,
      price: pkg.price,
      deliveryDays: pkg.deliveryDays,
      displayOrder: index + 1,
    })),
  });

  const buildUpdatePayload = () => ({
    title: title.trim(),
    description: description.trim(),
    categoryId,
    packages: packages.map((pkg, index) => ({
      ...(pkg.id ? { id: pkg.id } : {}),
      name: pkg.name,
      scope: pkg.scope,
      price: parseFloat(pkg.price),
      deliveryDays: parseInt(pkg.deliveryDays, 10),
      displayOrder: index + 1,
    })),
  });

  const buildPublishErrorMessage = (error, { includeDraftPrefix }) => {
    const missing = error.response?.data?.missing;
    const baseMessage = missing
      ? `Revisá los campos faltantes: ${missing.join(', ')}.`
      : error.response?.data?.message || 'Ocurrió un error al publicarlo.';

    return includeDraftPrefix
      ? `Tu servicio fue guardado como borrador. ${baseMessage}`
      : missing
        ? `El servicio permanece como borrador. Campos faltantes: ${missing.join(', ')}.`
        : error.response?.data?.message || 'Error al intentar publicar el servicio.';
  };

  const tryPublishService = async ({
    targetServiceId,
    onSuccess,
    onError,
  }) => {
    try {
      const published = await publishService(targetServiceId);
      onSuccess?.(published);
      return { ok: true, data: published };
    } catch (error) {
      const includeDraftPrefix = !isEditing;
      const message = buildPublishErrorMessage(error, { includeDraftPrefix });
      onError?.({ error, message });
      return { ok: false, error, message };
    }
  };

  const handleSaveDraft = async () => {
    if (isEditing) return;

    setCreating(true);
    setError(null);
    try {
      await createService(buildCreatePayload());
      navigation.goBack();
    } catch (e) {
      setError(e.response?.data?.message || 'Error al guardar el borrador.');
    } finally {
      setCreating(false);
    }
  };

  const handleSaveAndPublish = async () => {
    if (isEditing) return;

    setCreating(true);
    setError(null);
    let savedService;
    try {
      savedService = await createService(buildCreatePayload());
      await tryPublishService({
        targetServiceId: savedService.id,
        onSuccess: () => navigation.goBack(),
        onError: ({ error, message }) => {
          if (!error.response) {
            setError('Error al guardar el servicio.');
            return;
          }
          setError(message);
          setServiceId(savedService.id);
        },
      });
    } catch (e) {
      if (!e.response) {
        setError('Error al guardar el servicio.');
        return;
      }

      setError(e.response?.data?.message || 'Error al guardar el servicio.');
    //   Alert.alert('Servicio guardado como borrador', message, [
    //     { text: 'OK', onPress: () => navigation.goBack() },
    //   ]);
    } finally {
      setCreating(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!isEditing) return;

    setSaving(true);
    setError(null);
    setAutoUnpublished(false);
    try {
      const response = await updateService(serviceId, buildUpdatePayload());
      setService(response.data);
      if (response.headers?.['x-auto-unpublished'] === 'true') {
        setAutoUnpublished(true);
      }
    //   Alert.alert('Guardado', 'Los cambios se guardaron correctamente.');
    } catch (e) {
      setError(e.response?.data?.message || 'Error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!isEditing) return;
    handleSaveChanges();

    setPublishError(null);
    await tryPublishService({
      targetServiceId: serviceId,
      onSuccess: () => navigation.goBack(),
      onError: ({ message }) => {
        setPublishError(message);
      },
    });
  };

  const handleUnpublish = async () => {
    if (!isEditing) return;

    try {
      await unpublishService(serviceId);
      setService((current) => ({ ...current, status: 'DRAFT' }));
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Error al despublicar.');
    }
  };

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

  const removePackage = (index) => {
    setPackages(packages.filter((_, currentIndex) => currentIndex !== index));
  };

  const selectedCategory = categories.find((category) => category.id === categoryId);

  if (loading) return <ActivityIndicator style={{ marginTop: 60 }} size="large" />;

  const isDraft = isEditing && service?.status === 'DRAFT';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {isEditing && autoUnpublished ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            ⚠️ El servicio fue despublicado automáticamente porque ya no cumple los requisitos mínimos.
          </Text>
        </View>
      ) : null}

      {isEditing ? (
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
      ) : null}

      {publishError ? <Text style={styles.publishError}>{publishError}</Text> : null}

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
      <TouchableOpacity
        style={styles.descriptionPreview}
        onPress={() => setDescriptionModalVisible(true)}
      >
        <Text
          style={description.trim() ? styles.descriptionPreviewText : styles.descriptionPreviewPlaceholder}
          numberOfLines={1}
        >
          {description.trim() || 'Describe tu servicio en detalle...'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={descriptionModalVisible}
        transparent
        animationType="fade"
        onShow={() => descriptionInputRef.current?.focus()}
        onRequestClose={() => setDescriptionModalVisible(false)}
      >
        <Pressable style={styles.descriptionBackdrop} onPress={() => setDescriptionModalVisible(false)}>
          <KeyboardAvoidingView
            style={styles.descriptionKeyboardWrapper}
          >
            <Pressable style={styles.descriptionModalSheet}>
              <Text style={styles.selectTitle}>Editar descripción</Text>
              <TextInput
                ref={descriptionInputRef}
                style={styles.descriptionModalInput}
                value={description}
                onChangeText={setDescription}
                maxLength={1200}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholder="Describe tu servicio en detalle..."
              />
              <View style={styles.descriptionModalFooter}>
                <TouchableOpacity
                  style={styles.descriptionCloseBtn}
                  onPress={() => setDescriptionModalVisible(false)}
                >
                  <Text style={styles.descriptionCloseBtnText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      <Text style={styles.label}>Categoría</Text>
      <TouchableOpacity
        style={styles.selectTrigger}
        onPress={() => setCategorySelectVisible(true)}
      >
        <Text style={selectedCategory ? styles.selectText : styles.selectPlaceholder}>
          {selectedCategory?.name || 'Seleccionar categoría...'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={categorySelectVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategorySelectVisible(false)}
      >
        <Pressable style={styles.selectBackdrop} onPress={() => setCategorySelectVisible(false)}>
          <Pressable style={styles.selectSheet}>
            <Text style={styles.selectTitle}>Seleccionar categoría</Text>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.selectOption}
                onPress={() => {
                  setCategoryId(category.id);
                  setCategorySelectVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.selectOptionText,
                    category.id === categoryId ? styles.selectOptionTextSelected : null,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Text style={styles.sectionTitle}>Paquetes de contratación</Text>
         <>
          {packages.length === 0 ? (
            <Text style={styles.draft}>Agregá al menos un paquete para que tu servicio pueda ser contratado.</Text>
          ) : (
            packages.map((pkg, index) => (
              <View key={index} style={styles.pkgRow}>
                <View style={styles.pkgInfo}>
                <Text style={styles.pkgName}>{pkg.name || `Paquete ${index + 1}`}</Text>
                <Text style={styles.pkgDetail}>${pkg.price || 0} · {pkg.deliveryDays || 0} días</Text>
              </View>
              <View style={styles.pkgActions}>
                <TouchableOpacity onPress={() => openEditModal(index)} style={styles.pkgBtn}>
                  <Text style={styles.pkgBtnEdit}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removePackage(index)} style={styles.pkgBtn}>
                  <Text style={styles.pkgBtnRemove}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          )))
          }
          {packages.length < 3 ? (
            <TouchableOpacity style={styles.addPkg} onPress={openAddModal}>
              <Text style={styles.addPkgText}>+ Agregar paquete</Text>
            </TouchableOpacity>
          ) : null}

          <PackageFormModal
            visible={modalVisible}
            initialData={editingIndex !== null ? packages[editingIndex] : null}
            onConfirm={handleModalConfirm}
            onCancel={() => setModalVisible(false)}
          />
        </>

      {isEditing ? (
        <>
          <Text style={styles.sectionTitle}>Multimedia</Text>
          <ImageGallery serviceId={serviceId} images={images} onChange={setImages} />
        </>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {isEditing ? (
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveChanges} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Guardar cambios</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.buttons}>
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={handleSaveDraft} disabled={creating}>
            <Text style={styles.btnSecondaryText}>Guardar borrador</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleSaveAndPublish} disabled={creating}>
            {creating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnPrimaryText}>Guardar y publicar</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  descriptionPreview: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  descriptionPreviewText: { fontSize: 14, color: '#222' },
  descriptionPreviewPlaceholder: { fontSize: 14, color: '#777' },
  descriptionModalSheet: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingBottom: 12,
    width: '100%',
    overflow: 'hidden',
  },
  descriptionBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 56,
  },
  descriptionKeyboardWrapper: {
    width: '100%',
  },
  descriptionModalInput: {
    height: 140,
    maxHeight: 180,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 14,
    marginTop: 12,
    padding: 10,
    fontSize: 14,
    color: '#222',
    backgroundColor: '#fff',
  },
  descriptionModalFooter: {
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  descriptionCloseBtn: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  descriptionCloseBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  selectTrigger: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  selectText: { fontSize: 14, color: '#222' },
  selectPlaceholder: { fontSize: 14, color: '#777' },
  selectBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  selectSheet: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    maxHeight: '60%',
  },
  selectTitle: {
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  selectOptionText: { fontSize: 14, color: '#333' },
  selectOptionTextSelected: { color: '#1976d2', fontWeight: '700' },
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
  editPackageCard: { marginBottom: 8 },
  error: { color: '#e53935', marginBottom: 12, fontSize: 13 },
  publishError: { color: '#e53935', backgroundColor: '#fdecea', borderRadius: 6, padding: 10, marginBottom: 12, fontSize: 13 },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 8 },
  btn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnSecondary: { borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff' },
  btnSecondaryText: { color: '#333', fontWeight: '600' },
  btnPrimary: { backgroundColor: '#1976d2' },
  btnPrimaryText: { color: '#fff', fontWeight: '600' },
  saveBtn: { backgroundColor: '#1976d2', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
