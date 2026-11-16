// Pantalla "Tus datos" (RF-05, caso de uso CU-02) · Paso 3 de 3.
// Recibe la mesa, fecha, horario y personas del paso 2, pide nombre y
// teléfono, guarda la reserva y muestra el comprobante.
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import BarraSuperior from '../../components/BarraSuperior';
import Boton from '../../components/ui/Boton';
import Campo from '../../components/ui/Campo';
import { Cargando, ErrorEstado, Vacio } from '../../components/ui/Estados';
import { useDatos } from '../../hooks/useDatos';
import { obtenerMesa } from '../../services/mesas';
import { crearReserva, validarDatosCliente } from '../../services/reservas';
import { ANCHO_MAX, colores, radios, sombra } from '../../constants/colors';
import { ETIQUETA_ZONA } from '../../constants/config';
import { fechaCorta } from '../../utils/fechas';
import { codigoReserva, pluralizar } from '../../utils/formato';

// Errores en los que el horario ya no sirve y hay que volver a elegir.
const CODIGOS_HORARIO_PERDIDO = ['DUPLICADO', 'PASADO', 'MESA_INACTIVA'];

export default function DatosReserva() {
  const p = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const mesaId = p.mesaId;
  const fecha = p.fecha;
  const slot = { inicio: p.inicio, fin: p.fin };
  const personas = Number(p.personas);
  const paramsValidos =
    mesaId &&
    /^\d{4}-\d{2}-\d{2}$/.test(fecha || '') &&
    /^\d{2}:\d{2}$/.test(slot.inicio || '') &&
    /^\d{2}:\d{2}$/.test(slot.fin || '') &&
    personas >= 1;

  const base = useDatos(() => (paramsValidos ? obtenerMesa(mesaId) : null), [mesaId]);
  const mesa = base.datos;

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [horarioPerdido, setHorarioPerdido] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const volver = () => router.back();

  if (!paramsValidos) {
    return (
      <SafeAreaView style={styles.pantalla}>
        <View style={styles.contenido}>
          <BarraSuperior onAtras={() => router.dismissTo('/')} />
        </View>
        <Vacio
          icono="calendar-outline"
          titulo="Falta elegir el horario"
          mensaje="Vuelve al inicio, elige una mesa y un horario para continuar con tu reserva."
        >
          <Boton titulo="Ver mesas" onPress={() => router.dismissTo('/')} compacto estilo={styles.margenArriba} />
        </Vacio>
      </SafeAreaView>
    );
  }
  if (base.cargando && !base.datos) return <Cargando texto="Cargando reserva…" />;
  if (base.error && !base.datos) {
    return (
      <SafeAreaView style={styles.pantalla}>
        <View style={styles.contenido}>
          <BarraSuperior onAtras={volver} />
        </View>
        <ErrorEstado error={base.error} onReintentar={base.recargar} />
      </SafeAreaView>
    );
  }
  if (!mesa || !mesa.activa) {
    return (
      <SafeAreaView style={styles.pantalla}>
        <View style={styles.contenido}>
          <BarraSuperior onAtras={() => router.dismissTo('/')} />
        </View>
        <Vacio
          icono="close-circle-outline"
          titulo="Mesa no disponible"
          mensaje="Esta mesa no está recibiendo reservas en este momento. Elige otra desde el inicio."
        >
          <Boton titulo="Ver mesas" onPress={() => router.dismissTo('/')} compacto estilo={styles.margenArriba} />
        </Vacio>
      </SafeAreaView>
    );
  }

  const cambiarNombre = (texto) => {
    setNombre(texto);
    if (mensaje && !horarioPerdido) setMensaje(null);
  };

  const cambiarTelefono = (texto) => {
    setTelefono(texto);
    if (mensaje && !horarioPerdido) setMensaje(null);
  };

  const confirmar = async () => {
    if (enviando) return;
    const error = validarDatosCliente({ nombre, telefono, personas, capacidad: mesa.capacidad });
    if (error) {
      setMensaje(error);
      return;
    }
    setEnviando(true);
    setMensaje(null);
    try {
      const { reserva } = await crearReserva({ mesaId: mesa.id, fecha, slot, nombre, telefono, personas });
      // El comprobante queda encima del inicio: "atrás" no vuelve al formulario.
      router.dismissAll();
      router.push({
        pathname: '/confirmacion',
        params: {
          nombre: reserva.cliente_nombre,
          fecha: reserva.fecha,
          inicio: reserva.hora_inicio,
          fin: reserva.hora_fin,
          mesa: mesa.nombre,
          zona: ETIQUETA_ZONA[mesa.zona],
          personas: String(reserva.num_personas),
          codigo: codigoReserva(reserva.id),
        },
      });
    } catch (e) {
      setMensaje(e.message);
      setHorarioPerdido(CODIGOS_HORARIO_PERDIDO.includes(e.codigo));
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.contenido}
          keyboardShouldPersistTaps="handled"
        >
          <BarraSuperior onAtras={volver} paso="Paso 3 de 3" />

          <View>
            <Text style={styles.titulo}>Tus datos</Text>
            <Text style={styles.subtitulo}>Escríbelos para apartar la mesa a tu nombre.</Text>
            <View style={styles.progreso}>
              <View style={styles.progresoRelleno} />
            </View>
          </View>

          <View style={styles.tarjeta}>
            <View style={styles.tarjetaCabecera}>
              <Text style={styles.tarjetaTitulo}>Tu reserva</Text>
              <Pressable
                onPress={volver}
                accessibilityRole="button"
                accessibilityLabel="Cambiar fecha, horario o personas"
                hitSlop={10}
              >
                <Text style={styles.cambiar}>Cambiar</Text>
              </Pressable>
            </View>
            <Detalle icono="restaurant-outline" texto={`${mesa.nombre} · ${ETIQUETA_ZONA[mesa.zona]}`} />
            <Detalle icono="calendar-outline" texto={fechaCorta(fecha)} />
            <Detalle icono="time-outline" texto={`${slot.inicio} – ${slot.fin}`} />
            <Detalle icono="people-outline" texto={pluralizar(personas, 'persona', 'personas')} />
          </View>

          <View style={styles.formulario}>
            <Campo
              etiqueta="Nombre completo"
              placeholder="Ej. Laura Gómez"
              value={nombre}
              onChangeText={cambiarNombre}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              maxLength={80}
              returnKeyType="next"
            />
            <Campo
              etiqueta="Teléfono (opcional)"
              placeholder="Ej. 300 123 4567"
              ayuda="Entre 7 y 15 dígitos."
              value={telefono}
              onChangeText={cambiarTelefono}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              maxLength={20}
              returnKeyType="done"
              onSubmitEditing={confirmar}
            />
          </View>

          {mensaje ? (
            <View style={styles.mensaje} accessibilityLiveRegion="polite">
              <View style={styles.mensajeFila}>
                <Ionicons name="alert-circle" size={18} color={colores.error} />
                <Text style={styles.mensajeTexto}>{mensaje}</Text>
              </View>
              {horarioPerdido ? (
                <Boton titulo="Elegir otro horario" variante="secundario" compacto onPress={volver} />
              ) : null}
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.pie, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <Boton
            titulo="Confirmar reserva"
            onPress={confirmar}
            cargando={enviando}
            deshabilitado={horarioPerdido}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Detalle({ icono, texto }) {
  return (
    <View style={styles.detalle}>
      <Ionicons name={icono} size={18} color={colores.textoSuave} />
      <Text style={styles.detalleTexto}>{texto}</Text>
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
  contenido: {
    width: '100%',
    maxWidth: ANCHO_MAX,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '800',
    color: colores.texto,
  },
  subtitulo: {
    fontSize: 13,
    color: colores.textoSuave,
    marginTop: 2,
  },
  progreso: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colores.borde,
    marginTop: 12,
    overflow: 'hidden',
  },
  progresoRelleno: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
    backgroundColor: colores.acento,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radios.lg,
    padding: 16,
    gap: 10,
    ...sombra,
  },
  tarjetaCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  tarjetaTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: colores.texto,
  },
  cambiar: {
    fontSize: 13,
    fontWeight: '700',
    color: colores.acentoTexto,
  },
  detalle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detalleTexto: {
    flex: 1,
    fontSize: 15,
    color: colores.texto,
  },
  formulario: {
    gap: 16,
  },
  mensaje: {
    gap: 10,
    backgroundColor: colores.errorFondo,
    borderRadius: radios.md,
    padding: 12,
  },
  mensajeFila: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  mensajeTexto: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colores.error,
  },
  pie: {
    width: '100%',
    maxWidth: ANCHO_MAX,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    backgroundColor: colores.fondo,
  },
  margenArriba: {
    marginTop: 12,
  },
});
