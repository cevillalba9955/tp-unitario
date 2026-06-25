import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { login } from '../../api/servicesApi';
import { setToken, setRole, getToken } from '../../api/config';

export default function BuyerLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (getToken()) {
      navigation.replace('BuyerCatalog');
    }
  }, []);

  const handleLogin = async () => {
    setError(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail && !password) {
      setError('Ingresá tu email y contraseña.');
      return;
    }
    if (!trimmedEmail) {
      setError('El email es obligatorio.');
      return;
    }
    if (!trimmedEmail.includes('@')) {
      setError('Ingresá un email válido.');
      return;
    }
    if (!password) {
      setError('La contraseña es obligatoria.');
      return;
    }

    setLoading(true);
    try {
      const { token, role } = await login(trimmedEmail, password, 'buyer');
      setToken(token);
      setRole(role);
      navigation.replace('BuyerCatalog');
    } catch (e) {
      if (!e.response) {
        setError('Error al iniciar sesión. Verificá tu conexión.');
      } else {
        setError(e.response?.data?.message || 'Email o contraseña incorrectos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>FreelanceHub</Text>
        <Text style={styles.subtitle}>Ingresá como comprador</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="comprador@demo.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.btnText}>Iniciar sesión</Text>
          }
        </TouchableOpacity>
          <Text style={styles.hint}>Demo: buyer@demo.com / demo1234</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.switchLink}>
          <Text style={styles.switchText}>¿Sos freelancer? Ingresá aquí</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 24, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 },
  title: { fontSize: 26, fontWeight: '800', color: '#7b1fa2', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 13, color: '#555', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 14, backgroundColor: '#fafafa' },
  error: { color: '#e53935', fontSize: 13, marginBottom: 12 },
  btn: { backgroundColor: '#7b1fa2', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  switchLink: { marginTop: 16, alignItems: 'center' },
  switchText: { fontSize: 13, color: '#7b1fa2', textDecorationLine: 'underline' },
  hint: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 8 },
});
