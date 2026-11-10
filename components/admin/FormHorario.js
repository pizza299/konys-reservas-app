// Formulario para editar una jornada (hora de apertura y cierre).
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import HojaModal from '../ui/HojaModal';
import Interruptor from '../ui/Interruptor';
import Contador from '../ui/Contador';
import Boton from '../ui/Boton';
import { guardarHorario, validarHorario } from '../../services/horarios';
import { generarSlots } from '../../services/reservas';
import { colores, radios } from '../../constants/colors';
import { DIAS_ORDEN, ETIQUETA_DIA, JORNADAS } from '../../constants/config';
import { aMinutos, deMinutos, hora12 } from '../../utils/fechas';

const PASO = 15; // minutos (permite horarios como 4:15 p. m.)
const MIN = 6 * 60; // 6:00 a. m.
const MAX = 23 * 60 + 45; // 11:45 p. m.

export default function FormHorario({ horario, horarios, onCerrar, onGuardado }) {
  const [datos, setDatos] = useState(null);
  const [todosLosDias, setTodosLosDias] = useState(false);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Cada vez que se abre con otra jornada, carga sus datos.
  const [horarioPrevio, setHorarioPrevio] = useState(null);
  if (horario !== horarioPrevio) {
    setHorarioPrevio(horario);
    if (horario) {
      setDatos({ ...horario });
      setTodosLosDias(false);
      setError(null);
    }
  }

  if (!datos) return null;

  const inicio = aMinutos(datos.hora_inicio);
  const fin = aMinutos(datos.hora_fin);
  const jornada = JORNADAS.find((j) => j.valor === datos.jornada);
  const vistaPrevia = generarSlots(datos).map((s) => s.inicio);

  const guardar = async () => {
    const problema = validarHorario(datos);
    if (problema) {
      setError(problema);
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      if (todosLosDias) {
        // Aplica el mismo horario a esta jornada en los 7 días.
        for (const dia of DIAS_ORDEN) {
          const existente = horarios.find((h) => h.dia_semana === dia && h.jornada === datos.jornada);
          await guardarHorario({
            ...datos,
            id: existente?.id,
            dia_semana: dia,
            activo: dia === datos.dia_semana ? datos.activo : existente?.activo ?? true,
          });
        }
      } else {
        await guardarHorario(datos);
      }
      onGuardado();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <HojaModal
      visible={Boolean(horario)}
      titulo={`${jornada?.etiqueta} · ${ETIQUETA_DIA[datos.dia_semana]}`}
      onCerrar={onCerrar}
      pie={<Boton titulo="Guardar horario" onPress={guardar} cargando={guardando} />}
    >
      <View style={styles.fila}>
        <Text style={styles.etiqueta}>Jornada abierta</Text>
        <Interruptor
          valor={datos.activo}
          onCambiar={(v) => setDatos((d) => ({ ...d, activo: v }))}
          etiqueta="Jornada abierta"
        />
      </View>

      <View style={styles.horas}>
        <View style={styles.flex}>
          <Contador
            etiqueta="Abre"
            valor={inicio}
            texto={hora12(datos.hora_inicio)}
            paso={PASO}
            min={MIN}
            max={fin - PASO}
            onCambiar={(v) => setDatos((d) => ({ ...d, hora_inicio: deMinutos(v) }))}
          />
        </View>
        <View style={styles.flex}>
          <Contador
            etiqueta="Cierra"
            valor={fin}
            texto={hora12(datos.hora_fin)}
            paso={PASO}
            min={inicio + PASO}
            max={MAX}
            onCambiar={(v) => setDatos((d) => ({ ...d, hora_fin: deMinutos(v) }))}
          />
        </View>
      </View>

      <View style={styles.vista}>
        <Text style={styles.vistaTitulo}>
          Horarios que verá el cliente (reservas de {datos.duracion_slot} min)
        </Text>
        <Text style={styles.vistaTexto}>
          {vistaPrevia.length ? vistaPrevia.join(' · ') : 'Ninguno: amplía la jornada.'}
        </Text>
      </View>

      <Pressable
        onPress={() => setTodosLosDias((v) => !v)}
        style={styles.casilla}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: todosLosDias }}
      >
        <Ionicons
          name={todosLosDias ? 'checkbox' : 'square-outline'}
          size={22}
          color={todosLosDias ? colores.primario : colores.textoSuave}
        />
        <Text style={styles.casillaTexto}>
          Aplicar este horario de {jornada?.etiqueta.toLowerCase()} a todos los días
        </Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </HojaModal>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etiqueta: {
    fontSize: 15,
    fontWeight: '600',
    color: colores.texto,
  },
  horas: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  vista: {
    backgroundColor: colores.superficieTenue,
    borderRadius: radios.md,
    padding: 12,
    gap: 4,
  },
  vistaTitulo: {
    fontSize: 12,
    color: colores.textoSuave,
  },
  vistaTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: colores.texto,
  },
  casilla: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
  },
  casillaTexto: {
    flex: 1,
    fontSize: 14,
    color: colores.texto,
  },
  error: {
    fontSize: 13,
    color: colores.error,
  },
});
