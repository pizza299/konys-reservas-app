// Mesas del panel (RF-09, RF-10, RF-13): listado, interruptor Activa/Inactiva,
// editar, borrar y botón flotante "+" para crear una mesa nueva.
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Foto from '../ui/Foto';
import Interruptor from '../ui/Interruptor';
import BotonFlotante from '../ui/BotonFlotante';
import { AvisoError, Cargando, ErrorEstado, Vacio } from '../ui/Estados';
import FormMesa from './FormMesa';
import { useDatos } from '../../hooks/useDatos';
import { cambiarEstadoMesa, eliminarMesa, obtenerMesas } from '../../services/mesas';
import { ANCHO_MAX, colores, radios } from '../../constants/colors';
import { ETIQUETA_ZONA } from '../../constants/config';
import { pluralizar } from '../../utils/formato';
import { avisar, confirmar } from '../../utils/dialogos';

export default function AdminMesas() {
  const { datos, error, cargando, refrescando, recargar, recargarSilencioso } = useDatos(() =>
    obtenerMesas(),
  );
  const [formulario, setFormulario] = useState(null); // null | { mesa?: objeto }
  const [cambiando, setCambiando] = useState(null);

  const alternar = async (mesa, activa) => {
    setCambiando(mesa.id);
    try {
      await cambiarEstadoMesa(mesa.id, activa);
      await recargarSilencioso();
    } catch (e) {
      avisar('No se pudo cambiar el estado', e.message);
    } finally {
      setCambiando(null);
    }
  };

  const borrar = async (mesa) => {
    const ok = await confirmar(
      `Borrar ${mesa.nombre}`,
      'También se borrarán sus reservas. Si solo quieres dejar de recibir reservas, márcala como inactiva.',
      'Borrar',
    );
    if (!ok) return;
    try {
      await eliminarMesa(mesa.id);
      recargarSilencioso();
    } catch (e) {
      avisar('No se pudo borrar la mesa', e.message);
    }
  };

  if (!datos && cargando) return <Cargando texto="Cargando mesas…" />;
  if (!datos && error) return <ErrorEstado error={error} onReintentar={recargar} />;

  const activas = datos.filter((m) => m.activa).length;

  return (
    <View style={styles.contenedor}>
      <FlatList
        data={datos}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={recargar} />}
        ListHeaderComponent={
          <View style={styles.encabezado}>
            <AvisoError error={error} onReintentar={recargar} />
            <Text style={styles.resumen}>
              {pluralizar(datos.length, 'mesa', 'mesas')} · {pluralizar(activas, 'activa', 'activas')}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.tarjeta, !item.activa && styles.tarjetaInactiva]}>
            <View style={styles.fila}>
              <Foto uri={item.foto_url} icono="restaurant-outline" estilo={styles.foto} tamanoIcono={22} />
              <View style={styles.info}>
                <Text style={styles.nombre} numberOfLines={1}>
                  {item.nombre}
                </Text>
                <Text style={styles.detalle}>
                  {ETIQUETA_ZONA[item.zona]} · {item.capacidad} pers.
                </Text>
              </View>
              <View style={styles.interruptor}>
                <Interruptor
                  valor={item.activa}
                  onCambiar={(v) => alternar(item, v)}
                  deshabilitado={cambiando === item.id}
                  etiqueta={`${item.nombre} ${item.activa ? 'activa' : 'inactiva'}`}
                />
                <Text style={[styles.estado, item.activa && styles.estadoActivo]}>
                  {item.activa ? 'Activa' : 'Inactiva'}
                </Text>
              </View>
            </View>
            <View style={styles.acciones}>
              <Accion icono="create-outline" texto="Editar" onPress={() => setFormulario({ mesa: item })} />
              <Accion icono="trash-outline" texto="Borrar" peligro onPress={() => borrar(item)} />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Vacio
            icono="grid-outline"
            titulo="Aún no hay mesas"
            mensaje="Toca el botón + para registrar la primera mesa del restaurante."
          />
        }
      />

      <BotonFlotante etiqueta="Nueva mesa" onPress={() => setFormulario({})} />

      <FormMesa
        visible={Boolean(formulario)}
        mesa={formulario?.mesa}
        onCerrar={() => setFormulario(null)}
        onGuardada={() => {
          setFormulario(null);
          recargarSilencioso();
        }}
      />
    </View>
  );
}

function Accion({ icono, texto, onPress, peligro }) {
  const color = peligro ? colores.error : colores.primario;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.accion, pressed && styles.presionada]}
      accessibilityRole="button"
      hitSlop={4}
    >
      <Ionicons name={icono} size={16} color={color} />
      <Text style={[styles.accionTexto, { color }]}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
  },
  lista: {
    width: '100%',
    maxWidth: ANCHO_MAX,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 10,
  },
  encabezado: {
    gap: 10,
    marginBottom: 2,
  },
  resumen: {
    fontSize: 13,
    color: colores.textoSuave,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 12,
    gap: 10,
  },
  tarjetaInactiva: {
    backgroundColor: colores.superficieTenue,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  foto: {
    width: 56,
    height: 56,
    borderRadius: radios.md,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nombre: {
    fontSize: 16,
    fontWeight: '700',
    color: colores.texto,
  },
  detalle: {
    fontSize: 13,
    color: colores.textoSuave,
  },
  interruptor: {
    alignItems: 'center',
    gap: 2,
  },
  estado: {
    fontSize: 11,
    fontWeight: '600',
    color: colores.textoSuave,
  },
  estadoActivo: {
    color: colores.libre,
  },
  acciones: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    paddingTop: 6,
  },
  accion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 8,
  },
  accionTexto: {
    fontSize: 14,
    fontWeight: '600',
  },
  presionada: {
    opacity: 0.6,
  },
});
