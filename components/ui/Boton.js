import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colores, radios, TACTIL_MIN } from '../../constants/colors';

/**
 * Botón reutilizable.
 * variante: 'primario' | 'secundario' | 'peligro' | 'texto'
 */
export default function Boton({
  titulo,
  onPress,
  variante = 'primario',
  icono,
  deshabilitado = false,
  cargando = false,
  compacto = false,
  estilo,
}) {
  const v = VARIANTES[variante];
  const inactivo = deshabilitado || cargando;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      style={({ pressed }) => [
        styles.base,
        compacto && styles.compacto,
        v.contenedor,
        inactivo && styles.inactivo,
        pressed && !inactivo && styles.presionado,
        estilo,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={v.texto.color} />
      ) : (
        <View style={styles.fila}>
          {icono ? <Ionicons name={icono} size={compacto ? 16 : 18} color={v.texto.color} /> : null}
          <Text style={[styles.texto, compacto && styles.textoCompacto, v.texto]}>{titulo}</Text>
        </View>
      )}
    </Pressable>
  );
}

const VARIANTES = {
  primario: {
    contenedor: { backgroundColor: colores.primario },
    texto: { color: colores.blanco },
  },
  secundario: {
    contenedor: { backgroundColor: colores.superficie, borderWidth: 1, borderColor: colores.bordeFuerte },
    texto: { color: colores.primario },
  },
  peligro: {
    contenedor: { backgroundColor: colores.errorFondo },
    texto: { color: colores.error },
  },
  texto: {
    contenedor: { backgroundColor: 'transparent' },
    texto: { color: colores.primario, textDecorationLine: 'underline' },
  },
};

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radios.pildora,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compacto: {
    minHeight: TACTIL_MIN - 6,
    paddingHorizontal: 14,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  texto: {
    fontSize: 16,
    fontWeight: '700',
  },
  textoCompacto: {
    fontSize: 14,
  },
  inactivo: {
    opacity: 0.45,
  },
  presionado: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
