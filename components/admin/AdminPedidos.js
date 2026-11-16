// Pedidos del panel (vista de cocina): los pedidos que envían los clientes
// desde la carta. Cada pedido avanza con un botón:
// Nuevo → En preparación → Listo → Entregado (o se cancela si aún es nuevo).
// La lista se actualiza sola cada 15 segundos.
import { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Segmentado from '../ui/Segmentado';
import Insignia from '../ui/Insignia';
import Boton from '../ui/Boton';
import { AvisoError, Cargando, ErrorEstado, Vacio } from '../ui/Estados';
import { useDatos } from '../../hooks/useDatos';
import { obtenerMesas } from '../../services/mesas';
import { cambiarEstadoPedido, obtenerPedidos } from '../../services/pedidos';
import { ANCHO_MAX, colores, radios } from '../../constants/colors';
import {
  ESTADOS_PEDIDO,
  ESTADOS_PEDIDO_ACTIVOS,
  ETIQUETA_ZONA,
  SIGUIENTE_ESTADO_PEDIDO,
} from '../../constants/config';
import { aISO, fechaCorta, hoyISO } from '../../utils/fechas';
import { codigoPedido, formatearPrecio, pluralizar } from '../../utils/formato';
import { confirmar } from '../../utils/dialogos';

const FILTROS = [
  { valor: 'activos', etiqueta: 'En curso' },
  { valor: 'historial', etiqueta: 'Historial' },
];

const SEGUNDOS_ACTUALIZACION = 15;

export default function AdminPedidos() {
  const [filtro, setFiltro] = useState('activos');
  const [guardandoId, setGuardandoId] = useState(null);
  const [errorAccion, setErrorAccion] = useState(null);

  const { datos, error, cargando, refrescando, recargar, recargarSilencioso } = useDatos(async () => {
    const estados = filtro === 'activos' ? ESTADOS_PEDIDO_ACTIVOS : ['entregado', 'cancelado'];
    const [pedidos, mesas] = await Promise.all([obtenerPedidos({ estados }), obtenerMesas()]);
    return { pedidos, mesas };
  }, [filtro]);

  // La cocina no tiene que recargar a mano: se consulta de nuevo cada 15 s.
  useEffect(() => {
    const id = setInterval(recargarSilencioso, SEGUNDOS_ACTUALIZACION * 1000);
    return () => clearInterval(id);
  }, [recargarSilencioso]);

  const mesasPorId = useMemo(() => {
    const mapa = {};
    (datos?.mesas || []).forEach((m) => {
      mapa[m.id] = m;
    });
    return mapa;
  }, [datos]);

  // En curso: el más antiguo primero (el que lleva más tiempo esperando).
  // Historial: el más reciente primero.
  const pedidos = useMemo(() => {
    const lista = datos?.pedidos || [];
    return filtro === 'activos' ? lista : [...lista].reverse();
  }, [datos, filtro]);

  const nuevos = pedidos.filter((p) => p.estado === 'pendiente').length;

  const cambiarEstado = async (pedido, estado) => {
    if (estado === 'cancelado') {
      const ok = await confirmar(
        'Cancelar pedido',
        `¿Cancelar el pedido ${codigoPedido(pedido.id)} de ${pedido.cliente_nombre}?`,
        'Cancelar pedido',
      );
      if (!ok) return;
    }
    setGuardandoId(pedido.id);
    setErrorAccion(null);
    try {
      await cambiarEstadoPedido(pedido.id, estado);
      recargarSilencioso();
    } catch (e) {
      setErrorAccion(e);
    } finally {
      setGuardandoId(null);
    }
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.filtros}>
        <Segmentado opciones={FILTROS} valor={filtro} onCambiar={setFiltro} />
        <View style={styles.filaResumen}>
          <Text style={styles.resumen}>
            {filtro === 'activos'
              ? `${pluralizar(pedidos.length, 'pedido en curso', 'pedidos en curso')}${nuevos ? ` · ${pluralizar(nuevos, 'nuevo', 'nuevos')}` : ''}`
              : pluralizar(pedidos.length, 'pedido cerrado', 'pedidos cerrados')}
          </Text>
          <View style={styles.enVivo}>
            <View style={styles.puntoVivo} />
            <Text style={styles.enVivoTexto}>Se actualiza solo</Text>
          </View>
        </View>
        <AvisoError error={errorAccion || (datos ? error : null)} onReintentar={recargar} />
      </View>

      {!datos && cargando ? (
        <Cargando texto="Cargando pedidos…" />
      ) : !datos && error ? (
        <ErrorEstado error={error} onReintentar={recargar} />
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={styles.lista}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={recargar} />}
          renderItem={({ item }) => (
            <TarjetaPedido
              pedido={item}
              mesa={mesasPorId[item.mesa_id]}
              guardando={guardandoId === item.id}
              bloqueado={guardandoId !== null && guardandoId !== item.id}
              onCambiarEstado={(estado) => cambiarEstado(item, estado)}
            />
          )}
          ListEmptyComponent={
            <Vacio
              icono="receipt-outline"
              titulo={filtro === 'activos' ? 'Sin pedidos en curso' : 'Sin pedidos cerrados'}
              mensaje={
                filtro === 'activos'
                  ? 'Cuando un cliente envíe un pedido desde la carta, aparecerá aquí.'
                  : 'Aquí verás los pedidos entregados y cancelados.'
              }
            />
          }
        />
      )}
    </View>
  );
}

function TarjetaPedido({ pedido, mesa, guardando, bloqueado, onCambiarEstado }) {
  const siguiente = SIGUIENTE_ESTADO_PEDIDO[pedido.estado];
  const cerrado = !siguiente;
  const nombreMesa = mesa ? `${mesa.nombre} · ${ETIQUETA_ZONA[mesa.zona]}` : 'Mesa eliminada';
  return (
    <View
      style={[
        styles.tarjeta,
        pedido.estado === 'pendiente' && styles.tarjetaNueva,
        pedido.estado === 'cancelado' && styles.tarjetaCancelada,
      ]}
    >
      <View style={styles.cabecera}>
        <View style={styles.flex}>
          <Text style={styles.codigo}>{codigoPedido(pedido.id)}</Text>
          <Text style={styles.meta} numberOfLines={1}>
            {nombreMesa} · {pedido.cliente_nombre}
          </Text>
        </View>
        <View style={styles.cabeceraDerecha}>
          <Insignia texto={ESTADOS_PEDIDO[pedido.estado]} variante={pedido.estado} />
          <Text style={styles.tiempo}>{cuando(pedido.creado_en, cerrado)}</Text>
        </View>
      </View>

      <View style={styles.items}>
        {(pedido.items || []).map((item, i) => (
          <View key={`${item.plato_id}-${i}`} style={styles.item}>
            <Text style={styles.itemCantidad}>{item.cantidad}×</Text>
            <View style={styles.flex}>
              <Text style={styles.itemNombre}>{item.nombre}</Text>
              {item.nota ? (
                <View style={styles.nota}>
                  <Ionicons name="chatbubble-ellipses-outline" size={13} color={colores.acentoTexto} />
                  <Text style={styles.notaTexto}>{item.nota}</Text>
                </View>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.pie}>
        <Text style={styles.total}>{formatearPrecio(pedido.total)}</Text>
        {siguiente ? (
          <View style={styles.acciones}>
            {pedido.estado === 'pendiente' ? (
              <Boton
                titulo="Cancelar"
                variante="texto"
                compacto
                onPress={() => onCambiarEstado('cancelado')}
                deshabilitado={guardando || bloqueado}
              />
            ) : null}
            <Boton
              titulo={siguiente.accion}
              icono={siguiente.icono}
              compacto
              onPress={() => onCambiarEstado(siguiente.estado)}
              cargando={guardando}
              deshabilitado={bloqueado}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

/** "hace 5 min" para pedidos en curso; "Lun 16 nov · 20:31" para el historial. */
function cuando(iso, cerrado) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  const hora = `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`;
  if (cerrado) {
    const dia = aISO(fecha);
    return dia === hoyISO() ? `Hoy · ${hora}` : `${fechaCorta(dia)} · ${hora}`;
  }
  const minutos = Math.floor((Date.now() - fecha.getTime()) / 60000);
  if (minutos < 1) return `${hora} · ahora`;
  if (minutos < 60) return `${hora} · hace ${minutos} min`;
  return `${hora} · hace ${Math.floor(minutos / 60)} h`;
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  filtros: {
    width: '100%',
    maxWidth: ANCHO_MAX,
    alignSelf: 'center',
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 6,
  },
  filaResumen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  resumen: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colores.texto,
  },
  enVivo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  puntoVivo: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colores.libre,
  },
  enVivoTexto: {
    fontSize: 12,
    color: colores.textoSuave,
  },
  lista: {
    width: '100%',
    maxWidth: ANCHO_MAX,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 14,
    gap: 12,
  },
  tarjetaNueva: {
    borderColor: colores.acento,
    borderLeftWidth: 5,
  },
  tarjetaCancelada: {
    opacity: 0.6,
  },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  cabeceraDerecha: {
    alignItems: 'flex-end',
    gap: 4,
  },
  codigo: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: colores.primario,
  },
  meta: {
    fontSize: 13,
    color: colores.textoSuave,
    marginTop: 2,
  },
  tiempo: {
    fontSize: 11,
    color: colores.textoSuave,
  },
  items: {
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  item: {
    flexDirection: 'row',
    gap: 10,
  },
  itemCantidad: {
    minWidth: 30,
    fontSize: 16,
    fontWeight: '900',
    color: colores.texto,
  },
  itemNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: colores.texto,
  },
  nota: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  notaTexto: {
    flex: 1,
    fontSize: 13,
    fontStyle: 'italic',
    color: colores.acentoTexto,
  },
  pie: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  total: {
    fontSize: 15,
    fontWeight: '800',
    color: colores.texto,
  },
  acciones: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
