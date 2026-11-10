// Tarjeta de mesa en la pantalla de Inicio (RF-01).
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Foto from './ui/Foto';
import Insignia from './ui/Insignia';
import { colores, radios } from '../constants/colors';
import { ETIQUETA_ZONA } from '../constants/config';

const ESTADO = {
  libre: { texto: 'Libre', variante: 'libre' },
  llena: { texto: 'Llena', variante: 'llena' },
  sin_turnos: { texto: 'Sin turnos hoy', variante: 'sin_turnos' },
};

export default function MesaCard({ mesa, estado = 'libre', onPress }) {
  const e = ESTADO[estado] || ESTADO.libre;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${mesa.nombre}, ${ETIQUETA_ZONA[mesa.zona]}, ${mesa.capacidad} personas, ${e.texto}`}
      style={({ pressed }) => [styles.tarjeta, pressed && styles.presionada]}
    >
      <Foto uri={mesa.foto_url} icono="restaurant-outline" estilo={styles.foto} />
      <View style={styles.cuerpo}>
        <Text style={styles.nombre} numberOfLines={1}>
          {mesa.nombre}
        </Text>
        <View style={styles.detalle}>
          <Ionicons name="person" size={12} color={colores.textoSuave} />
          <Text style={styles.detalleTexto} numberOfLines={1}>
            {ETIQUETA_ZONA[mesa.zona]} · {mesa.capacidad} pers.
          </Text>
        </View>
        <View style={styles.pie}>
          <Insignia texto={e.texto} variante={e.variante} />
          <Ionicons name="chevron-forward" size={18} color={colores.texto} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flex: 1,
    backgroundColor: colores.superficie,
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 8,
  },
  presionada: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  foto: {
    width: '100%',
    aspectRatio: 1.45,
    borderRadius: radios.md,
  },
  cuerpo: {
    paddingHorizontal: 4,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 4,
  },
  nombre: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
  },
  detalle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detalleTexto: {
    flex: 1,
    fontSize: 12,
    color: colores.textoSuave,
  },
  pie: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
