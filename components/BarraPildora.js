// Barra inferior en forma de píldora (diseño del prototipo).
// Se usa para las pestañas principales (Inicio, Carta, Admin) y para las
// pestañas internas del panel (Mesas, Horarios, Reservas).
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colores, radios, sombraFuerte } from '../constants/colors';

export default function BarraPildora({ items, activo, onSeleccionar }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.contenedor, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.barra} accessibilityRole="tablist">
        {items.map((item) => {
          const enfocado = item.clave === activo;
          return (
            <Pressable
              key={item.clave}
              onPress={() => onSeleccionar(item.clave)}
              accessibilityRole="tab"
              accessibilityLabel={item.etiqueta}
              accessibilityState={{ selected: enfocado }}
              style={({ pressed }) => [
                styles.item,
                enfocado && styles.itemActivo,
                pressed && !enfocado && styles.presionado,
              ]}
            >
              <Ionicons
                name={enfocado ? item.icono : `${item.icono}-outline`}
                size={enfocado ? 18 : 21}
                color={enfocado ? colores.primario : 'rgba(255,255,255,0.78)'}
              />
              {enfocado ? <Text style={styles.etiqueta}>{item.etiqueta}</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: colores.fondo,
  },
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.primario,
    borderRadius: radios.pildora,
    padding: 6,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    ...sombraFuerte,
  },
  item: {
    flex: 1,
    height: 48,
    borderRadius: radios.pildora,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  itemActivo: {
    flex: 1.6,
    backgroundColor: colores.blanco,
  },
  presionado: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '700',
    color: colores.primario,
  },
});
