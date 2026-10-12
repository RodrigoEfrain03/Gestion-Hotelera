import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { reservasApi } from '../api/reservas';
import { colors } from '../theme/colors';
import { apiErrorMessage, isoDate, money } from '../utils/format';

export default function NewReservationScreen({ navigation }) {
  const tomorrow = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d; }, []);
  const dayAfter = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + 2); return d; }, []);
  const [clientes, setClientes] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [habitacion, setHabitacion] = useState(null);
  const [entrada, setEntrada] = useState(tomorrow);
  const [salida, setSalida] = useState(dayAfter);
  const [personas, setPersonas] = useState('1');
  const [showEntrada, setShowEntrada] = useState(false);
  const [showSalida, setShowSalida] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await reservasApi.clientes();
        setClientes(Array.isArray(data) ? data : data?.results || []);
      } catch { setError('No se pudieron cargar los clientes.'); }
      finally { setLoadingClients(false); }
    })();
  }, []);

  useEffect(() => {
    if (salida <= entrada) {
      const next = new Date(entrada); next.setDate(next.getDate() + 1); setSalida(next);
      return;
    }
    (async () => {
      setLoadingRooms(true); setHabitacion(null); setError('');
      try {
        const data = await reservasApi.disponibilidad(isoDate(entrada), isoDate(salida));
        setHabitaciones(Array.isArray(data) ? data : []);
      } catch (e) { setError(apiErrorMessage(e, 'No se pudo consultar disponibilidad.')); }
      finally { setLoadingRooms(false); }
    })();
  }, [entrada, salida]);

  async function save() {
    if (!cliente) return setError('Selecciona un cliente.');
    if (!habitacion) return setError('Selecciona una habitación disponible.');
    const cantidad = Number.parseInt(personas, 10);
    if (!Number.isInteger(cantidad) || cantidad < 1) return setError('La cantidad de personas debe ser mayor a 0.');
    setSaving(true); setError('');
    try {
      const created = await reservasApi.create({
        cliente: cliente.id,
        habitacion: habitacion.id,
        fecha_entrada: isoDate(entrada),
        fecha_salida: isoDate(salida),
        cantidad_personas: cantidad,
        estado: 'pendiente',
      });
      navigation.replace('DetalleReserva', { id: created.id });
    } catch (e) { setError(apiErrorMessage(e, 'No se pudo crear la reserva.')); }
    finally { setSaving(false); }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Nueva reserva</Text>
      <Text style={styles.subtitle}>Selecciona huésped, fechas y una habitación realmente disponible.</Text>

      <Label text="Cliente" />
      {loadingClients ? <ActivityIndicator color={colors.primary} /> : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choices}>
          {clientes.map((item) => <Choice key={item.id} active={cliente?.id === item.id} title={item.nombre} subtitle={`CI ${item.ci}`} onPress={() => setCliente(item)} />)}
        </ScrollView>
      )}

      <Label text="Fechas" />
      <View style={styles.dateRow}>
        <Pressable style={styles.dateButton} onPress={() => setShowEntrada(true)}><Text style={styles.dateLabel}>Entrada</Text><Text style={styles.dateValue}>{isoDate(entrada)}</Text></Pressable>
        <Pressable style={styles.dateButton} onPress={() => setShowSalida(true)}><Text style={styles.dateLabel}>Salida</Text><Text style={styles.dateValue}>{isoDate(salida)}</Text></Pressable>
      </View>
      {showEntrada && <DateTimePicker value={entrada} mode="date" minimumDate={new Date()} onChange={(_, date) => { setShowEntrada(Platform.OS === 'ios'); if (date) setEntrada(date); }} />}
      {showSalida && <DateTimePicker value={salida} mode="date" minimumDate={entrada} onChange={(_, date) => { setShowSalida(Platform.OS === 'ios'); if (date) setSalida(date); }} />}

      <Label text="Habitación disponible" />
      {loadingRooms ? <ActivityIndicator color={colors.primary} /> : habitaciones.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choices}>
          {habitaciones.map((item) => <Choice key={item.id} active={habitacion?.id === item.id} title={`Hab. ${item.numero}`} subtitle={`${item.tipo} · ${money(item.precio)}`} onPress={() => setHabitacion(item)} />)}
        </ScrollView>
      ) : <Text style={styles.muted}>No hay habitaciones disponibles para esas fechas.</Text>}

      <Label text="Cantidad de personas" />
      <TextInput style={styles.input} keyboardType="number-pad" value={personas} onChangeText={setPersonas} />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={[styles.save, saving && styles.disabled]} disabled={saving} onPress={save}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Crear reserva</Text>}
      </Pressable>
    </ScrollView>
  );
}

function Label({ text }) { return <Text style={styles.label}>{text}</Text>; }
function Choice({ active, title, subtitle, onPress }) {
  return <Pressable style={[styles.choice, active && styles.choiceActive]} onPress={onPress}><Text style={[styles.choiceTitle, active && styles.choiceTitleActive]}>{title}</Text><Text style={[styles.choiceSubtitle, active && styles.choiceSubtitleActive]}>{subtitle}</Text></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, content: { padding: 16, paddingBottom: 36 }, title: { fontSize: 25, fontWeight: '800', color: colors.text }, subtitle: { color: colors.muted, lineHeight: 20, marginTop: 4, marginBottom: 8 },
  label: { color: colors.text, fontWeight: '800', marginTop: 18, marginBottom: 9 }, choices: { gap: 9, paddingRight: 16 }, choice: { minWidth: 145, padding: 13, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 15 }, choiceActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  choiceTitle: { color: colors.text, fontWeight: '800' }, choiceTitleActive: { color: '#fff' }, choiceSubtitle: { color: colors.muted, fontSize: 12, marginTop: 4 }, choiceSubtitleActive: { color: '#cbd8e8' },
  dateRow: { flexDirection: 'row', gap: 9 }, dateButton: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 13 }, dateLabel: { color: colors.muted, fontSize: 12 }, dateValue: { color: colors.text, fontWeight: '800', marginTop: 4 },
  input: { minHeight: 49, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 13, paddingHorizontal: 14, fontSize: 16 }, muted: { color: colors.muted, paddingVertical: 8 }, error: { color: colors.danger, marginTop: 14, lineHeight: 20 },
  save: { minHeight: 52, backgroundColor: colors.primary, borderRadius: 14, marginTop: 20, alignItems: 'center', justifyContent: 'center' }, saveText: { color: '#fff', fontWeight: '800', fontSize: 16 }, disabled: { opacity: 0.65 },
});
