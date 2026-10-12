import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import ReservationsScreen from '../screens/ReservationsScreen';
import ReservationDetailScreen from '../screens/ReservationDetailScreen';
import NewReservationScreen from '../screens/NewReservationScreen';
import CheckInScreen from '../screens/CheckInScreen';
import MoreScreen from '../screens/MoreScreen';
import ClientsScreen from '../screens/ClientsScreen';
import ClientFormScreen from '../screens/ClientFormScreen';
import RoomsScreen from '../screens/RoomsScreen';
import RoomFormScreen from '../screens/RoomFormScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import PaymentDetailScreen from '../screens/PaymentDetailScreen';
import { colors } from '../theme/colors';

const Tabs=createBottomTabNavigator(); const Stack=createNativeStackNavigator();
const stackOptions={headerStyle:{backgroundColor:colors.card},headerTintColor:colors.navy,headerShadowVisible:false};
function ReservationsStack(){return <Stack.Navigator screenOptions={stackOptions}><Stack.Screen name="ReservasLista" component={ReservationsScreen} options={{headerShown:false}}/><Stack.Screen name="DetalleReserva" component={ReservationDetailScreen} options={{title:'Detalle de reserva'}}/><Stack.Screen name="NuevaReserva" component={NewReservationScreen} options={{title:'Nueva reserva'}}/></Stack.Navigator>}
function PaymentsStack(){return <Stack.Navigator screenOptions={stackOptions}><Stack.Screen name="PagosLista" component={PaymentsScreen} options={{headerShown:false}}/><Stack.Screen name="DetallePago" component={PaymentDetailScreen} options={{title:'Detalle de pago'}}/></Stack.Navigator>}
function MoreStack(){return <Stack.Navigator screenOptions={stackOptions}><Stack.Screen name="MasInicio" component={MoreScreen} options={{headerShown:false}}/><Stack.Screen name="Clientes" component={ClientsScreen} options={{title:'Clientes'}}/><Stack.Screen name="ClienteForm" component={ClientFormScreen} options={({route})=>({title:route.params?.item?'Editar cliente':'Nuevo cliente'})}/><Stack.Screen name="Habitaciones" component={RoomsScreen} options={{title:'Habitaciones'}}/><Stack.Screen name="HabitacionForm" component={RoomFormScreen} options={({route})=>({title:route.params?.item?'Editar habitación':'Nueva habitación'})}/></Stack.Navigator>}
const icons={Inicio:['home','home-outline'],Reservas:['calendar','calendar-outline'],CheckIn:['log-in','log-in-outline'],Pagos:['card','card-outline'],Mas:['grid','grid-outline']};
function TabIcon({route,focused,color}){return <View style={[navStyles.iconWrap,focused&&navStyles.iconWrapActive]}><Ionicons name={icons[route.name]?.[focused?0:1]||'ellipse-outline'} size={22} color={focused?'#fff':color}/></View>}
export default function AppNavigator(){return <Tabs.Navigator screenOptions={({route})=>({headerShown:false,tabBarActiveTintColor:colors.primary,tabBarInactiveTintColor:colors.muted,tabBarHideOnKeyboard:true,tabBarStyle:{height:76,paddingTop:7,paddingBottom:8,borderTopWidth:1,borderTopColor:colors.border,backgroundColor:colors.card},tabBarItemStyle:{paddingTop:2},tabBarLabelStyle:{fontSize:11,fontWeight:'800',marginTop:2},tabBarIcon:({focused,color})=><TabIcon route={route} focused={focused} color={color}/>})}><Tabs.Screen name="Inicio" component={DashboardScreen}/><Tabs.Screen name="Reservas" component={ReservationsStack}/><Tabs.Screen name="CheckIn" component={CheckInScreen} options={{tabBarLabel:'Check-in'}}/><Tabs.Screen name="Pagos" component={PaymentsStack} options={{tabBarLabel:'Pagos'}}/><Tabs.Screen name="Mas" component={MoreStack} options={{tabBarLabel:'Más'}}/></Tabs.Navigator>}
const navStyles=StyleSheet.create({iconWrap:{width:38,height:32,borderRadius:12,alignItems:'center',justifyContent:'center'},iconWrapActive:{backgroundColor:colors.primary}});
