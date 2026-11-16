// Comprobante del pedido enviado a la cocina.
import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import Boton from '../components/ui/Boton';
import { usePedido } from '../context/Pedido';
import { colores, radios, sombraFuerte } from '../constants/colors';
import { formatearPrecio, primerNombre } from '../utils/formato';

export default function PedidoEnviado() {
  const router = useRouter();
  const p = useLocalSearchParams();
  const { cliente } = usePedido();

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  const nombre = primerNombre(cliente.nombre);
  const datosValidos = p.codigo && p.mesa;

  return (
    <View style={styles.pantalla}>
      <View style={styles.fondoOscuro} />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.contenido}>
          <View style={styles.cabecera}>
            <View style={styles.icono}>
              <Ionicons name="restaurant" size={34} color={colores.blanco} />
            </View>
            <Text style={styles.titulo}>¡Pedido enviado!</Text>
            <Text style={styles.subtitulo}>
              {nombre ? `${nombre}, la` : 'La'} cocina ya recibió tu pedido
            </Text>
          </View>

          {datosValidos ? (
            <View style={styles.tarjeta}>
              <View style={styles.fila}>
                <Dato etiqueta="PEDIDO" valor={p.codigo} destacado />
                <View style={styles.separadorVertical} />
                <Dato etiqueta="MESA" valor={`${p.mesa} · ${p.zona}`} />
              </View>
              <View style={styles.separador} />
              <View style={styles.fila}>
                <Dato etiqueta="PRODUCTOS" valor={p.productos} />
                <View style={styles.separadorVertical} />
                <Dato etiqueta="TOTAL" valor={formatearPrecio(p.total)} />
              </View>
              <View style={styles.separadorPunteado} />
              <View style={styles.aviso}>
                <Ionicons name="time-outline" size={18} color={colores.textoSuave} />
                <Text style={styles.avisoTexto}>Lo llevaremos a tu mesa cuando esté listo.</Text>
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.acciones}>
          <Boton titulo="Seguir pidiendo" icono="restaurant-outline" onPress={() => router.dismissTo('/carta')} />
          <Boton titulo="Volver al inicio" variante="texto" onPress={() => router.dismissTo('/')} />
        </View>
      </SafeAreaView>
    </View>
  );
}

function Dato({ etiqueta, valor, destacado = false }) {
  return (
    <View style={styles.dato}>
      <Text style={styles.datoEtiqueta}>{etiqueta}</Text>
      <Text style={[styles.datoValor, destacado && styles.datoDestacado]} numberOfLines={2} selectable>
        {valor}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  flex: {
    flex: 1,
  },
  fondoOscuro: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '46%',
    backgroundColor: colores.primario,
  },
  contenido: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 18,
  },
  cabecera: {
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 6,
    gap: 6,
  },
  icono: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colores.acento,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '800',
    color: colores.blanco,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radios.xl,
    padding: 18,
    ...sombraFuerte,
  },
  fila: {
    flexDirection: 'row',
  },
  dato: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 4,
  },
  datoEtiqueta: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colores.textoTenue,
  },
  datoValor: {
    fontSize: 17,
    fontWeight: '800',
    color: colores.texto,
  },
  datoDestacado: {
    color: colores.primario,
    letterSpacing: 1,
  },
  separador: {
    height: 1,
    backgroundColor: colores.borde,
    marginVertical: 8,
  },
  separadorVertical: {
    width: 1,
    backgroundColor: colores.borde,
    marginHorizontal: 12,
  },
  separadorPunteado: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colores.bordeFuerte,
    marginTop: 14,
    marginBottom: 14,
  },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avisoTexto: {
    flex: 1,
    fontSize: 13,
    color: colores.textoSuave,
  },
  acciones: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 4,
  },
});
