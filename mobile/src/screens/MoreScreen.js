import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const logo = require('../../assets/logo-marriott-yacuiba.png');

export default function MoreScreen({ navigation }) {
  const { user, signOut } = useAuth();
  return (
    <View style={styles.screen}>
      <View style={styles.brandCard}>
        <View style={styles.brandLeft}>
          <View style={styles.logoBox}><Image source={logo} style={styles.logo} resizeMode="contain" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.hotelName}>Hotel Marriott Yacuiba</Text>
            <Text style={styles.hotelSub}>Gestión hotelera móvil</Text>
          </View>
        </View>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.name}>{user?.name || user?.first_name || user?.username}</Text>
        <Text style={styles.role}>{user?.role || user?.rol || 'Usuario'}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
      </View>

      <Menu icon="people-outline" title="Clientes" subtitle="Registrar y editar huéspedes" onPress={() => navigation.navigate('Clientes')} />
      <Menu icon="bed-outline" title="Habitaciones" subtitle="Tarifas, tipos y estados" onPress={() => navigation.navigate('Habitaciones')} />

      <Pressable style={styles.logout} onPress={signOut}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

function Menu({ icon, title, subtitle, onPress }) {
  return (
    <Pressable style={styles.menu} onPress={onPress}>
      <View style={styles.iconBox}><Ionicons name={icon} size={22} color={colors.primary} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 16 },
  brandCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 14, marginBottom: 12 },
  brandLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#fffdf9', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 42, height: 42 },
  hotelName: { fontSize: 18, fontWeight: '800', color: colors.text },
  hotelSub: { color: colors.muted, marginTop: 2 },
  profileCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 18, marginBottom: 12 },
  name: { fontSize: 21, fontWeight: '800', color: colors.text },
  role: { color: colors.primary, fontWeight: '700', marginTop: 5 },
  username: { color: colors.muted, marginTop: 3 },
  menu: { minHeight: 72, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  menuTitle: { fontWeight: '800', color: colors.text, fontSize: 16 },
  menuSub: { color: colors.muted, marginTop: 3 },
  logout: { marginTop: 4, minHeight: 50, borderRadius: 14, backgroundColor: colors.dangerSoft, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  logoutText: { color: colors.danger, fontWeight: '800' },
});
