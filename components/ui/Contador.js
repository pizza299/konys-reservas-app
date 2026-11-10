// Selector con botones − / + (capacidad de mesas, horas de apertura y cierre).
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colores, radios, TACTIL_MIN } from '../../constants/colors';

export default function Contador({ etiqueta, valor, texto, onCambiar, paso = 1, min, max }) {
  const puedeBajar = min === undefined || valor - paso >= min;
  const puedeSubir = max === undefined || valor + paso <= max;
  return (
    <View style={styles.contenedor}>
      {etiqueta ? <Text style={styles.etiqueta}>{etiqueta}</Text> : null}
      <View style={styles.fila}>
        <Pressable
          onPress={() => onCambiar(valor - paso)}
          disabled={!puedeBajar}
          style={[styles.boton, !puedeBajar && styles.inactivo]}
          accessibilityRole="button"
          accessibilityLabel={`Disminuir ${etiqueta || ''}`}
        >
          <Ionicons name="remove" size={20} color={colores.primario} />
        </Pressable>
        <Text style={styles.valor} accessibilityLiveRegion="polite">
          {texto ?? valor}
        </Text>
        <Pressable
          onPress={() => onCambiar(valor + paso)}
          disabled={!puedeSubir}
          style={[styles.boton, !puedeSubir && styles.inactivo]}
          accessibilityRole="button"
          accessibilityLabel={`Aumentar ${etiqueta || ''}`}
        >
          <Ionicons name="add" size={20} color={colores.primario} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: 6,
  },
  etiqueta: {
    fontSize: 13,
    fontWeight: '600',
    color: colores.textoSuave,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.md,
    padding: 4,
  },
  boton: {
    width: TACTIL_MIN,
    height: TACTIL_MIN,
    borderRadius: radios.sm,
    backgroundColor: colores.superficieTenue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactivo: {
    opacity: 0.35,
  },
  valor: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: colores.texto,
  },
});
