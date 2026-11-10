// Carta digital (RF-07): platos por categoría, en modo lectura.
import { useMemo, useState } from 'react';
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
import Ionicons from '@expo/vector-icons/Ionicons';
import PlatoItem from '../../components/PlatoItem';
import Foto from '../../components/ui/Foto';
import HojaModal from '../../components/ui/HojaModal';
import { AvisoError, Cargando, ErrorEstado, Vacio } from '../../components/ui/Estados';
import { useDatos } from '../../hooks/useDatos';
import { obtenerPlatos } from '../../services/platos';
import { colores, radios } from '../../constants/colors';
import { CATEGORIAS } from '../../constants/config';
import { formatearPrecio, pluralizar, porcentajeDescuento } from '../../utils/formato';
import { completarFilas } from '../../utils/cuadricula';

const PROMOS = { valor: 'promos', etiqueta: 'Promos', icono: 'pricetag-outline' };

export default function Carta() {
  const { width } = useWindowDimensions();
  const [categoria, setCategoria] = useState('pizzas');
  const [detalle, setDetalle] = useState(null);
  const { datos, error, cargando, refrescando, recargar } = useDatos(() =>
    obtenerPlatos({ soloDisponibles: true }),
  );

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
  const descuentoDetalle = detalle ? porcentajeDescuento(detalle) : 0;

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
              contentContainerStyle={styles.listaContenido}
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
                    <PlatoItem plato={item} icono={iconoDe(item)} onVerDetalle={() => setDetalle(item)} />
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

      <HojaModal visible={Boolean(detalle)} titulo={detalle?.nombre || ''} onCerrar={() => setDetalle(null)}>
        {detalle ? (
          <View style={styles.detalle}>
            <Foto uri={detalle.foto_url} icono={iconoDe(detalle)} estilo={styles.detalleFoto} tamanoIcono={48} />
            <View style={styles.detallePrecios}>
              <Text style={styles.detallePrecio}>{formatearPrecio(detalle.precio)}</Text>
              {descuentoDetalle ? (
                <>
                  <Text style={styles.detallePrecioAnterior}>{formatearPrecio(detalle.precio_anterior)}</Text>
                  <View style={styles.detalleDescuento}>
                    <Text style={styles.detalleDescuentoTexto}>-{descuentoDetalle}%</Text>
                  </View>
                </>
              ) : null}
            </View>
            {descuentoDetalle ? (
              <Text style={styles.detalleAhorro}>
                Ahorras {formatearPrecio(detalle.precio_anterior - detalle.precio)}
              </Text>
            ) : null}
            <Text style={styles.detalleDescripcion}>
              {detalle.descripcion || 'Pregunta a nuestro equipo por los ingredientes de este plato.'}
            </Text>
          </View>
        ) : null}
      </HojaModal>
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
  detalle: {
    gap: 12,
  },
  detalleFoto: {
    width: '72%',
    maxWidth: 320,
    aspectRatio: 1,
    alignSelf: 'center',
    borderRadius: radios.lg,
  },
  detallePrecios: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  detallePrecio: {
    fontSize: 22,
    fontWeight: '900',
    color: colores.primario,
  },
  detallePrecioAnterior: {
    fontSize: 15,
    color: colores.textoTenue,
    textDecorationLine: 'line-through',
  },
  detalleDescuento: {
    backgroundColor: colores.acento,
    borderRadius: radios.pildora,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  detalleDescuentoTexto: {
    fontSize: 13,
    fontWeight: '800',
    color: colores.blanco,
  },
  detalleAhorro: {
    marginTop: -6,
    fontSize: 13,
    fontWeight: '600',
    color: colores.acentoTexto,
  },
  detalleDescripcion: {
    fontSize: 15,
    lineHeight: 22,
    color: colores.textoSuave,
  },
});
