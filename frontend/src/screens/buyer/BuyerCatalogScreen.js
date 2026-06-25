import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { setToken } from '../../api/config';
  
export default function BuyerCatalogScreen({ navigation }) {
  const handleLogout = () => {
    setToken(null);
    navigation.replace('BuyerLogin');
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
          <Text style={{ color: '#7b1fa2', fontSize: 14 }}>Cerrar sesión</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catálogo de Servicios</Text>
      <Text style={styles.placeholder}>Próximamente: aquí verás los servicios disponibles.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8', padding: 24 },
  title: { fontSize: 22, fontWeight: '800', color: '#7b1fa2', marginBottom: 12 },
  placeholder: { fontSize: 14, color: '#666', textAlign: 'center' },
});
