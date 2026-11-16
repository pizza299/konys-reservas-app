// Carta digital (RF-07): platos por categoría. Desde el detalle de cada plato
// el cliente lo agrega a su pedido y lo envía a la cocina (pantalla "pedido").
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import PlatoItem from '../../components/PlatoItem';
import DetallePlato from '../../components/DetallePlato';
import { AvisoError, Cargando, ErrorEstado, Vacio } from '../../components/ui/Estados';
import { useDatos } from '../../hooks/useDatos';
import { usePedido } from '../../context/Pedido';
import { obtenerPlatos } from '../../services/platos';
import { colores, radios, sombraFuerte } from '../../constants/colors';
import { CATEGORIAS } from '../../constants/config';
import { formatearPrecio, pluralizar, porcentajeDescuento } from '../../utils/formato';
import { completarFilas } from '../../utils/cuadricula';

const PROMOS = { valor: 'promos', etiqueta: 'Promos', icono: 'pricetag-outline' };

export default function Carta() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const pedido = usePedido();
  const [categoria, setCategoria] = useState('pizzas');
  const [detalle, setDetalle] = useState(null);
  const [aviso, setAviso] = useState(null);
  const temporizadorAviso = useRef(null);
  const { datos, error, cargando, refrescando, recargar } = useDatos(() =>
    obtenerPlatos({ soloDisponibles: true }),
  );

  useEffect(() => () => clearTimeout(temporizadorAviso.current), []);

  const agregarAlPedido = (cantidad, nota) => {
    pedido.agregar(detalle, cantidad, nota);
    setDetalle(null);
    setAviso('¡Agregado!');
    clearTimeout(temporizadorAviso.current);
    temporizadorAviso.current = setTimeout(() => setAviso(null), 2500);
  };

  // "Promos" agrupa los platos con descuento; solo aparece si hay alguno.
  const enPromocion = useMemo(() => (datos || []).filter((p) => porcentajeDescuento(p) > 0), [datos]);
  const categorias = enPromocion.length ? [PROMOS, ...CATEGORIAS] : CATEGORIAS;

  const platos = useMemo(
    () => (categoria === 'promos' ? enPromocion : (datos || []).filter((p) => p.categoria === categoria)),
    [datos, categoria, enPromocion],
  );
  const infoCategoria = categorias.find((c) => c.valor === categoria) || CATEGORIAS[0];
  const iconoDe = (plato) => CATEGORIAS.find((c) => c.valor === plato.categoria)?.icono || 'restaurant-outline';
  const columnas = width >= 700 ? 3 : 2;
  const etiquetaCategoria = (plato) => CATEGORIAS.find((c) => c.valor === plato?.categoria)?.etiqueta;
  const hayPedido = pedido.cantidadTotal > 0;

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <View style={styles.encabezado}>
        <View>
          <Text style={styles.marca}>Konys Pizza</Text>
          <Text style={styles.titulo}>Carta</Text>
        </View>
        <Text style={styles.moneda}>Precios en COP</Text>
      </View>

      <View style={styles.cuerpo}>
        <ScrollView
          style={styles.rail}
          contentContainerStyle={styles.railContenido}
          showsVerticalScrollIndicator={false}
          accessibilityRole="tablist"
        >
          {categorias.map((c) => {
            const activa = c.valor === categoria;
            return (
              <Pressable
                key={c.valor}
                onPress={() => setCategoria(c.valor)}
                style={styles.railItem}
                accessibilityRole="tab"
                accessibilityLabel={c.etiqueta}
                accessibilityState={{ selected: activa }}
              >
                <View style={[styles.railIcono, activa && styles.railIconoActivo]}>
                  <Ionicons
                    name={activa ? c.icono.replace('-outline', '') : c.icono}
                    size={22}
                    color={activa ? colores.blanco : c.valor === 'promos' ? colores.acento : colores.textoSuave}
                  />
                </View>
                <Text style={[styles.railTexto, activa && styles.railTextoActivo]}>{c.etiqueta}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.lista}>
          {!datos && cargando ? (
            <Cargando texto="Cargando carta…" />
          ) : !datos && error ? (
            <ErrorEstado error={error} onReintentar={recargar} />
          ) : (
            <FlatList
              key={`carta-${columnas}`}
              data={completarFilas(platos, columnas)}
              keyExtractor={(p) => String(p.id)}
              numColumns={columnas}
              columnWrapperStyle={styles.columnas}
              contentContainerStyle={[styles.listaContenido, hayPedido && styles.listaConPedido]}
              refreshControl={<RefreshControl refreshing={refrescando} onRefresh={recargar} />}
              ListHeaderComponent={
                <View style={styles.listaEncabezado}>
                  <AvisoError error={error} onReintentar={recargar} />
                  <View style={styles.categoriaFila}>
                    <Text style={styles.categoriaTitulo}>{infoCategoria.etiqueta}</Text>
                    <Text style={styles.categoriaConteo}>{pluralizar(platos.length, 'plato', 'platos')}</Text>
                  </View>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.celda}>
                  {item.relleno ? null : (
                    <PlatoItem
                      plato={item}
                      icono={iconoDe(item)}
                      enPedido={pedido.cantidadDe(item.id)}
                      onVerDetalle={() => setDetalle(item)}
                    />
                  )}
                </View>
              )}
              ListEmptyComponent={
                <Vacio
                  icono={infoCategoria.icono}
                  titulo="Sin platos por ahora"
                  mensaje="No hay platos disponibles en esta categoría."
                />
              }
            />
          )}
        </View>
      </View>

      {hayPedido ? (
        <View style={styles.barraPedidoContenedor} pointerEvents="box-none">
          <Pressable
            onPress={() => router.push('/pedido')}
            style={({ pressed }) => [styles.barraPedido, pressed && styles.presionada]}
            accessibilityRole="button"
            accessibilityLabel={`Ver mi pedido: ${pluralizar(pedido.cantidadTotal, 'producto', 'productos')}, ${formatearPrecio(pedido.total)}`}
          >
            <View style={styles.barraPedidoConteo}>
              <Text style={styles.barraPedidoConteoTexto}>{pedido.cantidadTotal}</Text>
            </View>
            <Text style={styles.barraPedidoTexto} numberOfLines={1}>
              {aviso || 'Ver mi pedido'}
            </Text>
            <Text style={styles.barraPedidoTotal}>{formatearPrecio(pedido.total)}</Text>
            <Ionicons name="chevron-forward" size={18} color={colores.blanco} />
          </Pressable>
        </View>
      ) : null}

      <DetallePlato
        key={detalle?.id ?? 'cerrado'}
        plato={detalle}
        icono={detalle ? iconoDe(detalle) : undefined}
        categoria={etiquetaCategoria(detalle)}
        enPedido={detalle ? pedido.cantidadDe(detalle.id) : 0}
        onAgregar={agregarAlPedido}
        onCerrar={() => setDetalle(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  marca: {
    fontSize: 12,
    color: colores.textoSuave,
  },
  titulo: {
    fontSize: 30,
    fontWeight: '800',
    color: colores.texto,
  },
  moneda: {
    fontSize: 12,
    color: colores.textoSuave,
    marginBottom: 6,
  },
  cuerpo: {
    flex: 1,
    flexDirection: 'row',
  },
  rail: {
    width: 78,
    flexGrow: 0,
    borderRightWidth: 1,
    borderRightColor: colores.borde,
  },
  railContenido: {
    paddingTop: 4,
    paddingBottom: 16,
    gap: 12,
    alignItems: 'center',
  },
  railItem: {
    alignItems: 'center',
    gap: 4,
    minWidth: 64,
  },
  railIcono: {
    width: 50,
    height: 50,
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  railIconoActivo: {
    backgroundColor: colores.acento,
    borderColor: colores.acento,
  },
  railTexto: {
    fontSize: 11,
    color: colores.textoSuave,
  },
  railTextoActivo: {
    color: colores.texto,
    fontWeight: '700',
  },
  lista: {
    flex: 1,
  },
  listaContenido: {
    paddingHorizontal: 14,
    paddingBottom: 24,
    gap: 18,
  },
  listaEncabezado: {
    gap: 10,
    paddingTop: 4,
  },
  columnas: {
    gap: 12,
  },
  celda: {
    flex: 1,
  },
  categoriaFila: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  categoriaTitulo: {
    fontSize: 17,
    fontWeight: '800',
    color: colores.texto,
  },
  categoriaConteo: {
    fontSize: 12,
    color: colores.textoSuave,
  },
  listaConPedido: {
    paddingBottom: 96,
  },
  presionada: {
    opacity: 0.85,
  },
  barraPedidoContenedor: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  barraPedido: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingLeft: 10,
    paddingRight: 14,
    borderRadius: radios.pildora,
    backgroundColor: colores.primario,
    ...sombraFuerte,
  },
  barraPedidoConteo: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 6,
    borderRadius: 18,
    backgroundColor: colores.acento,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barraPedidoConteoTexto: {
    fontSize: 15,
    fontWeight: '900',
    color: colores.primario,
  },
  barraPedidoTexto: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colores.blanco,
  },
  barraPedidoTotal: {
    fontSize: 15,
    fontWeight: '900',
    color: colores.blanco,
  },
});
