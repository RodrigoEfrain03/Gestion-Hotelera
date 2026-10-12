import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function EmptyState({ title, description }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 48, paddingHorizontal: 24, alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 6 },
  description: { color: colors.muted, textAlign: 'center', lineHeight: 20 },
});
