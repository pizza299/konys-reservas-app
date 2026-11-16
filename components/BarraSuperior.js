// Barra superior de los pasos de la reserva: flecha para volver y "Paso X de 3".
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colores, TACTIL_MIN } from '../constants/colors';

export default function BarraSuperior({ onAtras, paso }) {
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
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
});
