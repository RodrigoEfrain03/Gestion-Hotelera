import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { habitacionesApi } from '../api/habitaciones';
import { colors } from '../theme/colors';
import { money } from '../utils/format';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

export default function RoomsScreen({ navigation }) {
  const [items,setItems]=useState([]); const [loading,setLoading]=useState(true); const [refreshing,setRefreshing]=useState(false); const [error,setError]=useState('');
  const load=useCallback(async(silent=false)=>{if(!silent)setLoading(true);setError('');try{const d=await habitacionesApi.list();setItems(Array.isArray(d)?d:d?.results||[]);}catch{setError('No se pudieron cargar las habitaciones.');}finally{setLoading(false);setRefreshing(false);}},[]);
  useFocusEffect(useCallback(()=>{load();},[load]));
  return <View style={styles.screen}><View style={styles.header}><View style={{flex:1}}><Text style={styles.title}>Habitaciones</Text><Text style={styles.subtitle}>Estado y tarifas del hotel.</Text></View><Pressable style={({pressed})=>[styles.addButton,pressed&&styles.pressed]} onPress={()=>navigation.navigate('HabitacionForm')}><Ionicons name="add-circle-outline" size={18} color="#fff"/><Text style={styles.addText}>Nueva</Text></Pressable></View>
    {!!error&&<Text style={styles.error}>{error}</Text>}{loading?<View style={styles.loading}><ActivityIndicator color={colors.primary}/></View>:<FlatList data={items} keyExtractor={x=>String(x.id)} contentContainerStyle={items.length?styles.list:styles.emptyList} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true);load(true);}}/>} ListEmptyComponent={<EmptyState title="Sin habitaciones" description="Todavía no hay habitaciones registradas."/>} renderItem={({item})=><Pressable style={styles.card} onPress={()=>navigation.navigate('HabitacionForm',{item})}><View style={styles.top}><Text style={styles.number}>Habitación {item.numero}</Text><StatusBadge value={item.estado}/></View><Text style={styles.type}>{item.tipo}</Text><Text style={styles.price}>{money(item.precio)} / noche</Text></Pressable>}/>}</View>;
}
const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.background},
  header:{flexDirection:'row',alignItems:'center',padding:16,gap:12},
  title:{fontSize:25,fontWeight:'800',color:colors.text},
  subtitle:{color:colors.muted,marginTop:2},
  addButton:{backgroundColor:colors.primary,borderRadius:13,paddingHorizontal:14,paddingVertical:11,flexDirection:'row',alignItems:'center',gap:6,shadowColor:'#000',shadowOpacity:.08,shadowRadius:6,shadowOffset:{width:0,height:2},elevation:2},
  addText:{color:'#fff',fontWeight:'800'},
  error:{color:colors.danger,marginHorizontal:16,marginBottom:8},
  loading:{flex:1,alignItems:'center',justifyContent:'center'},
  list:{padding:16,paddingTop:4,paddingBottom:30,gap:10},
  emptyList:{flexGrow:1},
  card:{backgroundColor:colors.card,borderWidth:1,borderColor:colors.border,borderRadius:17,padding:15},
  top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  number:{fontSize:17,fontWeight:'800',color:colors.text},
  type:{color:colors.muted,marginTop:7},
  price:{fontWeight:'800',color:colors.navy,marginTop:10},
  pressed:{opacity:.8,transform:[{scale:.98}]},
});
