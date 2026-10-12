import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { reservasApi } from '../api/reservas';
import { colors } from '../theme/colors';
import { money, shortDate } from '../utils/format';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

const FILTERS = [
  ['todos', 'Todos'],
  ['pendiente', 'Pendientes'],
  ['parcial', 'Parciales'],
  ['pagado', 'Pagados'],
];

export default function PaymentsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await reservasApi.list();
      setItems(Array.isArray(data) ? data : data?.results || []);
    } catch {
      setError('No se pudo cargar la información de pagos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const status = String(item.estado_pago || 'pendiente').toLowerCase();
      if (filter !== 'todos' && status !== filter) return false;
      if (!q) return true;
      return [item.codigo_reserva, item.cliente_nombre, item.nombre_cliente, item.cliente_ci, item.habitacion_numero]
        .some((value) => String(value || '').toLowerCase().includes(q));
    });
  }, [items, search, filter]);

  const summary = useMemo(() => items.reduce((acc, item) => {
    const total = Number(item.total_estimado || 0);
    const paid = Number(item.total_pagado || 0);
    const balance = Number(item.saldo_pendiente || 0);
    acc.total += total;
    acc.paid += paid;
    acc.balance += balance;
    return acc;
  }, { total: 0, paid: 0, balance: 0 }), [items]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Pagos</Text>
        <Text style={styles.subtitle}>Cobros, saldos e historial por reserva.</Text>
      </View>

      <View style={styles.summaryRow}>
        <Summary label="Cobrado" value={money(summary.paid)} />
        <Summary label="Por cobrar" value={money(summary.balance)} />
      </View>

      <TextInput
        style={styles.search}
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar reserva, huésped, CI o habitación"
        placeholderTextColor={colors.muted}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={{ paddingRight: 16 }}>
        {FILTERS.map(([value, label]) => (
          <Pressable key={value} onPress={() => setFilter(value)} style={[styles.filter, filter === value && styles.filterActive]}>
            <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {!!error && <Text style={styles.error}>{error}</Text>}
      {loading ? (
        <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={visible.length ? styles.list : styles.emptyList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
          ListEmptyComponent={<EmptyState title="Sin resultados" description="No hay reservas que coincidan con este filtro." />}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => navigation.navigate('DetallePago', { reserva: item })}>
              <View style={styles.cardTop}>
                <Text style={styles.code}>{item.codigo_reserva}</Text>
                <StatusBadge value={item.estado_pago} />
              </View>
              <Text style={styles.guest}>{item.cliente_nombre || item.nombre_cliente || 'Huésped'}</Text>
              <Text style={styles.meta}>Hab. {item.habitacion_numero || '-'} · {shortDate(item.fecha_entrada)} → {shortDate(item.fecha_salida)}</Text>
              <View style={styles.amounts}>
                <Amount label="Total" value={money(item.total_estimado)} />
                <Amount label="Pagado" value={money(item.total_pagado)} />
                <Amount label="Saldo" value={money(item.saldo_pendiente)} strong />
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

function Summary({ label, value }) {
  return <View style={styles.summary}><Text style={styles.summaryLabel}>{label}</Text><Text style={styles.summaryValue}>{value}</Text></View>;
}
function Amount({ label, value, strong }) {
  return <View style={styles.amount}><Text style={styles.amountLabel}>{label}</Text><Text style={[styles.amountValue, strong && { color: colors.primary }]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },
  title: { fontSize: 25, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.muted, marginTop: 3 },
  summaryRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 10 },
  summary: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 15, padding: 13 },
  summaryLabel: { color: colors.muted, fontSize: 12 },
  summaryValue: { color: colors.navy, fontSize: 17, fontWeight: '800', marginTop: 5 },
  search: { marginHorizontal: 16, minHeight: 48, backgroundColor: colors.card, borderRadius: 13, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, fontSize: 15 },
  filters: { flexGrow: 0, marginVertical: 10 },
  filter: { marginLeft: 16, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  filterActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  filterText: { color: colors.muted, fontWeight: '700' },
  filterTextActive: { color: '#fff' },
  error: { color: colors.danger, marginHorizontal: 16, marginBottom: 8 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingTop: 2, paddingBottom: 30, gap: 10 },
  emptyList: { flexGrow: 1 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 17, padding: 15 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  code: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  guest: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 10 },
  meta: { color: colors.muted, marginTop: 4 },
  amounts: { flexDirection: 'row', marginTop: 13, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  amount: { flex: 1 },
  amountLabel: { color: colors.muted, fontSize: 11 },
  amountValue: { color: colors.text, fontSize: 13, fontWeight: '800', marginTop: 3 },
});
