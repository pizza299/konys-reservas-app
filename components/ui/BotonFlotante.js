// Botón flotante "+" para crear registros (nueva mesa, nuevo plato).
import { Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colores, sombraFuerte } from '../../constants/colors';

export default function BotonFlotante({ onPress, etiqueta }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={({ pressed }) => [styles.boton, pressed && styles.presionado]}
    >
      <Ionicons name="add" size={30} color={colores.blanco} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    position: 'absolute',
    right: 20,
    bottom: 16,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colores.acento,
    alignItems: 'center',
    justifyContent: 'center',
    ...sombraFuerte,
  },
  presionado: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});
