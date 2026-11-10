// Pantalla de confirmación (RF-06): comprobante visual de la reserva.
import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import Boton from '../components/ui/Boton';
import { colores, radios, sombraFuerte } from '../constants/colors';
import { fechaCorta } from '../utils/fechas';
import { primerNombre } from '../utils/formato';

export default function Confirmacion() {
  const router = useRouter();
  const p = useLocalSearchParams();

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  const datosValidos = p.fecha && p.inicio && p.codigo;

  return (
    <View style={styles.pantalla}>
      <View style={styles.fondoOscuro} />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.contenido}>
          <View style={styles.cabecera}>
            <View style={styles.check}>
              <Ionicons name="checkmark" size={40} color={colores.blanco} />
            </View>
            <Text style={styles.titulo}>¡Listo, {primerNombre(p.nombre) || 'ya casi'}!</Text>
            <Text style={styles.subtitulo}>Tu mesa quedó reservada</Text>
          </View>

          {datosValidos ? (
            <View style={styles.tarjeta}>
              <View style={styles.fila}>
                <Dato etiqueta="FECHA" valor={fechaCorta(p.fecha)} />
                <View style={styles.separadorVertical} />
                <Dato etiqueta="HORA" valor={`${p.inicio} – ${p.fin}`} />
              </View>
              <View style={styles.separador} />
              <View style={styles.fila}>
                <Dato etiqueta="MESA" valor={`${p.mesa} · ${p.zona}`} />
                <View style={styles.separadorVertical} />
                <Dato etiqueta="PERSONAS" valor={p.personas} />
              </View>
              <View style={styles.separadorPunteado} />
              <View style={styles.codigoFila}>
                <Text style={styles.codigoEtiqueta}>Código</Text>
                <Text style={styles.codigo} selectable>
                  {p.codigo}
                </Text>
              </View>
            </View>
          ) : null}

          <Text style={styles.nota}>Presenta este código al llegar al restaurante.</Text>
        </ScrollView>

        <View style={styles.acciones}>
          <Boton titulo="Volver al inicio" onPress={() => router.dismissTo('/')} />
          <Boton titulo="Ver la carta" variante="texto" onPress={() => router.dismissTo('/carta')} />
        </View>
      </SafeAreaView>
    </View>
  );
}

function Dato({ etiqueta, valor }) {
  return (
    <View style={styles.dato}>
      <Text style={styles.datoEtiqueta}>{etiqueta}</Text>
      <Text style={styles.datoValor} numberOfLines={2}>
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
  check: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: colores.blanco,
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
  codigoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codigoEtiqueta: {
    fontSize: 13,
    color: colores.textoSuave,
  },
  codigo: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
    color: colores.primario,
  },
  nota: {
    textAlign: 'center',
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
