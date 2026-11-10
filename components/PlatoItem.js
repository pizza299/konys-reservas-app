// Tarjeta de un plato en la carta digital (RF-07).
// Si el plato está en promoción muestra el % de descuento y el precio anterior tachado.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Foto from './ui/Foto';
import { colores, radios } from '../constants/colors';
import { formatearPrecio, porcentajeDescuento } from '../utils/formato';

export default function PlatoItem({ plato, icono, onVerDetalle }) {
  const descuento = porcentajeDescuento(plato);
  return (
    <Pressable
      onPress={onVerDetalle}
      accessibilityRole="button"
      accessibilityLabel={`${plato.nombre}, ${formatearPrecio(plato.precio)}${
        descuento ? `, ${descuento}% de descuento` : ''
      }. Ver detalle`}
      style={({ pressed }) => [styles.tarjeta, pressed && styles.presionada]}
    >
      <View>
        <Foto uri={plato.foto_url} icono={icono} estilo={styles.foto} />
        {descuento ? (
          <View style={styles.descuento}>
            <Text style={styles.descuentoTexto}>-{descuento}%</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.nombre} numberOfLines={2}>
        {plato.nombre}
      </Text>
      {plato.descripcion ? (
        <Text style={styles.descripcion} numberOfLines={2}>
          {plato.descripcion}
        </Text>
      ) : null}
      <View style={styles.pie}>
        <View style={styles.precios}>
          {descuento ? <Text style={styles.precioAnterior}>{formatearPrecio(plato.precio_anterior)}</Text> : null}
          <Text style={[styles.precio, descuento && styles.precioPromo]}>{formatearPrecio(plato.precio)}</Text>
        </View>
        <View style={styles.info}>
          <Ionicons name="information" size={14} color={colores.texto} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flex: 1,
    gap: 4,
  },
  presionada: {
    opacity: 0.8,
  },
  foto: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: 4,
  },
  descuento: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colores.acento,
    borderRadius: radios.pildora,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  descuentoTexto: {
    fontSize: 12,
    fontWeight: '800',
    color: colores.blanco,
  },
  nombre: {
    fontSize: 14,
    fontWeight: '700',
    color: colores.texto,
  },
  descripcion: {
    fontSize: 12,
    lineHeight: 16,
    color: colores.textoSuave,
  },
  pie: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  precios: {
    flexShrink: 1,
  },
  precioAnterior: {
    fontSize: 11,
    color: colores.textoTenue,
    textDecorationLine: 'line-through',
  },
  precio: {
    fontSize: 14,
    fontWeight: '800',
    color: colores.primario,
  },
  precioPromo: {
    color: colores.acentoTexto,
  },
  info: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colores.bordeFuerte,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
