import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function PackageForm({ value, onChange, onRemove, index }) {
  const update = (field, text) => onChange({ ...value, [field]: text });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Paquete {index + 1}</Text>
        <TouchableOpacity onPress={onRemove}>
          <Text style={styles.remove}>✕ Eliminar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Nombre (max 50 chars)</Text>
      <TextInput
        style={styles.input}
        value={value.name}
        onChangeText={(t) => update('name', t)}
        maxLength={50}
        placeholder="ej. Básico"
      />

      <Text style={styles.label}>Alcance (max 500 chars)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={value.scope}
        onChangeText={(t) => update('scope', t)}
        maxLength={500}
        multiline
        numberOfLines={3}
        placeholder="Descripción del alcance del paquete"
      />

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Precio ($)</Text>
          <TextInput
            style={styles.input}
            value={value.price !== undefined ? String(value.price) : ''}
            onChangeText={(t) => update('price', parseFloat(t) || '')}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Plazo (días)</Text>
          <TextInput
            style={styles.input}
            value={value.deliveryDays !== undefined ? String(value.deliveryDays) : ''}
            onChangeText={(t) => update('deliveryDays', parseInt(t) || '')}
            keyboardType="number-pad"
            placeholder="3"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontWeight: 'bold', fontSize: 14 },
  remove: { color: '#e53935', fontSize: 13 },
  label: { fontSize: 12, color: '#555', marginTop: 8, marginBottom: 2 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, fontSize: 14, backgroundColor: '#fafafa' },
  multiline: { height: 70, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
});
