// Carta (admin) (RF-14): agregar, editar, ocultar y borrar platos.
// Se abre con el botón "Carta" del panel de administración.
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Chip from '../components/ui/Chip';
import Foto from '../components/ui/Foto';
import Interruptor from '../components/ui/Interruptor';
import BotonFlotante from '../components/ui/BotonFlotante';
import { AvisoError, Cargando, ErrorEstado, Vacio } from '../components/ui/Estados';
import FormPlato from '../components/admin/FormPlato';
import { useAdminAuth } from '../context/AdminAuth';
import { useDatos } from '../hooks/useDatos';
import { cambiarDisponibilidad, eliminarPlato, obtenerPlatos } from '../services/platos';
import { ANCHO_MAX, colores, radios, TACTIL_MIN } from '../constants/colors';
import { CATEGORIAS } from '../constants/config';
import { formatearPrecio, pluralizar, porcentajeDescuento } from '../utils/formato';
import { avisar, confirmar } from '../utils/dialogos';

const FILTROS = [{ valor: 'todas', etiqueta: 'Todas' }, ...CATEGORIAS];

export default function AdminCarta() {
  const { esAdmin, cargando: cargandoSesion } = useAdminAuth();
  const router = useRouter();
  const [filtro, setFiltro] = useState('todas');
  const [formulario, setFormulario] = useState(null);
  const [cambiando, setCambiando] = useState(null);
  const { datos, error, cargando, refrescando, recargar, recargarSilencioso } = useDatos(() =>
    obtenerPlatos(),
  );

  const platos = useMemo(
    () => (datos || []).filter((p) => filtro === 'todas' || p.categoria === filtro),
    [datos, filtro],
  );

  // Solo el administrador puede entrar aquí.
  if (!cargandoSesion && !esAdmin) return <Redirect href="/admin" />;

  const alternar = async (plato, disponible) => {
    setCambiando(plato.id);
    try {
      await cambiarDisponibilidad(plato.id, disponible);
      await recargarSilencioso();
    } catch (e) {
      avisar('No se pudo actualizar el plato', e.message);
    } finally {
      setCambiando(null);
    }
  };

  const borrar = async (plato) => {
    const ok = await confirmar(
      `Borrar "${plato.nombre}"`,
      'El plato se eliminará de la carta. Si solo quieres ocultarlo por un tiempo, apaga "Visible".',
      'Borrar',
    );
    if (!ok) return;
    try {
      await eliminarPlato(plato.id);
      recargarSilencioso();
    } catch (e) {
      avisar('No se pudo borrar el plato', e.message);
    }
  };

  const ocultos = (datos || []).filter((p) => !p.disponible).length;

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <View style={styles.encabezado}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.navigate('/admin'))}
          style={styles.atras}
          accessibilityRole="button"
          accessibilityLabel="Volver al panel"
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color={colores.texto} />
        </Pressable>
        <View style={styles.flex}>
          <Text style={styles.etiquetaPanel}>Panel admin</Text>
          <Text style={styles.titulo}>Carta</Text>
        </View>
        {datos ? (
          <Text style={styles.conteo}>
            {pluralizar(datos.length, 'plato', 'platos')}
            {ocultos ? ` · ${ocultos} ${ocultos === 1 ? 'oculto' : 'ocultos'}` : ''}
          </Text>
        ) : null}
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtros}>
          {FILTROS.map((f) => (
            <Chip key={f.valor} etiqueta={f.etiqueta} activo={filtro === f.valor} onPress={() => setFiltro(f.valor)} />
          ))}
        </ScrollView>
      </View>

      {!datos && cargando ? (
        <Cargando texto="Cargando carta…" />
      ) : !datos && error ? (
        <ErrorEstado error={error} onReintentar={recargar} />
      ) : (
        <FlatList
          data={platos}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={styles.lista}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={recargar} />}
          ListHeaderComponent={<AvisoError error={error} onReintentar={recargar} />}
          renderItem={({ item }) => {
            const cat = CATEGORIAS.find((c) => c.valor === item.categoria);
            return (
              <View style={[styles.tarjeta, !item.disponible && styles.tarjetaOculta]}>
                <View style={styles.fila}>
                  <Foto uri={item.foto_url} icono={cat?.icono} estilo={styles.foto} tamanoIcono={22} />
                  <View style={styles.flex}>
                    <Text style={styles.nombre} numberOfLines={1}>
                      {item.nombre}
                    </Text>
                    <Text style={styles.detalle}>
                      {cat?.etiqueta} · {formatearPrecio(item.precio)}
                      {porcentajeDescuento(item) ? (
                        <Text style={styles.promo}>  -{porcentajeDescuento(item)}%</Text>
                      ) : null}
                    </Text>
                    {item.descripcion ? (
                      <Text style={styles.descripcion} numberOfLines={1}>
                        {item.descripcion}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.interruptor}>
                    <Interruptor
                      valor={item.disponible}
                      onCambiar={(v) => alternar(item, v)}
                      deshabilitado={cambiando === item.id}
                      etiqueta={`${item.nombre} ${item.disponible ? 'visible' : 'oculto'}`}
                    />
                    <Text style={[styles.estado, item.disponible && styles.estadoVisible]}>
                      {item.disponible ? 'Visible' : 'Oculto'}
                    </Text>
                  </View>
                </View>
                <View style={styles.acciones}>
                  <Accion icono="create-outline" texto="Editar" onPress={() => setFormulario({ plato: item })} />
                  <Accion icono="trash-outline" texto="Borrar" peligro onPress={() => borrar(item)} />
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <Vacio
              icono="restaurant-outline"
              titulo="Sin platos"
              mensaje="Toca el botón + para agregar un plato a la carta."
            />
          }
        />
      )}

      <BotonFlotante etiqueta="Nuevo plato" onPress={() => setFormulario({})} />

      <FormPlato
        visible={Boolean(formulario)}
        plato={formulario?.plato}
        categoriaInicial={filtro === 'todas' ? 'pizzas' : filtro}
        onCerrar={() => setFormulario(null)}
        onGuardado={() => {
          setFormulario(null);
          recargarSilencioso();
        }}
      />
    </SafeAreaView>
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
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  flex: {
    flex: 1,
  },
  encabezado: {
    width: '100%',
    maxWidth: ANCHO_MAX,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  atras: {
    width: TACTIL_MIN,
    height: TACTIL_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etiquetaPanel: {
    fontSize: 12,
    color: colores.textoSuave,
  },
  titulo: {
    fontSize: 26,
    fontWeight: '800',
    color: colores.texto,
  },
  conteo: {
    fontSize: 12,
    color: colores.textoSuave,
    marginRight: 8,
  },
  filtros: {
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  lista: {
    width: '100%',
    maxWidth: ANCHO_MAX,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 10,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 12,
    gap: 10,
  },
  tarjetaOculta: {
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
  nombre: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
  },
  detalle: {
    fontSize: 13,
    color: colores.textoSuave,
  },
  descripcion: {
    fontSize: 12,
    color: colores.textoTenue,
  },
  promo: {
    fontWeight: '800',
    color: colores.acentoTexto,
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
  estadoVisible: {
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
