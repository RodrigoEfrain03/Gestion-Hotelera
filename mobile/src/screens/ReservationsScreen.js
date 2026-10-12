import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { reservasApi } from '../api/reservas';
import { colors } from '../theme/colors';
import { money, shortDate } from '../utils/format';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

const FILTERS = ['', 'pendiente', 'confirmada', 'finalizada', 'cancelada'];

export default function ReservationsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await reservasApi.list({ search, estado });
      setItems(Array.isArray(data) ? data : data?.results || []);
    } catch { setError('No se pudieron cargar las reservas.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, [search, estado]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}><Text style={styles.title}>Reservas</Text><Text style={styles.subtitle}>Consulta y registra estadías.</Text></View>
        <Pressable style={({pressed})=>[styles.addButton,pressed&&styles.pressed]} onPress={() => navigation.navigate('NuevaReserva')}><Ionicons name="add-circle-outline" size={18} color="#fff"/><Text style={styles.addText}>Nueva</Text></Pressable>
      </View>
      <TextInput style={styles.search} value={search} onChangeText={setSearch} onSubmitEditing={() => load()} returnKeyType="search" placeholder="Buscar código, huésped, CI o habitación" />
      <FlatList horizontal showsHorizontalScrollIndicator={false} data={FILTERS} keyExtractor={(x) => x || 'todas'} style={styles.filters} contentContainerStyle={{ gap: 8 }} renderItem={({ item }) => (
        <Pressable onPress={() => setEstado(item)} style={[styles.filter, estado === item && styles.filterActive]}>
          <Text style={[styles.filterText, estado === item && styles.filterTextActive]}>{item ? item[0].toUpperCase() + item.slice(1) : 'Todas'}</Text>
        </Pressable>
      )} />
      {!!error && <Text style={styles.error}>{error}</Text>}
      {loading ? <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View> : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
          contentContainerStyle={items.length ? styles.list : styles.emptyList}
          ListEmptyComponent={<EmptyState title="Sin reservas" description="No encontramos reservas con esos filtros." />}
          renderItem={({ item }) => <ReservationCard item={item} onPress={() => navigation.navigate('DetalleReserva', { id: item.id })} />}
        />
      )}
    </View>
  );
}

function ReservationCard({ item, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardTop}><Text style={styles.code}>{item.codigo_reserva}</Text><StatusBadge value={item.estado} /></View>
      <Text style={styles.guest}>{item.cliente_nombre || item.nombre_cliente}</Text>
      <Text style={styles.meta}>Hab. {item.habitacion_numero || '-'} · {shortDate(item.fecha_entrada)} → {shortDate(item.fecha_salida)}</Text>
      <View style={styles.cardBottom}><Text style={styles.total}>{money(item.total_estimado)}</Text><StatusBadge value={item.estado_pago} /></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  title: { fontSize: 25, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.muted, marginTop: 2 },
  addButton: { backgroundColor: colors.primary, borderRadius: 13, paddingHorizontal: 14, paddingVertical: 11, flexDirection:'row', alignItems:'center', gap:6, shadowColor:'#000', shadowOpacity:.08, shadowRadius:6, shadowOffset:{width:0,height:2}, elevation:2 },
  addText: { color: '#fff', fontWeight: '800' },
  search: { margin: 16, marginBottom: 10, minHeight: 48, backgroundColor: colors.card, borderRadius: 13, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, fontSize: 15 },
  filters: { flexGrow: 0, marginBottom: 10 },
  filter: { marginLeft: 16, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  filterActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  filterText: { color: colors.muted, fontWeight: '700' },
  filterTextActive: { color: '#fff' },
  error: { color: colors.danger, marginHorizontal: 16, marginBottom: 8 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingTop: 4, paddingBottom: 30, gap: 10 },
  emptyList: { flexGrow: 1 },
  card: { backgroundColor: colors.card, borderRadius: 17, padding: 15, borderWidth: 1, borderColor: colors.border },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  code: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  guest: { fontSize: 17, fontWeight: '800', color: colors.text, marginTop: 11 },
  meta: { color: colors.muted, marginTop: 4, lineHeight: 19 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 13, paddingTop: 11, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  total: { color: colors.text, fontWeight: '800' },
  pressed:{opacity:.8,transform:[{scale:.98}]},
});
