// Panel de administración: pestañas Mesas, Horarios y Reservas.
// La gestión de la carta se abre con el botón "Carta" de la barra superior.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import BarraPildora from '../BarraPildora';
import AdminMesas from './AdminMesas';
import AdminHorarios from './AdminHorarios';
import AdminReservas from './AdminReservas';
import { useAdminAuth } from '../../context/AdminAuth';
import { ANCHO_MAX, colores, radios, TACTIL_MIN } from '../../constants/colors';

const SECCIONES = [
  { clave: 'mesas', etiqueta: 'Mesas', icono: 'grid' },
  { clave: 'horarios', etiqueta: 'Horarios', icono: 'time' },
  { clave: 'reservas', etiqueta: 'Reservas', icono: 'calendar' },
];

export default function PanelAdmin() {
  const router = useRouter();
  const { cerrarSesion } = useAdminAuth();
  // Las reservas se abren por defecto.
  const [seccion, setSeccion] = useState('reservas');
  const titulo = SECCIONES.find((s) => s.clave === seccion).etiqueta;

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <View style={styles.encabezado}>
        <View style={styles.filaSuperior}>
          <Text style={styles.etiquetaPanel}>Panel admin</Text>
          <View style={styles.iconos}>
            <BotonIcono icono="home-outline" etiqueta="Ir a la app" onPress={() => router.navigate('/')} />
            <BotonIcono icono="log-out-outline" etiqueta="Cerrar sesión" onPress={cerrarSesion} />
          </View>
        </View>
        <View style={styles.filaTitulo}>
          <Text style={styles.titulo}>{titulo}</Text>
          <Pressable
            onPress={() => router.push('/admin-carta')}
            style={({ pressed }) => [styles.botonCarta, pressed && styles.presionado]}
            accessibilityRole="button"
            accessibilityLabel="Gestionar la carta"
          >
            <Ionicons name="restaurant-outline" size={15} color={colores.primario} />
            <Text style={styles.botonCartaTexto}>Carta</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.contenido}>
        {seccion === 'mesas' ? <AdminMesas /> : null}
        {seccion === 'horarios' ? <AdminHorarios /> : null}
        {seccion === 'reservas' ? <AdminReservas /> : null}
      </View>

      <BarraPildora items={SECCIONES} activo={seccion} onSeleccionar={setSeccion} />
    </SafeAreaView>
  );
}

function BotonIcono({ icono, etiqueta, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.botonIcono, pressed && styles.presionado]}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      hitSlop={4}
    >
      <Ionicons name={icono} size={20} color={colores.textoSuave} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  encabezado: {
    width: '100%',
    maxWidth: ANCHO_MAX,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etiquetaPanel: {
    fontSize: 12,
    color: colores.textoSuave,
  },
  iconos: {
    flexDirection: 'row',
    marginRight: -8,
  },
  botonIcono: {
    width: TACTIL_MIN,
    height: TACTIL_MIN,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radios.pildora,
  },
  filaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titulo: {
    fontSize: 28,
    fontWeight: '800',
    color: colores.texto,
  },
  botonCarta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: radios.pildora,
    borderWidth: 1.5,
    borderColor: colores.primario,
  },
  botonCartaTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: colores.primario,
  },
  presionado: {
    opacity: 0.7,
  },
  contenido: {
    flex: 1,
  },
});
