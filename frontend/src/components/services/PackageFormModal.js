import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';

function validatePackage(draft) {
  const errors = {};
  if (!draft.name || !draft.name.trim()) {
    errors.name = 'El nombre es obligatorio';
  }
  if (!draft.scope || !draft.scope.trim()) {
    errors.scope = 'El alcance es obligatorio';
  }
  const price = parseFloat(draft.price);
  if (!draft.price || isNaN(price) || price <= 0) {
    errors.price = 'El precio debe ser mayor a cero';
  }
  const days = parseInt(draft.deliveryDays, 10);
  if (!draft.deliveryDays || isNaN(days) || days <= 0 || !Number.isInteger(days)) {
    errors.deliveryDays = 'El plazo debe ser un número entero positivo';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

const emptyDraft = () => ({ name: '', scope: '', price: '', deliveryDays: '' });

export default function PackageFormModal({ visible, initialData, onConfirm, onCancel }) {
  const [draft, setDraft] = useState(emptyDraft());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (visible) {
      setDraft(initialData ? {
        name: initialData.name ?? '',
        scope: initialData.scope ?? '',
        price: initialData.price !== undefined ? String(initialData.price) : '',
        deliveryDays: initialData.deliveryDays !== undefined ? String(initialData.deliveryDays) : '',
      } : emptyDraft());
      setErrors({});
    }
  }, [visible, initialData]);

  const update = (field, value) => setDraft((d) => ({ ...d, [field]: value }));

  const handleSave = () => {
    const { valid, errors: validationErrors } = validatePackage(draft);
    if (!valid) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    onConfirm({
      name: draft.name.trim(),
      scope: draft.scope.trim(),
      price: parseFloat(draft.price),
      deliveryDays: parseInt(draft.deliveryDays, 10),
    });
  };

  const isEditing = initialData !== null && initialData !== undefined;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kvContainer}>
          <View style={styles.card}>
            <Text style={styles.title}>{isEditing ? 'Editar paquete' : 'Agregar paquete'}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Nombre (max 50 chars)</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={draft.name}
                onChangeText={(t) => update('name', t)}
                maxLength={50}
                placeholder="ej. Básico"
              />
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

              <Text style={styles.label}>Alcance (max 500 chars)</Text>
              <TextInput
                style={[styles.input, styles.multiline, errors.scope && styles.inputError]}
                value={draft.scope}
                onChangeText={(t) => update('scope', t)}
                maxLength={500}
                multiline
                numberOfLines={3}
                placeholder="Descripción del alcance del paquete"
              />
              {errors.scope ? <Text style={styles.errorText}>{errors.scope}</Text> : null}

              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.label}>Precio ($)</Text>
                  <TextInput
                    style={[styles.input, errors.price && styles.inputError]}
                    value={draft.price}
                    onChangeText={(t) => update('price', t)}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                  />
                  {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
                </View>
                <View style={styles.half}>
                  <Text style={styles.label}>Plazo (días)</Text>
                  <TextInput
                    style={[styles.input, errors.deliveryDays && styles.inputError]}
                    value={draft.deliveryDays}
                    onChangeText={(t) => update('deliveryDays', t)}
                    keyboardType="number-pad"
                    placeholder="3"
                  />
                  {errors.deliveryDays ? <Text style={styles.errorText}>{errors.deliveryDays}</Text> : null}
                </View>
              </View>
            </ScrollView>

            <View style={styles.buttons}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onCancel}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSave}>
                <Text style={styles.btnSaveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  kvContainer: { flex: 1, justifyContent: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '90%',
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  label: { fontSize: 12, color: '#555', marginTop: 10, marginBottom: 2 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 6,
    padding: 8, fontSize: 14, backgroundColor: '#fafafa',
  },
  inputError: { borderColor: '#e53935' },
  multiline: { height: 70, textAlignVertical: 'top' },
  errorText: { color: '#e53935', fontSize: 11, marginTop: 2 },
  row: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 20 },
  btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  btnCancel: { borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff' },
  btnCancelText: { color: '#333', fontWeight: '600' },
  btnSave: { backgroundColor: '#1976d2' },
  btnSaveText: { color: '#fff', fontWeight: '600' },
});
