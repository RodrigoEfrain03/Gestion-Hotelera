import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { clientesApi } from '../api/clientes';
import { colors } from '../theme/colors';
import { apiErrorMessage } from '../utils/format';

export default function ClientFormScreen({ route, navigation }) {
  const item = route.params?.item;
  const [nombre, setNombre] = useState(item?.nombre || '');
  const [ci, setCi] = useState(item?.ci || '');
  const [telefono, setTelefono] = useState(item?.telefono || '');
  const [correo, setCorreo] = useState(item?.correo || '');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!nombre.trim() || !ci.trim() || !telefono.trim()) return Alert.alert('Faltan datos', 'Completa nombre, CI y teléfono.');
    setSaving(true);
    try {
      const payload = { nombre: nombre.trim(), ci: ci.trim(), telefono: telefono.trim(), correo: correo.trim() };
      if (item?.id) await clientesApi.update(item.id, payload); else await clientesApi.create(payload);
      Alert.alert('Listo', item ? 'Cliente actualizado.' : 'Cliente registrado.');
      navigation.goBack();
    } catch (e) { Alert.alert('No se pudo guardar', apiErrorMessage(e)); }
    finally { setSaving(false); }
  }

  return <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Nombre completo</Text><TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre del huésped" />
      <Text style={styles.label}>CI / documento</Text><TextInput style={styles.input} value={ci} onChangeText={setCi} placeholder="Documento" />
      <Text style={styles.label}>Teléfono</Text><TextInput style={styles.input} value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" placeholder="Teléfono" />
      <Text style={styles.label}>Correo</Text><TextInput style={styles.input} value={correo} onChangeText={setCorreo} autoCapitalize="none" keyboardType="email-address" placeholder="correo@ejemplo.com" />
      <Pressable style={[styles.button,saving&&{opacity:.6}]} disabled={saving} onPress={save}><Text style={styles.buttonText}>{saving?'Guardando...':item?'Guardar cambios':'Registrar cliente'}</Text></Pressable>
    </ScrollView>
  </KeyboardAvoidingView>;
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:colors.background},content:{padding:18,paddingBottom:40},label:{fontWeight:'700',color:colors.text,marginBottom:7,marginTop:12},input:{minHeight:50,backgroundColor:colors.card,borderWidth:1,borderColor:colors.border,borderRadius:13,paddingHorizontal:14,fontSize:15},button:{marginTop:24,minHeight:52,borderRadius:14,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'},buttonText:{color:'#fff',fontWeight:'800',fontSize:16}});
