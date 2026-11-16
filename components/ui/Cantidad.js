// Selector compacto de cantidad: [ − ] 2 [ + ].
// Si se pasa onQuitar, en la cantidad mínima el botón "−" se vuelve una papelera.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colores, radios } from '../../constants/colors';

export default function Cantidad({ valor, onCambiar, min = 1, max, onQuitar, nombre = '' }) {
  const enMinimo = valor <= min;
  const quita = Boolean(onQuitar) && enMinimo;
  const puedeBajar = quita || !enMinimo;
  const puedeSubir = max === undefined || valor < max;
  return (
    <View style={styles.contenedor}>
      <Pressable
        onPress={() => (quita ? onQuitar() : onCambiar(valor - 1))}
        disabled={!puedeBajar}
        style={({ pressed }) => [styles.boton, !puedeBajar && styles.inactivo, pressed && styles.presionado]}
        accessibilityRole="button"
        accessibilityLabel={quita ? `Quitar ${nombre}` : `Quitar uno ${nombre}`}
        hitSlop={4}
      >
        <Ionicons name={quita ? 'trash-outline' : 'remove'} size={18} color={colores.primario} />
      </Pressable>
      <Text style={styles.valor} accessibilityLiveRegion="polite">
        {valor}
      </Text>
      <Pressable
        onPress={() => onCambiar(valor + 1)}
        disabled={!puedeSubir}
        style={({ pressed }) => [styles.boton, !puedeSubir && styles.inactivo, pressed && styles.presionado]}
        accessibilityRole="button"
        accessibilityLabel={`Agregar uno ${nombre}`}
        hitSlop={4}
      >
        <Ionicons name="add" size={18} color={colores.primario} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.pildora,
    padding: 3,
    gap: 2,
  },
  boton: {
    width: 36,
    height: 36,
    borderRadius: radios.pildora,
    backgroundColor: colores.superficieTenue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactivo: {
    opacity: 0.35,
  },
  presionado: {
    opacity: 0.7,
  },
  valor: {
    minWidth: 30,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: colores.texto,
  },
});
