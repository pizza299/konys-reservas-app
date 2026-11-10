import { Pressable, StyleSheet, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colores, radios } from '../../constants/colors';

/** Chip seleccionable para filtros y opciones. */
export default function Chip({ etiqueta, activo = false, onPress, icono, deshabilitado = false }) {
  const colorTexto = activo ? colores.blanco : colores.texto;
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado || !onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: activo, disabled: deshabilitado }}
      hitSlop={6}
      style={({ pressed }) => [
        styles.chip,
        activo && styles.activo,
        deshabilitado && styles.deshabilitado,
        pressed && styles.presionado,
      ]}
    >
      {icono ? <Ionicons name={icono} size={14} color={activo ? colores.blanco : colores.textoSuave} /> : null}
      <Text style={[styles.texto, { color: colorTexto }]}>{etiqueta}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: radios.pildora,
    borderWidth: 1,
    borderColor: colores.bordeFuerte,
    backgroundColor: colores.superficie,
  },
  activo: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  deshabilitado: {
    opacity: 0.4,
  },
  presionado: {
    opacity: 0.8,
  },
  texto: {
    fontSize: 13,
    fontWeight: '600',
  },
});
