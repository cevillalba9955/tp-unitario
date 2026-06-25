import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { login } from '../../api/servicesApi';
import { setToken, setRole } from '../../api/config';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Ingresá tu email y contraseña.');
      return;
    }
    setLoading(true);
    try {
      const { token, role } = await login(email.trim(), password, 'freelancer');
      setToken(token);
      setRole(role);
      navigation.replace('MyServices');
    } catch (e) {
      const msg = e.response?.data?.message || 'Error al iniciar sesión.';
      setError(msg);
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
        <Text style={styles.subtitle}>Entrá como Freelancer</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="freelancer@demo.com"
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

        <Text style={styles.hint}>Demo: freelancer@demo.com / demo1234</Text>

        <TouchableOpacity onPress={() => navigation.navigate('BuyerLogin')} style={styles.switchLink}>
          <Text style={styles.switchText}>¿Sos comprador? Ingresá aquí</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('BuyerCatalog')} style={styles.switchLink}>
          <Text style={styles.switchText}>Ver catálogo público</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 24, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 },
  title: { fontSize: 26, fontWeight: '800', color: '#1976d2', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 13, color: '#555', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 14, backgroundColor: '#fafafa' },
  error: { color: '#e53935', fontSize: 13, marginBottom: 12 },
  btn: { backgroundColor: '#1976d2', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  hint: { marginTop: 16, fontSize: 12, color: '#aaa', textAlign: 'center' },
  switchLink: { marginTop: 12, alignItems: 'center' },
  switchText: { fontSize: 13, color: '#1976d2', textDecorationLine: 'underline' },
});
