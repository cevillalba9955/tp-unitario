import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BuyerCatalogScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catálogo de Servicios</Text>
      <Text style={styles.placeholder}>Próximamente: aquí verás los servicios disponibles.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8', padding: 24 },
  title: { fontSize: 22, fontWeight: '800', color: '#1976d2', marginBottom: 12 },
  placeholder: { fontSize: 14, color: '#666', textAlign: 'center' },
});
