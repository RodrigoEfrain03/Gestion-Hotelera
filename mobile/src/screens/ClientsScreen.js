import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { clientesApi } from '../api/clientes';
import { colors } from '../theme/colors';
import EmptyState from '../components/EmptyState';

export default function ClientsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await clientesApi.list();
      setItems(Array.isArray(data) ? data : data?.results || []);
    } catch { setError('No se pudieron cargar los clientes.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const q = query.trim().toLowerCase();
  const filtered = items.filter((x) => !q || [x.nombre, x.ci, x.telefono, x.correo].some((v) => String(v || '').toLowerCase().includes(q)));

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}><Text style={styles.title}>Clientes</Text><Text style={styles.subtitle}>Huéspedes registrados.</Text></View>
        <Pressable style={({pressed})=>[styles.addButton,pressed&&styles.pressed]} onPress={() => navigation.navigate('ClienteForm')}><Ionicons name="person-add-outline" size={18} color="#fff"/><Text style={styles.addText}>Nuevo</Text></Pressable>
      </View>
      <TextInput style={styles.search} value={query} onChangeText={setQuery} placeholder="Buscar nombre, CI, teléfono o correo" />
      {!!error && <Text style={styles.error}>{error}</Text>}
      {loading ? <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View> : (
        <FlatList data={filtered} keyExtractor={(item) => String(item.id)} contentContainerStyle={filtered.length ? styles.list : styles.emptyList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
          ListEmptyComponent={<EmptyState title="Sin clientes" description="No encontramos clientes con esa búsqueda." />}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => navigation.navigate('ClienteForm', { item })}>
              <Text style={styles.name}>{item.nombre}</Text>
              <Text style={styles.meta}>CI: {item.ci}</Text>
              <Text style={styles.meta}>{item.telefono} · {item.correo || 'Sin correo'}</Text>
            </Pressable>
          )} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.background},
  header:{flexDirection:'row',alignItems:'center',padding:16,gap:12},
  title:{fontSize:25,fontWeight:'800',color:colors.text},
  subtitle:{color:colors.muted,marginTop:2},
  addButton:{backgroundColor:colors.primary,borderRadius:13,paddingHorizontal:14,paddingVertical:11,flexDirection:'row',alignItems:'center',gap:6,shadowColor:'#000',shadowOpacity:.08,shadowRadius:6,shadowOffset:{width:0,height:2},elevation:2},
  addText:{color:'#fff',fontWeight:'800'},
  search:{marginHorizontal:16,marginBottom:12,minHeight:48,backgroundColor:colors.card,borderRadius:13,borderWidth:1,borderColor:colors.border,paddingHorizontal:14},
  error:{color:colors.danger,marginHorizontal:16,marginBottom:8},
  loading:{flex:1,alignItems:'center',justifyContent:'center'},
  list:{padding:16,paddingTop:4,paddingBottom:30,gap:10},
  emptyList:{flexGrow:1},
  card:{backgroundColor:colors.card,borderWidth:1,borderColor:colors.border,borderRadius:17,padding:15},
  name:{fontSize:17,fontWeight:'800',color:colors.text},
  meta:{color:colors.muted,marginTop:5},
  pressed:{opacity:.8,transform:[{scale:.98}]},
});
