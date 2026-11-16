// Pantalla "Tu pedido": platos elegidos en la carta, mesa y nombre del cliente,
// y botón "Enviar a cocina". El pedido aparece en el panel admin (sección Pedidos).
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import BarraSuperior from '../components/BarraSuperior';
import Boton from '../components/ui/Boton';
import Campo from '../components/ui/Campo';
import Cantidad from '../components/ui/Cantidad';
import Chip from '../components/ui/Chip';
import Foto from '../components/ui/Foto';
import { AvisoError, Vacio } from '../components/ui/Estados';
import { useDatos } from '../hooks/useDatos';
import { usePedido } from '../context/Pedido';
import { obtenerMesas } from '../services/mesas';
import { crearPedido, validarPedido } from '../services/pedidos';
import { ANCHO_MAX, colores, radios, sombra } from '../constants/colors';
import { CATEGORIAS, ETIQUETA_ZONA, MAX_CANTIDAD_PLATO } from '../constants/config';
import { codigoPedido, formatearPrecio, pluralizar } from '../utils/formato';

export default function Pedido() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pedido = usePedido();
  const mesas = useDatos(() => obtenerMesas({ soloActivas: true }), []);

  const [mesaId, setMesaId] = useState(pedido.cliente.mesaId);
  const [nombre, setNombre] = useState(pedido.cliente.nombre);
  const [mensaje, setMensaje] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // La mesa recordada solo vale si sigue activa.
  const mesaElegida = mesas.datos?.find((m) => m.id === mesaId) || null;
  const vacio = pedido.items.length === 0;

  const volverACarta = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/carta');
  };

  const enviar = async () => {
    if (enviando) return;
    const error = validarPedido({ items: pedido.items, mesaId: mesaElegida?.id, nombre });
    if (error) {
      setMensaje(error);
      return;
    }
    setEnviando(true);
    setMensaje(null);
    try {
      const productos = pedido.cantidadTotal;
      const { pedido: creado, mesa } = await crearPedido({
        items: pedido.items,
        mesaId: mesaElegida.id,
        nombre,
      });
      pedido.setCliente({ mesaId: mesa.id, nombre: nombre.trim() });
      router.replace({
        pathname: '/pedido-enviado',
        params: {
          codigo: codigoPedido(creado.id),
          mesa: mesa.nombre,
          zona: ETIQUETA_ZONA[mesa.zona],
          productos: String(productos),
          total: String(creado.total),
        },
      });
      pedido.vaciar();
    } catch (e) {
      setMensaje(e.message);
      setEnviando(false);
      if (e.codigo === 'MESA_INACTIVA') {
        setMesaId(null);
        mesas.recargarSilencioso();
      }
    }
  };

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.contenido}
          keyboardShouldPersistTaps="handled"
        >
          <BarraSuperior onAtras={volverACarta} />

          <View>
            <Text style={styles.titulo}>Tu pedido</Text>
            <Text style={styles.subtitulo}>Revisa tus platos y envíalos a la cocina.</Text>
          </View>

          {vacio ? (
            <Vacio icono="bag-outline" titulo="Tu pedido está vacío" mensaje="Agrega platos desde la carta.">
              <Boton titulo="Ver la carta" onPress={volverACarta} compacto estilo={styles.margenArriba} />
            </Vacio>
          ) : (
            <>
              <View style={styles.tarjeta}>
                {pedido.items.map((item, i) => (
                  <View key={item.clave}>
                    {i > 0 ? <View style={styles.separador} /> : null}
                    <LineaPedido
                      item={item}
                      onCambiar={(n) => pedido.cambiarCantidad(item.clave, n)}
                      onQuitar={() => pedido.quitar(item.clave)}
                    />
                  </View>
                ))}
                <Pressable
                  onPress={volverACarta}
                  style={({ pressed }) => [styles.agregarMas, pressed && styles.presionado]}
                  accessibilityRole="button"
                >
                  <Ionicons name="add-circle-outline" size={20} color={colores.acentoTexto} />
                  <Text style={styles.agregarMasTexto}>Agregar más platos</Text>
                </Pressable>
              </View>

              <View style={styles.seccion}>
                <Text style={styles.etiqueta}>¿En qué mesa estás?</Text>
                {mesas.cargando && !mesas.datos ? (
                  <ActivityIndicator color={colores.primario} style={styles.cargandoMesas} />
                ) : mesas.error && !mesas.datos ? (
                  <AvisoError error={mesas.error} onReintentar={mesas.recargar} />
                ) : (
                  <View style={styles.chips}>
                    {mesas.datos.map((m) => (
                      <Chip
                        key={m.id}
                        etiqueta={`${m.nombre} · ${ETIQUETA_ZONA[m.zona]}`}
                        activo={m.id === mesaElegida?.id}
                        onPress={() => {
                          setMesaId(m.id);
                          setMensaje(null);
                        }}
                      />
                    ))}
                  </View>
                )}
              </View>

              <Campo
                etiqueta="Tu nombre"
                placeholder="Ej. Laura Gómez"
                value={nombre}
                onChangeText={(t) => {
                  setNombre(t);
                  setMensaje(null);
                }}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                maxLength={80}
                returnKeyType="done"
                onSubmitEditing={enviar}
              />

              {mensaje ? (
                <View style={styles.mensaje} accessibilityLiveRegion="polite">
                  <Ionicons name="alert-circle" size={18} color={colores.error} />
                  <Text style={styles.mensajeTexto}>{mensaje}</Text>
                </View>
              ) : null}
            </>
          )}
        </ScrollView>

        {vacio ? null : (
          <View style={[styles.pie, { paddingBottom: Math.max(insets.bottom, 14) }]}>
            <View style={styles.filaTotal}>
              <Text style={styles.totalEtiqueta}>
                Total · {pluralizar(pedido.cantidadTotal, 'producto', 'productos')}
              </Text>
              <Text style={styles.total}>{formatearPrecio(pedido.total)}</Text>
            </View>
            <Boton titulo="Enviar a cocina" icono="restaurant-outline" onPress={enviar} cargando={enviando} />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function LineaPedido({ item, onCambiar, onQuitar }) {
  const icono = CATEGORIAS.find((c) => c.valor === item.categoria)?.icono || 'restaurant-outline';
  return (
    <View style={styles.linea}>
      <Foto uri={item.foto_url} icono={icono} estilo={styles.lineaFoto} tamanoIcono={22} />
      <View style={styles.lineaCuerpo}>
        <Text style={styles.lineaNombre} numberOfLines={2}>
          {item.nombre}
        </Text>
        {item.nota ? (
          <Text style={styles.lineaNota} numberOfLines={2}>
            “{item.nota}”
          </Text>
        ) : null}
        <Text style={styles.lineaUnitario}>{formatearPrecio(item.precio)} c/u</Text>
        <View style={styles.lineaPie}>
          <Cantidad
            valor={item.cantidad}
            onCambiar={onCambiar}
            onQuitar={onQuitar}
            max={MAX_CANTIDAD_PLATO}
            nombre={item.nombre}
          />
          <Text style={styles.lineaTotal}>{formatearPrecio(item.precio * item.cantidad)}</Text>
        </View>
      </View>
    </View>
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
  contenido: {
    width: '100%',
    maxWidth: ANCHO_MAX,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '800',
    color: colores.texto,
  },
  subtitulo: {
    fontSize: 13,
    color: colores.textoSuave,
    marginTop: 2,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radios.lg,
    paddingHorizontal: 14,
    paddingTop: 4,
    ...sombra,
  },
  separador: {
    height: 1,
    backgroundColor: colores.borde,
  },
  linea: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  lineaFoto: {
    width: 64,
    height: 64,
    borderRadius: radios.md,
  },
  lineaCuerpo: {
    flex: 1,
    gap: 2,
  },
  lineaNombre: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
  },
  lineaNota: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colores.acentoTexto,
  },
  lineaUnitario: {
    fontSize: 12,
    color: colores.textoSuave,
  },
  lineaPie: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  lineaTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: colores.primario,
  },
  agregarMas: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 48,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  agregarMasTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: colores.acentoTexto,
  },
  presionado: {
    opacity: 0.7,
  },
  seccion: {
    gap: 10,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '700',
    color: colores.texto,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cargandoMesas: {
    alignSelf: 'flex-start',
  },
  mensaje: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colores.errorFondo,
    borderRadius: radios.md,
    padding: 12,
  },
  mensajeTexto: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colores.error,
  },
  pie: {
    width: '100%',
    maxWidth: ANCHO_MAX,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    backgroundColor: colores.fondo,
  },
  filaTotal: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  totalEtiqueta: {
    fontSize: 13,
    color: colores.textoSuave,
  },
  total: {
    fontSize: 22,
    fontWeight: '900',
    color: colores.primario,
  },
  margenArriba: {
    marginTop: 12,
  },
});
