// Control segmentado (Hoy · Mañana · Todas).
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colores, radios, sombra } from '../../constants/colors';

export default function Segmentado({ opciones, valor, onCambiar }) {
  return (
    <View style={styles.contenedor} accessibilityRole="tablist">
      {opciones.map((o) => {
        const activo = o.valor === valor;
        return (
          <Pressable
            key={o.valor}
            onPress={() => onCambiar(o.valor)}
            style={[styles.opcion, activo && styles.activa]}
            accessibilityRole="tab"
            accessibilityState={{ selected: activo }}
          >
            <Text style={[styles.texto, activo && styles.textoActivo]}>{o.etiqueta}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    backgroundColor: colores.superficieTenue,
    borderRadius: radios.pildora,
    padding: 4,
  },
  opcion: {
    flex: 1,
    height: 38,
    borderRadius: radios.pildora,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activa: {
    backgroundColor: colores.superficie,
    ...sombra,
  },
  texto: {
    fontSize: 14,
    fontWeight: '600',
    color: colores.textoSuave,
  },
  textoActivo: {
    color: colores.texto,
    fontWeight: '700',
  },
});
