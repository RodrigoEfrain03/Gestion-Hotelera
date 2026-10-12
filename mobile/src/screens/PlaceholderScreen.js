import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function PlaceholderScreen({ title }) {
  return <View style={styles.screen}><Text style={styles.title}>{title}</Text><Text style={styles.text}>Este módulo se habilitará en la siguiente etapa móvil.</Text></View>;
}
const styles = StyleSheet.create({ screen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: colors.background }, title: { fontSize: 23, fontWeight: '800', color: colors.text }, text: { color: colors.muted, textAlign: 'center', marginTop: 8 } });
