// Reservas del panel (RF-12): filtros Hoy · Mañana · Todas y por mesa.
// Al tocar una reserva se puede marcar como completada o cancelada.
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Segmentado from '../ui/Segmentado';
import Insignia from '../ui/Insignia';
import HojaModal from '../ui/HojaModal';
import Boton from '../ui/Boton';
import { AvisoError, Cargando, ErrorEstado, Vacio } from '../ui/Estados';
import { useDatos } from '../../hooks/useDatos';
import { obtenerMesas } from '../../services/mesas';
import { cambiarEstadoReserva, obtenerReservas } from '../../services/reservas';
import { ANCHO_MAX, colores, radios, TACTIL_MIN } from '../../constants/colors';
import { ESTADOS_RESERVA, ETIQUETA_ZONA } from '../../constants/config';
import { fechaCorta, hoyISO, mananaISO } from '../../utils/fechas';
import { codigoReserva, pluralizar } from '../../utils/formato';
import { confirmar } from '../../utils/dialogos';

const FILTROS = [
  { valor: 'hoy', etiqueta: 'Hoy' },
  { valor: 'manana', etiqueta: 'Mañana' },
  { valor: 'todas', etiqueta: 'Todas' },
];

export default function AdminReservas() {
  const [filtro, setFiltro] = useState('hoy');
  const [mesaId, setMesaId] = useState(null);
  const [eligiendoMesa, setEligiendoMesa] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorAccion, setErrorAccion] = useState(null);

  const fecha = filtro === 'hoy' ? hoyISO() : filtro === 'manana' ? mananaISO() : null;

  const { datos, error, cargando, refrescando, recargar, recargarSilencioso } = useDatos(async () => {
    const [reservas, mesas] = await Promise.all([
      obtenerReservas({ fecha, mesaId }),
      obtenerMesas(),
    ]);
    return { reservas, mesas };
  }, [fecha, mesaId]);

  const mesasPorId = useMemo(() => {
    const mapa = {};
    (datos?.mesas || []).forEach((m) => {
      mapa[m.id] = m;
    });
    return mapa;
  }, [datos]);

  const secciones = useMemo(() => agrupar(datos?.reservas || []), [datos]);
  const mesaElegida = mesaId ? mesasPorId[mesaId] : null;
  const total = datos?.reservas.length || 0;

  const cambiarEstado = async (reserva, estado) => {
    if (estado === 'cancelada') {
      const ok = await confirmar(
        'Cancelar reserva',
        `¿Cancelar la reserva de ${reserva.cliente_nombre}? El horario quedará libre para otros clientes.`,
        'Cancelar reserva',
      );
      if (!ok) return;
    }
    setGuardando(true);
    setErrorAccion(null);
    try {
      const actualizada = await cambiarEstadoReserva(reserva.id, estado);
      setDetalle(actualizada);
      recargarSilencioso();
    } catch (e) {
      setErrorAccion(e.message);
    } finally {
      setGuardando(false);
    }
  };

  const textoFecha = fecha ? fechaCorta(fecha) : 'Todas las fechas';

  return (
    <View style={styles.contenedor}>
      <View style={styles.filtros}>
        <Segmentado opciones={FILTROS} valor={filtro} onCambiar={setFiltro} />
        <View style={styles.filaResumen}>
          <Text style={styles.resumen}>
            {textoFecha} · {pluralizar(total, 'reserva', 'reservas')}
          </Text>
          <Pressable
            onPress={() => setEligiendoMesa(true)}
            style={styles.filtroMesa}
            accessibilityRole="button"
            accessibilityLabel="Filtrar por mesa"
          >
            <Text style={styles.filtroMesaTexto}>{mesaElegida ? mesaElegida.nombre : 'Mesa'}</Text>
            <Ionicons name="caret-down" size={12} color={colores.texto} />
          </Pressable>
        </View>
        <AvisoError error={datos ? error : null} onReintentar={recargar} />
      </View>

      {!datos && cargando ? (
        <Cargando texto="Cargando reservas…" />
      ) : !datos && error ? (
        <ErrorEstado error={error} onReintentar={recargar} />
      ) : (
        <SectionList
          sections={secciones}
          keyExtractor={(r) => String(r.id)}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.lista}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={recargar} />}
          renderSectionHeader={({ section }) =>
            filtro === 'todas' ? (
              <Text style={styles.encabezadoSeccion}>
                {fechaCorta(section.fecha)} · {pluralizar(section.data.length, 'reserva', 'reservas')}
              </Text>
            ) : null
          }
          renderItem={({ item, index, section }) => {
            const anterior = section.data[index - 1];
            const mostrarHora = !anterior || anterior.hora_inicio !== item.hora_inicio;
            const esUltima = index === section.data.length - 1;
            return (
              <FilaReserva
                reserva={item}
                mesa={mesasPorId[item.mesa_id]}
                mostrarHora={mostrarHora}
                esUltima={esUltima}
                onPress={() => {
                  setErrorAccion(null);
                  setDetalle(item);
                }}
              />
            );
          }}
          ListEmptyComponent={
            <Vacio
              icono="calendar-clear-outline"
              titulo="Sin reservas"
              mensaje={
                filtro === 'todas'
                  ? 'Todavía no hay reservas registradas.'
                  : `No hay reservas para ${filtro === 'hoy' ? 'hoy' : 'mañana'}${mesaElegida ? ` en ${mesaElegida.nombre}` : ''}.`
              }
            />
          }
        />
      )}

      <HojaModal visible={eligiendoMesa} titulo="Filtrar por mesa" onCerrar={() => setEligiendoMesa(false)}>
        <View style={styles.opcionesMesa}>
          {[{ id: null, nombre: 'Todas las mesas' }, ...(datos?.mesas || [])].map((m) => {
            const activa = m.id === mesaId;
            return (
              <Pressable
                key={String(m.id)}
                onPress={() => {
                  setMesaId(m.id);
                  setEligiendoMesa(false);
                }}
                style={[styles.opcionMesa, activa && styles.opcionMesaActiva]}
                accessibilityRole="button"
                accessibilityState={{ selected: activa }}
              >
                <Text style={[styles.opcionMesaTexto, activa && styles.opcionMesaTextoActivo]}>
                  {m.nombre}
                  {m.zona ? ` · ${ETIQUETA_ZONA[m.zona]}` : ''}
                </Text>
                {activa ? <Ionicons name="checkmark" size={18} color={colores.blanco} /> : null}
              </Pressable>
            );
          })}
        </View>
      </HojaModal>

      <HojaModal
        visible={Boolean(detalle)}
        titulo={detalle?.cliente_nombre || ''}
        onCerrar={() => setDetalle(null)}
        pie={
          detalle ? (
            <>
              {detalle.estado === 'confirmada' ? (
                <>
                  <Boton
                    titulo="Marcar como completada"
                    icono="checkmark-done"
                    onPress={() => cambiarEstado(detalle, 'completada')}
                    cargando={guardando}
                  />
                  <Boton
                    titulo="Cancelar reserva"
                    variante="peligro"
                    onPress={() => cambiarEstado(detalle, 'cancelada')}
                    deshabilitado={guardando}
                  />
                </>
              ) : (
                <Boton
                  titulo="Volver a confirmada"
                  variante="secundario"
                  icono="arrow-undo"
                  onPress={() => cambiarEstado(detalle, 'confirmada')}
                  cargando={guardando}
                />
              )}
            </>
          ) : null
        }
      >
        {detalle ? (
          <View style={styles.detalle}>
            <Insignia texto={ESTADOS_RESERVA[detalle.estado]} variante={detalle.estado} />
            <Dato icono="ticket-outline" etiqueta="Código" valor={codigoReserva(detalle.id)} />
            <Dato icono="calendar-outline" etiqueta="Fecha" valor={fechaCorta(detalle.fecha)} />
            <Dato icono="time-outline" etiqueta="Hora" valor={`${detalle.hora_inicio} – ${detalle.hora_fin}`} />
            <Dato
              icono="restaurant-outline"
              etiqueta="Mesa"
              valor={
                mesasPorId[detalle.mesa_id]
                  ? `${mesasPorId[detalle.mesa_id].nombre} · ${ETIQUETA_ZONA[mesasPorId[detalle.mesa_id].zona]}`
                  : `Mesa #${detalle.mesa_id}`
              }
            />
            <Dato icono="people-outline" etiqueta="Personas" valor={String(detalle.num_personas)} />
            <Dato icono="call-outline" etiqueta="Contacto" valor={detalle.cliente_contacto || 'No registrado'} />
            {errorAccion ? <Text style={styles.errorAccion}>{errorAccion}</Text> : null}
          </View>
        ) : null}
      </HojaModal>
    </View>
  );
}

function agrupar(reservas) {
  const porFecha = {};
  reservas.forEach((r) => {
    (porFecha[r.fecha] ||= []).push(r);
  });
  const hoy = hoyISO();
  // Primero las próximas (de la más cercana a la más lejana) y luego las pasadas.
  const fechas = Object.keys(porFecha).sort((a, b) => {
    const aPasada = a < hoy;
    const bPasada = b < hoy;
    if (aPasada !== bPasada) return aPasada ? 1 : -1;
    return aPasada ? b.localeCompare(a) : a.localeCompare(b);
  });
  return fechas.map((fecha) => ({
    fecha,
    data: porFecha[fecha].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio)),
  }));
}

function FilaReserva({ reserva, mesa, mostrarHora, esUltima, onPress }) {
  const cancelada = reserva.estado === 'cancelada';
  return (
    <View style={styles.fila}>
      <Text style={styles.hora}>{mostrarHora ? reserva.hora_inicio : ''}</Text>
      <View style={styles.linea}>
        {mostrarHora ? <View style={styles.puntoLinea} /> : null}
        {!esUltima ? <View style={styles.trazo} /> : null}
      </View>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.tarjeta, cancelada && styles.tarjetaCancelada, pressed && styles.presionada]}
        accessibilityRole="button"
        accessibilityLabel={`${reserva.cliente_nombre}, ${reserva.hora_inicio}, ${ESTADOS_RESERVA[reserva.estado]}`}
      >
        <View style={styles.tarjetaTexto}>
          <Text style={styles.cliente} numberOfLines={1}>
            {reserva.cliente_nombre}
          </Text>
          <Text style={styles.detalleFila} numberOfLines={1}>
            {mesa ? mesa.nombre : `Mesa #${reserva.mesa_id}`} · {reserva.num_personas} pers.
          </Text>
        </View>
        <Insignia texto={ESTADOS_RESERVA[reserva.estado]} variante={reserva.estado} />
        <Ionicons name="chevron-forward" size={16} color={colores.textoSuave} />
      </Pressable>
    </View>
  );
}

function Dato({ icono, etiqueta, valor }) {
  return (
    <View style={styles.dato}>
      <Ionicons name={icono} size={18} color={colores.textoSuave} />
      <Text style={styles.datoEtiqueta}>{etiqueta}</Text>
      <Text style={styles.datoValor} selectable>
        {valor}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
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
  },
  resumen: {
    fontSize: 13,
    fontWeight: '600',
    color: colores.texto,
  },
  filtroMesa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 36,
    paddingHorizontal: 10,
  },
  filtroMesaTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: colores.texto,
  },
  lista: {
    width: '100%',
    maxWidth: ANCHO_MAX,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  encabezadoSeccion: {
    fontSize: 13,
    fontWeight: '700',
    color: colores.textoSuave,
    marginTop: 14,
    marginBottom: 8,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  hora: {
    width: 46,
    fontSize: 13,
    fontWeight: '700',
    color: colores.texto,
    paddingTop: 16,
  },
  linea: {
    width: 18,
    alignItems: 'center',
  },
  puntoLinea: {
    position: 'absolute',
    top: 20,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colores.primario,
    zIndex: 1,
  },
  trazo: {
    position: 'absolute',
    top: 20,
    bottom: -20,
    width: 2,
    backgroundColor: colores.borde,
  },
  tarjeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 64,
    marginBottom: 10,
    marginLeft: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  tarjetaCancelada: {
    opacity: 0.55,
  },
  presionada: {
    opacity: 0.8,
  },
  tarjetaTexto: {
    flex: 1,
    gap: 2,
  },
  cliente: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
  },
  detalleFila: {
    fontSize: 12,
    color: colores.textoSuave,
  },
  opcionesMesa: {
    gap: 8,
  },
  opcionMesa: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: TACTIL_MIN + 4,
    paddingHorizontal: 16,
    borderRadius: radios.md,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  opcionMesaActiva: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  opcionMesaTexto: {
    fontSize: 15,
    color: colores.texto,
  },
  opcionMesaTextoActivo: {
    color: colores.blanco,
    fontWeight: '700',
  },
  detalle: {
    gap: 14,
  },
  dato: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  datoEtiqueta: {
    width: 80,
    fontSize: 13,
    color: colores.textoSuave,
  },
  datoValor: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colores.texto,
  },
  errorAccion: {
    fontSize: 13,
    color: colores.error,
  },
});
