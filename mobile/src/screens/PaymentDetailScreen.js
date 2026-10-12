import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { pagosApi } from '../api/pagos';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { apiErrorMessage, money, shortDate } from '../utils/format';
import StatusBadge from '../components/StatusBadge';
import { Ionicons } from '@expo/vector-icons';

const METHODS = [
  ['efectivo', 'Efectivo', 'cash-outline'],
  ['qr', 'QR', 'qr-code-outline'],
  ['tarjeta', 'Tarjeta', 'card-outline'],
];

export default function PaymentDetailScreen({ route }) {
  const reserva = route.params?.reserva;
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('efectivo');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = String(user?.role || '').toLowerCase().includes('administrador');

  const load = useCallback(async () => {
    if (!reserva?.id) return;
    setLoading(true);
    setError('');
    try {
      const [resume, payments] = await Promise.all([
        pagosApi.resumen(reserva.id),
        pagosApi.list({ reserva: reserva.id }),
      ]);
      setSummary(resume);
      setHistory(Array.isArray(payments) ? payments : payments?.results || []);
    } catch (e) {
      setError(apiErrorMessage(e, 'No se pudo cargar el detalle de pagos.'));
    } finally {
      setLoading(false);
    }
  }, [reserva?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const pending = Number(summary?.saldo || reserva?.saldo_pendiente || 0);
  const canPay = pending > 0 && reserva?.estado !== 'cancelada';
  const validAmount = useMemo(() => Number(String(amount).replace(',', '.')), [amount]);

  async function registerPayment() {
    if (!canPay) return Alert.alert('Sin saldo', 'Esta reserva no tiene saldo pendiente.');
    if (!Number.isFinite(validAmount) || validAmount <= 0) return Alert.alert('Monto inválido', 'Ingresa un monto mayor a 0.');
    if (validAmount > pending) return Alert.alert('Monto excedido', `El saldo pendiente es ${money(pending)}.`);
    setSaving(true);
    try {
      await pagosApi.create({ reserva: reserva.id, monto: validAmount, metodo_pago: method, estado_pago: 'pagado' });
      setAmount('');
      await load();
      Alert.alert('Pago registrado', 'El cobro se guardó correctamente.');
    } catch (e) {
      Alert.alert('No se pudo registrar', apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  function confirmVoid(item) {
    Alert.alert('Anular pago', `¿Deseas anular el pago de ${money(item.monto)}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Anular', style: 'destructive', onPress: () => voidPayment(item) },
    ]);
  }

  async function voidPayment(item) {
    try {
      await pagosApi.anular(item.id);
      await load();
      Alert.alert('Pago anulado', 'El pago se mantiene en el historial como anulado.');
    } catch (e) {
      Alert.alert('No se pudo anular', apiErrorMessage(e));
    }
  }

  if (loading && !summary) return <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <View style={{ flex: 1 }}>
          <Text style={styles.code}>{reserva?.codigo_reserva}</Text>
          <Text style={styles.guest}>{reserva?.cliente_nombre || reserva?.nombre_cliente || 'Huésped'}</Text>
          <Text style={styles.meta}>Hab. {reserva?.habitacion_numero || '-'} · {shortDate(reserva?.fecha_entrada)} → {shortDate(reserva?.fecha_salida)}</Text>
        </View>
        <StatusBadge value={summary?.estado_pago || reserva?.estado_pago} />
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.totals}>
        <Total label="Total estadía" value={money(summary?.total ?? reserva?.total_estimado)} />
        <Total label="Pagado" value={money(summary?.pagado ?? reserva?.total_pagado)} />
        <Total label="Saldo pendiente" value={money(summary?.saldo ?? reserva?.saldo_pendiente)} highlight />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Registrar pago</Text>
        {canPay ? <>
          <Text style={styles.label}>Monto (Bs)</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.muted}
            />
            <Pressable style={styles.balanceButton} onPress={() => setAmount(pending.toFixed(2))}>
              <Text style={styles.balanceButtonText}>Saldo completo</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Método de pago</Text>
          <View style={styles.methods}>
            {METHODS.map(([value, label, icon]) => (
              <Pressable key={value} onPress={() => setMethod(value)} style={({pressed})=>[styles.method, method === value && styles.methodActive, pressed&&styles.pressed]}>
                <Ionicons name={icon} size={19} color={method===value?'#fff':colors.muted}/>
                <Text style={[styles.methodText, method === value && styles.methodTextActive]}>{label}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable disabled={saving} onPress={registerPayment} style={({pressed})=>[styles.payButton, saving&&{opacity:.6}, pressed&&!saving&&styles.pressed]}>
            <Ionicons name="checkmark-circle-outline" size={21} color="#fff"/>
            <Text style={styles.payButtonText}>{saving ? 'Registrando...' : 'Registrar pago'}</Text>
          </Pressable>
        </> : <Text style={styles.done}>La reserva no tiene saldo pendiente para cobrar.</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Historial de pagos</Text>
        {history.length === 0 ? <Text style={styles.empty}>Todavía no existen pagos registrados.</Text> : history.map((item) => (
          <View key={item.id} style={styles.paymentRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.paymentTop}>
                <Text style={styles.paymentAmount}>{money(item.monto)}</Text>
                <StatusBadge value={item.estado_pago} />
              </View>
              <Text style={styles.paymentMeta}>{String(item.metodo_pago || '').toUpperCase()} · {formatDateTime(item.fecha_pago)}</Text>
            </View>
            {isAdmin && item.estado_pago !== 'anulado' && (
              <Pressable onPress={() => confirmVoid(item)} style={styles.voidButton}><Text style={styles.voidText}>Anular</Text></Pressable>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Total({ label, value, highlight }) {
  return <View style={styles.totalBox}><Text style={styles.totalLabel}>{label}</Text><Text style={[styles.totalValue, highlight && { color: colors.primary }]}>{value}</Text></View>;
}
function formatDateTime(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 36 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  hero: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 16 },
  code: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  guest: { color: colors.text, fontWeight: '800', fontSize: 20, marginTop: 7 },
  meta: { color: colors.muted, marginTop: 5, lineHeight: 19 },
  error: { color: colors.danger, marginTop: 12 },
  totals: { gap: 9, marginTop: 12 },
  totalBox: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 15, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: colors.muted },
  totalValue: { color: colors.text, fontWeight: '800', fontSize: 17 },
  card: { marginTop: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 16 },
  sectionTitle: { color: colors.text, fontWeight: '800', fontSize: 17, marginBottom: 12 },
  label: { color: colors.text, fontWeight: '700', marginBottom: 7, marginTop: 8 },
  amountRow: { flexDirection: 'row', gap: 8 },
  input: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 13, paddingHorizontal: 14, fontSize: 16, backgroundColor: '#fff' },
  balanceButton: { minHeight: 50, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: colors.primarySoft, borderWidth:1, borderColor:'#d5e8ff' },
  balanceButtonText: { color: colors.primary, fontWeight: '800', fontSize: 12 },
  methods: { flexDirection: 'row', gap: 8 },
  method: { flex: 1, minHeight: 58, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', gap:4, backgroundColor:colors.card },
  methodActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  methodText: { color: colors.muted, fontWeight: '700', fontSize: 12 },
  methodTextActive: { color: '#fff' },
  payButton: { minHeight: 54, backgroundColor: colors.primary, borderRadius: 15, flexDirection:'row', gap:9, alignItems: 'center', justifyContent: 'center', marginTop: 16, shadowColor:'#000', shadowOpacity:.10, shadowRadius:8, shadowOffset:{width:0,height:3}, elevation:3 },
  payButtonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  done: { color: colors.success, fontWeight: '700', lineHeight: 20 },
  empty: { color: colors.muted },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  paymentTop: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  paymentAmount: { color: colors.text, fontWeight: '800', fontSize: 16 },
  paymentMeta: { color: colors.muted, fontSize: 12, marginTop: 5 },
  voidButton: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.dangerSoft },
  voidText: { color: colors.danger, fontWeight: '800', fontSize: 12 },
  pressed:{opacity:.78, transform:[{scale:.985}]},
});
