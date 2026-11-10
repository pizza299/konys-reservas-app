// Botón de un bloque horario (RF-04).
// Libre: blanco · Ocupado / pasado: gris · Elegido: oscuro con ✓
import { Pressable, StyleSheet, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colores, radios, TACTIL_MIN } from '../constants/colors';

const ETIQUETA = { libre: 'Libre', ocupado: 'Ocupado', pasado: 'Pasó' };

export default function SlotButton({ slot, elegido, onPress }) {
  const noDisponible = slot.estado !== 'libre';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${slot.inicio}, ${elegido ? 'elegido' : ETIQUETA[slot.estado]}`}
      // Se puede tocar aunque esté ocupado: la pantalla muestra un aviso (CU-02, flujo alternativo).
      accessibilityState={{ selected: elegido }}
      style={({ pressed }) => [
        styles.slot,
        noDisponible && styles.noDisponible,
        elegido && styles.elegido,
        pressed && styles.presionado,
      ]}
    >
      <Text style={[styles.hora, noDisponible && styles.textoTenue, elegido && styles.textoBlanco]}>
        {slot.inicio}
      </Text>
      {elegido ? (
        <Text style={[styles.estado, styles.textoBlanco]}>
          Elegido <Ionicons name="checkmark" size={12} color={colores.blanco} />
        </Text>
      ) : (
        <Text style={[styles.estado, noDisponible && styles.textoTenue]}>{ETIQUETA[slot.estado]}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    minHeight: TACTIL_MIN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.bordeFuerte,
    backgroundColor: colores.superficie,
  },
  noDisponible: {
    backgroundColor: colores.superficieTenue,
    borderColor: colores.superficieTenue,
  },
  elegido: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  presionado: {
    opacity: 0.8,
  },
  hora: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
  },
  estado: {
    fontSize: 12,
    color: colores.textoSuave,
  },
  textoTenue: {
    color: colores.textoTenue,
  },
  textoBlanco: {
    color: colores.blanco,
  },
});
