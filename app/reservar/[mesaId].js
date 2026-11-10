// Pantalla "Reservar mesa" (RF-02 a RF-05, caso de uso CU-02).
// Fecha → horario (almuerzo / noche) → personas y datos → confirmar.
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import SelectorFecha from '../../components/SelectorFecha';
import SlotButton from '../../components/SlotButton';
import Boton from '../../components/ui/Boton';
import Campo from '../../components/ui/Campo';
import { AvisoError, Cargando, ErrorEstado, Vacio } from '../../components/ui/Estados';
import { useDatos } from '../../hooks/useDatos';
import { obtenerMesa } from '../../services/mesas';
import { obtenerHorarios } from '../../services/horarios';
import {
  crearReserva,
  fechaHabilitada,
  marcarDisponibilidad,
  obtenerReservas,
  primeraFechaHabilitada,
  slotsDeFecha,
  validarDatosCliente,
} from '../../services/reservas';
import { ANCHO_MAX, colores, radios, TACTIL_MIN } from '../../constants/colors';
import { ETIQUETA_ZONA, JORNADAS } from '../../constants/config';
import { aMinutos, fechaCorta } from '../../utils/fechas';
import { codigoReserva, pluralizar } from '../../utils/formato';

export default function ReservarMesa() {
  const { mesaId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const base = useDatos(async () => {
    const [mesa, horarios] = await Promise.all([obtenerMesa(mesaId), obtenerHorarios()]);
    return { mesa, horarios };
  }, [mesaId]);
  const mesa = base.datos?.mesa;
  const horarios = base.datos?.horarios;

  const [fechaElegida, setFecha] = useState(null);
  const [slotElegido, setSlot] = useState(null);
  const [personasElegidas, setPersonas] = useState(2);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Mientras el cliente no elija, se usa el primer día con horarios disponibles.
  const primeraFecha = useMemo(() => (horarios ? primeraFechaHabilitada(horarios) : null), [horarios]);
  const fecha = fechaElegida ?? primeraFecha;

  // Nunca más personas que la capacidad de la mesa.
  const personas = mesa ? Math.min(personasElegidas, mesa.capacidad) : personasElegidas;

  // Reservas de esa mesa en la fecha elegida (para marcar los slots ocupados).
  const reservasDia = useDatos(
    () => (fecha ? obtenerReservas({ fecha, mesaId, incluirCanceladas: false }) : []),
    [mesaId, fecha],
  );

  const slots = useMemo(() => {
    if (!horarios || !fecha || !reservasDia.datos) return [];
    return marcarDisponibilidad(slotsDeFecha(horarios, fecha), reservasDia.datos, fecha);
  }, [horarios, fecha, reservasDia.datos]);

  // Si el horario elegido dejó de estar libre (otra persona lo tomó), se descarta.
  const slot =
    slotElegido && slots.some((s) => s.inicio === slotElegido.inicio && s.estado === 'libre')
      ? slotElegido
      : null;

  if (base.cargando && !base.datos) return <Cargando texto="Cargando mesa…" />;
  if (base.error && !base.datos) {
    return (
      <SafeAreaView style={styles.pantalla}>
        <BarraSuperior onAtras={() => router.back()} />
        <ErrorEstado error={base.error} onReintentar={base.recargar} />
      </SafeAreaView>
    );
  }
  if (!mesa || !mesa.activa) {
    return (
      <SafeAreaView style={styles.pantalla}>
        <BarraSuperior onAtras={() => router.back()} />
        <Vacio
          icono="close-circle-outline"
          titulo="Mesa no disponible"
          mensaje="Esta mesa no está recibiendo reservas en este momento. Elige otra desde el inicio."
        >
          <Boton titulo="Ver mesas" onPress={() => router.back()} compacto estilo={styles.margenArriba} />
        </Vacio>
      </SafeAreaView>
    );
  }

  const cambiarFecha = (nueva) => {
    setFecha(nueva);
    setSlot(null);
    setMensaje(null);
  };

  const tocarSlot = (s) => {
    if (s.estado === 'ocupado') {
      setMensaje('Ese horario ya está reservado. Elige otro, por favor.');
      return;
    }
    if (s.estado === 'pasado') {
      setMensaje('Ese horario ya pasó. Elige uno más tarde.');
      return;
    }
    setMensaje(null);
    setSlot(s);
  };

  const tocarPersonas = (n) => {
    if (n > mesa.capacidad) {
      setMensaje(`Esta mesa admite máximo ${mesa.capacidad} personas. Elige un número menor u otra mesa.`);
      return;
    }
    setMensaje(null);
    setPersonas(n);
  };

  const confirmar = async () => {
    if (!slot) {
      setMensaje('Elige un horario para tu reserva.');
      return;
    }
    const error = validarDatosCliente({ nombre, telefono, personas, capacidad: mesa.capacidad });
    if (error) {
      setMensaje(error);
      return;
    }
    setEnviando(true);
    setMensaje(null);
    try {
      const { reserva } = await crearReserva({ mesaId: mesa.id, fecha, slot, nombre, telefono, personas });
      router.replace({
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
      if (e.codigo === 'DUPLICADO') {
        setSlot(null);
        reservasDia.recargarSilencioso();
      }
    } finally {
      setEnviando(false);
    }
  };

  const botonesPersonas = Array.from({ length: Math.min(Math.max(6, mesa.capacidad), 12) }, (_, i) => i + 1);
  const duracion = slots.length
    ? duracionSlot(slots[0])
    : horarios.find((h) => h.activo)?.duracion_slot || 60;
  const resumen = slot
    ? `${fechaCorta(fecha)} · ${slot.inicio} – ${slot.fin} · ${pluralizar(personas, 'persona', 'personas')}`
    : fecha
      ? `${fechaCorta(fecha)} · elige un horario`
      : 'Elige una fecha';

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
          <BarraSuperior onAtras={() => router.back()} paso="Paso 2 de 3" />

          <View>
            <Text style={styles.titulo}>
              {mesa.nombre} · {ETIQUETA_ZONA[mesa.zona]}
            </Text>
            <Text style={styles.subtitulo}>Hasta {pluralizar(mesa.capacidad, 'persona', 'personas')}</Text>
            <View style={styles.progreso}>
              <View style={styles.progresoRelleno} />
            </View>
          </View>

          {fecha ? (
            <SelectorFecha
              fecha={fecha}
              onCambiar={cambiarFecha}
              estaHabilitada={(iso) => fechaHabilitada(horarios, iso)}
            />
          ) : (
            <Vacio
              icono="calendar-outline"
              titulo="Sin horarios disponibles"
              mensaje="El restaurante no tiene horarios de atención habilitados en los próximos días."
            />
          )}

          {fecha ? (
            <View style={styles.horarios}>
              {reservasDia.cargando ? (
                <ActivityIndicator color={colores.primario} style={styles.margenArriba} />
              ) : reservasDia.error && !reservasDia.datos ? (
                <AvisoError error={reservasDia.error} onReintentar={reservasDia.recargar} />
              ) : (
                <View style={styles.columnas}>
                  {JORNADAS.map((j) => {
                    const deJornada = slots.filter((s) => s.jornada === j.valor);
                    return (
                      <View key={j.valor} style={styles.columna}>
                        <Text style={styles.jornada}>{j.etiqueta}</Text>
                        {deJornada.length === 0 ? (
                          <Text style={styles.cerrado}>Cerrado</Text>
                        ) : (
                          deJornada.map((s) => (
                            <SlotButton
                              key={s.inicio}
                              slot={s}
                              elegido={slot?.inicio === s.inicio}
                              onPress={() => tocarSlot(s)}
                            />
                          ))
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
              <View style={styles.nota}>
                <Ionicons name="information-circle-outline" size={18} color={colores.textoSuave} />
                <Text style={styles.notaTexto}>
                  Cada reserva dura {duracion} min. Los horarios en gris ya están reservados o ya
                  pasaron.
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.personas}>
            <Text style={styles.etiqueta}>
              Personas <Text style={styles.ayuda}>· máx. {mesa.capacidad}</Text>
            </Text>
            <ScrollView
              horizontal
              scrollEnabled={botonesPersonas.length > 6}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.personasFila,
                botonesPersonas.length <= 6 && styles.personasFilaCompleta,
              ]}
            >
              {botonesPersonas.map((n) => {
                const elegido = n === personas;
                const excede = n > mesa.capacidad;
                return (
                  <Pressable
                    key={n}
                    onPress={() => tocarPersonas(n)}
                    style={[
                      styles.persona,
                      botonesPersonas.length <= 6 && styles.personaFlexible,
                      elegido && styles.personaElegida,
                      excede && styles.personaExcede,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`${n} ${n === 1 ? 'persona' : 'personas'}${excede ? ', supera la capacidad' : ''}`}
                    accessibilityState={{ selected: elegido }}
                  >
                    <Text
                      style={[
                        styles.personaTexto,
                        elegido && styles.personaTextoElegido,
                        excede && styles.personaTextoExcede,
                      ]}
                    >
                      {n}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.formulario}>
            <Campo
              tipo="linea"
              placeholder="Nombre completo"
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              maxLength={80}
              returnKeyType="next"
            />
            <Campo
              tipo="linea"
              placeholder="Teléfono (opcional)"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              maxLength={20}
            />
          </View>

          {mensaje ? (
            <View style={styles.mensaje} accessibilityLiveRegion="polite">
              <Ionicons name="alert-circle" size={18} color={colores.error} />
              <Text style={styles.mensajeTexto}>{mensaje}</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.pie, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <Text style={styles.resumen} numberOfLines={1}>
            {resumen}
          </Text>
          <Boton
            titulo="Confirmar reserva"
            onPress={confirmar}
            cargando={enviando}
            deshabilitado={!slot || !nombre.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function duracionSlot(s) {
  return aMinutos(s.fin) - aMinutos(s.inicio);
}

function BarraSuperior({ onAtras, paso }) {
  return (
    <View style={styles.barra}>
      <Pressable
        onPress={onAtras}
        style={styles.atras}
        accessibilityRole="button"
        accessibilityLabel="Volver"
        hitSlop={8}
      >
        <Ionicons name="arrow-back" size={22} color={colores.texto} />
      </Pressable>
      {paso ? <Text style={styles.paso}>{paso}</Text> : null}
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
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    minHeight: TACTIL_MIN,
  },
  atras: {
    width: TACTIL_MIN,
    height: TACTIL_MIN,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paso: {
    fontSize: 12,
    color: colores.textoSuave,
    fontWeight: '600',
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
    width: '66%',
    height: '100%',
    borderRadius: 2,
    backgroundColor: colores.acento,
  },
  horarios: {
    gap: 14,
  },
  columnas: {
    flexDirection: 'row',
    gap: 12,
  },
  columna: {
    flex: 1,
    gap: 8,
  },
  jornada: {
    fontSize: 14,
    fontWeight: '700',
    color: colores.texto,
    marginBottom: 2,
  },
  cerrado: {
    fontSize: 13,
    color: colores.textoTenue,
    paddingVertical: 10,
  },
  nota: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colores.superficieTenue,
    borderRadius: radios.md,
    padding: 12,
  },
  notaTexto: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: colores.textoSuave,
  },
  personas: {
    gap: 10,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '700',
    color: colores.texto,
  },
  ayuda: {
    fontSize: 13,
    fontWeight: '400',
    color: colores.textoSuave,
  },
  personasFila: {
    gap: 8,
    paddingVertical: 2,
  },
  personasFilaCompleta: {
    flexGrow: 1,
  },
  personaFlexible: {
    flex: 1,
    width: undefined,
  },
  persona: {
    width: TACTIL_MIN,
    height: TACTIL_MIN,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.bordeFuerte,
    backgroundColor: colores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personaElegida: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  personaExcede: {
    backgroundColor: colores.superficieTenue,
    borderColor: colores.superficieTenue,
  },
  personaTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
  },
  personaTextoElegido: {
    color: colores.blanco,
  },
  personaTextoExcede: {
    color: colores.bordeFuerte,
  },
  formulario: {
    gap: 6,
  },
  mensaje: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colores.errorFondo,
    borderRadius: radios.md,
    padding: 12,
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
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    backgroundColor: colores.fondo,
  },
  resumen: {
    textAlign: 'center',
    fontSize: 13,
    color: colores.textoSuave,
  },
  margenArriba: {
    marginTop: 12,
  },
});
