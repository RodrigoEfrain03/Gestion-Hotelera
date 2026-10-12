import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

const config = {
  pendiente: [colors.warningSoft, colors.warning],
  confirmada: [colors.successSoft, colors.success],
  cancelada: [colors.dangerSoft, colors.danger],
  finalizada: ['#edf0f4', colors.muted],
  pagado: [colors.successSoft, colors.success],
  parcial: [colors.warningSoft, colors.warning],
  anulado: [colors.dangerSoft, colors.danger],
  sin_total: ['#edf0f4', colors.muted],
};

export default function StatusBadge({ value }) {
  const key = String(value || '').toLowerCase();
  const [bg, text] = config[key] || [colors.primarySoft, colors.primary];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{value || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  text: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
});
