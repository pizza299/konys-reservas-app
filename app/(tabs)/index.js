// Pantalla de Inicio (RF-01): encabezado de Konys Pizza, horarios de
// atención, botón "Reservar mesa" y lista de tarjetas de mesas.
import { useMemo, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MesaCard from '../../components/MesaCard';
import Portada from '../../components/Portada';
import Boton from '../../components/ui/Boton';
import Chip from '../../components/ui/Chip';
import { AvisoError, BannerDemo, Cargando, ErrorEstado, Vacio } from '../../components/ui/Estados';
import { useDatos } from '../../hooks/useDatos';
import { obtenerMesas } from '../../services/mesas';
import { obtenerHorarios, resumenHorarios } from '../../services/horarios';
import { estadoMesasHoy } from '../../services/reservas';
import { ANCHO_MAX, colores, radios } from '../../constants/colors';
import { DIRECCION, ZONAS } from '../../constants/config';
import { pluralizar } from '../../utils/formato';
import { completarFilas } from '../../utils/cuadricula';

const FILTROS = [{ valor: 'todas', etiqueta: 'Todas' }, ...ZONAS];

async function cargarInicio() {
  const [mesas, horarios] = await Promise.all([
    obtenerMesas({ soloActivas: true }),
    obtenerHorarios(),
  ]);
  const estados = await estadoMesasHoy(mesas, horarios);
  return { mesas, horarios, estados };
}

export default function Inicio() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const columnas = Math.min(width, ANCHO_MAX) >= 600 ? 3 : 2;
  const [filtro, setFiltro] = useState('todas');
  const lista = useRef(null);
  const posicionMesas = useRef(0);
  const { datos, error, cargando, refrescando, recargar } = useDatos(cargarInicio);

  const mesasFiltradas = useMemo(() => {
    if (!datos) return [];
    return filtro === 'todas' ? datos.mesas : datos.mesas.filter((m) => m.zona === filtro);
  }, [datos, filtro]);

  if (!datos && cargando) return <Cargando texto="Cargando mesas…" />;
  if (!datos && error) {
    return (
      <SafeAreaView style={styles.pantalla} edges={['top']}>
        <ErrorEstado error={error} onReintentar={recargar} />
      </SafeAreaView>
    );
  }

  const horarios = resumenHorarios(datos.horarios);
  const conCupo = datos.mesas.filter((m) => datos.estados[m.id] === 'libre').length;

  const irAMesas = () => {
    lista.current?.scrollToOffset({ offset: posicionMesas.current, animated: true });
  };

  const encabezado = (
    <View style={styles.encabezado}>
      <Text style={styles.tituloApp}>Konys Pizza</Text>
      <BannerDemo />
      <AvisoError error={error} onReintentar={recargar} />

      <Portada />

      {horarios.length > 0 ? (
        <View style={styles.jornadas} accessibilityLabel="Horario de atención">
          {horarios.map((h) => (
            <View key={h.clave} style={styles.jornada}>
              <Text style={styles.jornadaTexto}>{h.texto}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.direccion}>
        <Ionicons name="location-outline" size={14} color={colores.textoSuave} />
        <Text style={styles.direccionTexto}>{DIRECCION}</Text>
      </View>

      <Boton titulo="Reservar mesa" onPress={irAMesas} estilo={styles.reservar} />

      <View
        style={styles.seccion}
        onLayout={(e) => {
          posicionMesas.current = Math.max(0, e.nativeEvent.layout.y - 8);
        }}
      >
        <Text style={styles.paso}>PASO 1 DE 3 · ELIGE TU MESA</Text>
        <Text style={styles.tituloSeccion}>Nuestras mesas</Text>
        <Text style={styles.subtitulo}>
          {pluralizar(datos.mesas.length, 'mesa', 'mesas')} · {conCupo} con cupo hoy
        </Text>
        <View style={styles.filtros}>
          {FILTROS.map((f) => (
            <Chip
              key={f.valor}
              etiqueta={f.etiqueta}
              activo={filtro === f.valor}
              onPress={() => setFiltro(f.valor)}
            />
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <FlatList
        ref={lista}
        key={`columnas-${columnas}`}
        data={completarFilas(mesasFiltradas, columnas)}
        keyExtractor={(m) => String(m.id)}
        numColumns={columnas}
        ListHeaderComponent={encabezado}
        columnWrapperStyle={styles.columnas}
        contentContainerStyle={styles.contenido}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={recargar} />}
        renderItem={({ item }) =>
          item.relleno ? (
            <View style={styles.celda} />
          ) : (
            <View style={styles.celda}>
              <MesaCard
                mesa={item}
                estado={datos.estados[item.id]}
                onPress={() =>
                  router.push({ pathname: '/reservar/[mesaId]', params: { mesaId: String(item.id) } })
                }
              />
            </View>
          )
        }
        ListEmptyComponent={
          <Vacio
            icono="restaurant-outline"
            titulo="No hay mesas disponibles"
            mensaje={
              filtro === 'todas'
                ? 'Por ahora no hay mesas habilitadas para reservar. Vuelve a intentarlo más tarde.'
                : 'No hay mesas habilitadas en esta zona.'
            }
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    width: '100%',
    maxWidth: ANCHO_MAX,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  columnas: {
    gap: 12,
  },
  celda: {
    flex: 1,
  },
  encabezado: {
    gap: 14,
    paddingTop: 6,
    paddingBottom: 4,
  },
  tituloApp: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
    color: colores.texto,
  },
  jornadas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  jornada: {
    borderWidth: 1,
    borderColor: colores.bordeFuerte,
    borderRadius: radios.pildora,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colores.superficie,
  },
  jornadaTexto: {
    fontSize: 11,
    color: colores.texto,
  },
  direccion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: -6,
  },
  direccionTexto: {
    fontSize: 12,
    color: colores.textoSuave,
  },
  reservar: {
    marginTop: 2,
  },
  seccion: {
    marginTop: 10,
    gap: 4,
  },
  paso: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: colores.acentoTexto,
  },
  tituloSeccion: {
    fontSize: 20,
    fontWeight: '800',
    color: colores.texto,
  },
  subtitulo: {
    fontSize: 13,
    color: colores.textoSuave,
  },
  filtros: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
});
