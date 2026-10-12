import React, { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { apiErrorMessage } from '../utils/format';

const logo = require('../../assets/logo-marriott-yacuiba.png');

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!username.trim() || !password) {
      setError('Ingresa usuario y contraseña.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await signIn(username, password);
    } catch (e) {
      setError(apiErrorMessage(e, 'No se pudo iniciar sesión.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.hero}>
        <View style={styles.logoWrap}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.brand}>Hotel Marriott Yacuiba</Text>
        <Text style={styles.subtitle}>Bienvenido al sistema móvil de gestión hotelera</Text>
        <Text style={styles.copy}>Administra reservas, clientes, habitaciones, check-in y pagos desde una vista más cálida y profesional.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.badge}><Text style={styles.badgeText}>Acceso seguro</Text></View>
        <Text style={styles.title}>Iniciar sesión</Text>
        <Text style={styles.help}>Usa el mismo usuario y contraseña del sistema web.</Text>

        <Text style={styles.label}>Usuario</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
          placeholder="Usuario"
          placeholderTextColor={colors.muted}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="Contraseña"
          placeholderTextColor={colors.muted}
        />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Pressable style={[styles.button, busy && styles.disabled]} disabled={busy} onPress={submit}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar al sistema</Text>}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 22,
    backgroundColor: colors.background,
  },
  hero: {
    marginBottom: 20,
    alignItems: 'center',
  },
  logoWrap: {
    width: 132,
    height: 132,
    borderRadius: 36,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  logo: { width: 106, height: 106 },
  brand: {
    fontSize: 27,
    fontWeight: '900',
    color: colors.navy,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.primary,
    marginTop: 5,
    fontWeight: '700',
    textAlign: 'center',
  },
  copy: {
    color: colors.muted,
    marginTop: 8,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 330,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  badgeText: { color: colors.primary, fontWeight: '800', fontSize: 12 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  help: { color: colors.muted, marginTop: 5, marginBottom: 18, lineHeight: 20 },
  label: { color: colors.text, fontWeight: '700', marginBottom: 7, marginTop: 10 },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: '#fffdf9',
    fontSize: 16,
    color: colors.text,
  },
  error: { color: colors.danger, marginTop: 12, lineHeight: 19 },
  button: {
    marginTop: 18,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  disabled: { opacity: 0.65 },
});
