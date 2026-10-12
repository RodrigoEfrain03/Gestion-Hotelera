import React, { useCallback, useState } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiRequest } from '../api/http';
import { colors } from '../theme/colors';
import { money } from '../utils/format';
import LoadingView from '../components/LoadingView';
import { useAuth } from '../context/AuthContext';

const logo = require('../../assets/logo-marriott-yacuiba.png');

export default function DashboardScreen() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      setData(await apiRequest('/dashboard/'));
    } catch {
      setError('No se pudo cargar el dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  if (loading && !data) return <LoadingView label="Cargando dashboard..." />;

  const metrics = data?.metricas || data?.metrics || data || {};
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
    >
      <Text style={styles.eyebrow}>PANEL HOTELERO</Text>
      <View style={styles.heroCard}>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>Hola, {user?.first_name || user?.username || 'usuario'}</Text>
          <Text style={styles.heroRole}>{user?.rol || user?.role || 'Usuario del sistema'}</Text>
          <Text style={styles.heroCopy}>Gestiona la operación del hotel con una vista clara, elegante y enfocada en el día a día.</Text>
        </View>
        <View style={styles.logoBox}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.grid}>
        <Metric label="Disponibles" value={metrics.habitaciones_disponibles ?? metrics.disponibles ?? 0} />
        <Metric label="Ocupadas" value={metrics.habitaciones_ocupadas ?? metrics.ocupadas ?? 0} />
        <Metric label="Reservas activas" value={metrics.reservas_activas ?? metrics.reservas ?? 0} />
        <Metric label="Ingresos hoy" value={money(metrics.ingresos_hoy ?? 0)} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Operación del día</Text>
        <Row label="Check-ins pendientes" value={metrics.checkins_pendientes ?? 0} />
        <Row label="Huéspedes hospedados" value={metrics.huespedes_hospedados ?? 0} />
        <Row label="Salidas previstas" value={metrics.salidas_previstas ?? 0} />
      </View>
    </ScrollView>
  );
}

function Metric({ label, value }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}
function Row({ label, value }) {
  return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 32 },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  heroCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  heroText: { flex: 1 },
  heroTitle: { color: colors.text, fontSize: 25, fontWeight: '800' },
  heroRole: { color: colors.primary, marginTop: 4, fontWeight: '700' },
  heroCopy: { color: colors.muted, marginTop: 9, lineHeight: 20 },
  logoBox: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: '#fffdf9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  logo: { width: 70, height: 70 },
  error: { color: colors.danger, marginBottom: 12, marginTop: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  metric: {
    width: '48%',
    minHeight: 105,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 15,
    justifyContent: 'space-between',
  },
  metricLabel: { color: colors.muted, fontSize: 13 },
  metricValue: { color: colors.navy, fontSize: 22, fontWeight: '800' },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 16, marginTop: 14 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 9 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowLabel: { color: colors.muted },
  rowValue: { color: colors.text, fontWeight: '800' },
});
