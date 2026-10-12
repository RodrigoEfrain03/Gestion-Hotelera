import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { reservasApi } from '../api/reservas';
import { colors } from '../theme/colors';
import { money, shortDate } from '../utils/format';
import StatusBadge from '../components/StatusBadge';

export default function ReservationDetailScreen({ route }) {
  const { id } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    (async () => {
      setLoading(true); setError('');
      try { setItem(await reservasApi.detail(id)); }
      catch { setError('No se pudo cargar la reserva.'); }
      finally { setLoading(false); }
    })();
  }, [id]));

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  if (!item) return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.code}>{item.codigo_reserva}</Text>
        <StatusBadge value={item.estado} />
        <Text style={styles.guest}>{item.cliente_nombre || item.nombre_cliente}</Text>
        <Text style={styles.ci}>CI: {item.cliente_ci || '-'}</Text>
      </View>
      <Section title="Estadía">
        <Row label="Habitación" value={`${item.habitacion_numero || '-'} · ${item.habitacion_tipo || ''}`} />
        <Row label="Entrada" value={shortDate(item.fecha_entrada)} />
        <Row label="Salida" value={shortDate(item.fecha_salida)} />
        <Row label="Noches" value={item.noches ?? '-'} />
        <Row label="Personas" value={item.cantidad_personas} />
      </Section>
      <Section title="Pago">
        <Row label="Total estimado" value={money(item.total_estimado)} />
        <Row label="Pagado" value={money(item.total_pagado)} />
        <Row label="Saldo" value={money(item.saldo_pendiente)} />
        <View style={{ marginTop: 8 }}><StatusBadge value={item.estado_pago} /></View>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>; }
function Row({ label, value }) { return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{String(value ?? '-')}</Text></View>; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, content: { padding: 16, paddingBottom: 32 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }, error: { color: colors.danger },
  hero: { backgroundColor: colors.navy, borderRadius: 20, padding: 18 }, code: { color: '#9ecbff', fontWeight: '800', marginBottom: 10 }, guest: { color: '#fff', fontSize: 23, fontWeight: '800', marginTop: 13 }, ci: { color: '#c6d3e4', marginTop: 4 },
  section: { backgroundColor: colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border, marginTop: 12 }, sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }, label: { color: colors.muted }, value: { color: colors.text, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
});
