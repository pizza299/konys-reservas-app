// Detalle de un plato de la carta (hoja inferior): foto, precio, descripción,
// cantidad, indicaciones para la cocina y botón "Agregar al pedido".
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Foto from './ui/Foto';
import HojaModal from './ui/HojaModal';
import Boton from './ui/Boton';
import Campo from './ui/Campo';
import Cantidad from './ui/Cantidad';
import { colores, radios } from '../constants/colors';
import { MAX_CANTIDAD_PLATO, MAX_NOTA_PLATO } from '../constants/config';
import { formatearPrecio, porcentajeDescuento } from '../utils/formato';

export default function DetallePlato({ plato, icono, categoria, enPedido = 0, onAgregar, onCerrar }) {
  const [cantidad, setCantidad] = useState(1);
  const [nota, setNota] = useState('');
  const descuento = plato ? porcentajeDescuento(plato) : 0;

  return (
    <HojaModal
      visible={Boolean(plato)}
      titulo={plato?.nombre || ''}
      onCerrar={onCerrar}
      pie={
        plato ? (
          <Boton
            titulo={`Agregar al pedido · ${formatearPrecio(plato.precio * cantidad)}`}
            icono="bag-add-outline"
            onPress={() => onAgregar(cantidad, nota)}
          />
        ) : null
      }
    >
      {plato ? (
        <View style={styles.detalle}>
          <View>
            <Foto uri={plato.foto_url} icono={icono} estilo={styles.foto} tamanoIcono={56} />
            {descuento ? (
              <View style={styles.etiquetaDescuento}>
                <Text style={styles.etiquetaDescuentoTexto}>-{descuento}%</Text>
              </View>
            ) : null}
            {enPedido ? (
              <View style={styles.etiquetaPedido}>
                <Ionicons name="bag-check" size={14} color={colores.blanco} />
                <Text style={styles.etiquetaPedidoTexto}>{enPedido} en tu pedido</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.cabecera}>
            {categoria ? <Text style={styles.categoria}>{categoria.toUpperCase()}</Text> : null}
            <View style={styles.precios}>
              <Text style={[styles.precio, descuento && styles.precioPromo]}>{formatearPrecio(plato.precio)}</Text>
              {descuento ? <Text style={styles.precioAnterior}>{formatearPrecio(plato.precio_anterior)}</Text> : null}
              {descuento ? (
                <View style={styles.ahorro}>
                  <Text style={styles.ahorroTexto}>
                    Ahorras {formatearPrecio(plato.precio_anterior - plato.precio)}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <Text style={styles.descripcion}>
            {plato.descripcion || 'Pregunta a nuestro equipo por los ingredientes de este plato.'}
          </Text>

          <View style={styles.separador} />

          <View style={styles.filaCantidad}>
            <View style={styles.flex}>
              <Text style={styles.etiqueta}>Cantidad</Text>
              <Text style={styles.ayuda}>{formatearPrecio(plato.precio)} c/u</Text>
            </View>
            <Cantidad
              valor={cantidad}
              onCambiar={setCantidad}
              min={1}
              max={MAX_CANTIDAD_PLATO}
              nombre={plato.nombre}
            />
          </View>

          <Campo
            etiqueta="Indicaciones para la cocina (opcional)"
            placeholder="Ej. sin cebolla, bien tostada"
            value={nota}
            onChangeText={setNota}
            maxLength={MAX_NOTA_PLATO}
          />
        </View>
      ) : null}
    </HojaModal>
  );
}

const styles = StyleSheet.create({
  detalle: {
    gap: 16,
  },
  flex: {
    flex: 1,
  },
  foto: {
    width: '100%',
    aspectRatio: 4 / 3,
    maxHeight: 320,
    borderRadius: radios.lg,
  },
  etiquetaDescuento: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colores.acento,
    borderRadius: radios.pildora,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  etiquetaDescuentoTexto: {
    fontSize: 13,
    fontWeight: '800',
    color: colores.blanco,
  },
  etiquetaPedido: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colores.primario,
    borderRadius: radios.pildora,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  etiquetaPedidoTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: colores.blanco,
  },
  cabecera: {
    gap: 4,
  },
  categoria: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colores.acentoTexto,
  },
  precios: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  precio: {
    fontSize: 26,
    fontWeight: '900',
    color: colores.primario,
  },
  precioPromo: {
    color: colores.acentoTexto,
  },
  precioAnterior: {
    fontSize: 15,
    color: colores.textoTenue,
    textDecorationLine: 'line-through',
  },
  ahorro: {
    backgroundColor: colores.acentoSuave,
    borderRadius: radios.pildora,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  ahorroTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: colores.acentoTexto,
  },
  descripcion: {
    fontSize: 15,
    lineHeight: 22,
    color: colores.textoSuave,
  },
  separador: {
    height: 1,
    backgroundColor: colores.borde,
  },
  filaCantidad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  etiqueta: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
  },
  ayuda: {
    fontSize: 12,
    color: colores.textoSuave,
    marginTop: 2,
  },
});
