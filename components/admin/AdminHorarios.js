// Horarios del panel (RF-11): duración de cada reserva y los 7 días de la
// semana con sus jornadas de almuerzo y noche, editables.
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Chip from '../ui/Chip';
import Interruptor from '../ui/Interruptor';
import { AvisoError, Cargando, ErrorEstado } from '../ui/Estados';
import FormHorario from './FormHorario';
import { useDatos } from '../../hooks/useDatos';
import {
  actualizarDuracion,
  cambiarEstadoHorario,
  duracionActual,
  obtenerHorarios,
} from '../../services/horarios';
import { ANCHO_MAX, colores, radios } from '../../constants/colors';
import { DIAS_ORDEN, DURACIONES_SLOT, ETIQUETA_DIA, JORNADAS } from '../../constants/config';
import { rango12 } from '../../utils/fechas';
import { avisar } from '../../utils/dialogos';

export default function AdminHorarios() {
  const { datos, error, cargando, refrescando, recargar, recargarSilencioso } = useDatos(() =>
    obtenerHorarios(),
  );
  const [editando, setEditando] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  if (!datos && cargando) return <Cargando texto="Cargando horarios…" />;
  if (!datos && error) return <ErrorEstado error={error} onReintentar={recargar} />;

  const duracion = duracionActual(datos);

  const cambiarDuracion = async (minutos) => {
    if (minutos === duracion) return;
    setOcupado(true);
    try {
      await actualizarDuracion(minutos);
      await recargarSilencioso();
    } catch (e) {
      avisar('No se pudo cambiar la duración', e.message);
    } finally {
      setOcupado(false);
    }
  };

  const alternar = async (horario, activo) => {
    setOcupado(true);
    try {
      await cambiarEstadoHorario(horario.id, activo);
      await recargarSilencioso();
    } catch (e) {
      avisar('No se pudo actualizar el horario', e.message);
    } finally {
      setOcupado(false);
    }
  };

  const buscar = (dia, jornada) => datos.find((h) => h.dia_semana === dia && h.jornada === jornada);

  return (
    <View style={styles.contenedor}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={recargar} />}
      >
        <AvisoError error={error} onReintentar={recargar} />

        <View style={styles.tarjeta}>
          <View style={styles.tituloFila}>
            <Ionicons name="hourglass-outline" size={18} color={colores.primario} />
            <Text style={styles.tituloTarjeta}>Duración de cada reserva</Text>
          </View>
          <Text style={styles.ayuda}>
            Con este valor se generan los horarios que ve el cliente. Ej.: 60 min → 7:00, 8:00, 9:00…
          </Text>
          <View style={styles.chips}>
            {DURACIONES_SLOT.map((min) => (
              <Chip
                key={min}
                etiqueta={`${min} min`}
                activo={duracion === min}
                deshabilitado={ocupado}
                onPress={() => cambiarDuracion(min)}
              />
            ))}
          </View>
        </View>

        {DIAS_ORDEN.map((dia) => (
          <View key={dia} style={styles.tarjeta}>
            <Text style={styles.dia}>{ETIQUETA_DIA[dia]}</Text>
            {JORNADAS.map((j) => {
              const h = buscar(dia, j.valor);
              const activo = Boolean(h?.activo);
              const abrir = () =>
                setEditando(
                  h || {
                    dia_semana: dia,
                    jornada: j.valor,
                    hora_inicio: j.valor === 'almuerzo' ? '11:30' : '16:30',
                    hora_fin: j.valor === 'almuerzo' ? '14:00' : '23:00',
                    duracion_slot: duracion,
                    activo: true,
                  },
                );
              return (
                <View key={j.valor} style={styles.jornada}>
                  <Pressable
                    onPress={abrir}
                    style={({ pressed }) => [styles.jornadaInfo, pressed && styles.presionada]}
                    accessibilityRole="button"
                    accessibilityLabel={`Editar ${j.etiqueta} del ${ETIQUETA_DIA[dia]}`}
                  >
                    <Ionicons name={j.icono} size={16} color={activo ? colores.primario : colores.textoTenue} />
                    <View style={styles.jornadaTextos}>
                      <Text style={[styles.jornadaNombre, !activo && styles.apagado]}>{j.etiqueta}</Text>
                      <Text style={[styles.jornadaHoras, !activo && styles.apagado]}>
                        {h ? (activo ? rango12(h.hora_inicio, h.hora_fin) : 'Cerrado') : 'Sin configurar'}
                      </Text>
                    </View>
                    <Ionicons name="create-outline" size={16} color={colores.textoSuave} />
                  </Pressable>
                  {h ? (
                    <Interruptor
                      valor={activo}
                      onCambiar={(v) => alternar(h, v)}
                      deshabilitado={ocupado}
                      etiqueta={`${j.etiqueta} del ${ETIQUETA_DIA[dia]} ${activo ? 'abierto' : 'cerrado'}`}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <FormHorario
        horario={editando}
        horarios={datos}
        onCerrar={() => setEditando(null)}
        onGuardado={() => {
          setEditando(null);
          recargarSilencioso();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
  },
  contenido: {
    width: '100%',
    maxWidth: ANCHO_MAX,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 14,
    gap: 8,
  },
  tituloFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tituloTarjeta: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
  },
  ayuda: {
    fontSize: 12,
    lineHeight: 17,
    color: colores.textoSuave,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  dia: {
    fontSize: 15,
    fontWeight: '800',
    color: colores.texto,
  },
  jornada: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  jornadaInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: radios.md,
    backgroundColor: colores.fondo,
  },
  presionada: {
    opacity: 0.7,
  },
  jornadaTextos: {
    flex: 1,
  },
  jornadaNombre: {
    fontSize: 12,
    color: colores.textoSuave,
  },
  jornadaHoras: {
    fontSize: 14,
    fontWeight: '600',
    color: colores.texto,
  },
  apagado: {
    color: colores.textoTenue,
  },
});
