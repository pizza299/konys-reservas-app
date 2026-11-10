// Componentes para los estados de carga, error y vacío (RNF-09).
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Boton from './Boton';
import { colores, radios } from '../../constants/colors';
import { modoDemo } from '../../services/db';

export function Cargando({ texto = 'Cargando…' }) {
  return (
    <View style={styles.centro}>
      <ActivityIndicator size="large" color={colores.primario} />
      <Text style={styles.textoSuave}>{texto}</Text>
    </View>
  );
}

export function ErrorEstado({ error, onReintentar }) {
  const sinConexion = error?.codigo === 'SIN_CONEXION';
  return (
    <View style={styles.centro}>
      <View style={styles.iconoGrande}>
        <Ionicons
          name={sinConexion ? 'cloud-offline-outline' : 'alert-circle-outline'}
          size={34}
          color={colores.primario}
        />
      </View>
      <Text style={styles.titulo}>{sinConexion ? 'Sin conexión' : 'Algo salió mal'}</Text>
      <Text style={styles.mensaje}>{error?.message || 'No se pudieron cargar los datos.'}</Text>
      {onReintentar ? (
        <Boton titulo="Reintentar" icono="refresh" onPress={onReintentar} compacto estilo={styles.boton} />
      ) : null}
    </View>
  );
}

export function Vacio({ icono = 'file-tray-outline', titulo, mensaje, children }) {
  return (
    <View style={styles.vacio}>
      <View style={styles.iconoGrande}>
        <Ionicons name={icono} size={30} color={colores.textoSuave} />
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
      {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}
      {children}
    </View>
  );
}

/** Aviso pequeño cuando falla una actualización pero ya hay datos en pantalla. */
export function AvisoError({ error, onReintentar }) {
  if (!error) return null;
  return (
    <Pressable onPress={onReintentar} style={styles.aviso} accessibilityRole="button">
      <Ionicons name="cloud-offline-outline" size={18} color={colores.error} />
      <Text style={styles.avisoTexto} numberOfLines={2}>
        {error.message}
      </Text>
      {onReintentar ? <Text style={styles.avisoAccion}>Reintentar</Text> : null}
    </Pressable>
  );
}

/** Indica que la app está usando datos locales porque no hay Supabase configurado. */
export function BannerDemo() {
  if (!modoDemo) return null;
  return (
    <View style={styles.demo}>
      <Ionicons name="flask-outline" size={14} color={colores.acentoTexto} />
      <Text style={styles.demoTexto}>Modo demo · datos locales (configura Supabase en .env)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
  },
  vacio: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 8,
  },
  iconoGrande: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colores.superficieTenue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: colores.texto,
    textAlign: 'center',
  },
  mensaje: {
    fontSize: 14,
    color: colores.textoSuave,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  textoSuave: {
    fontSize: 14,
    color: colores.textoSuave,
  },
  boton: {
    marginTop: 10,
  },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colores.errorFondo,
    borderRadius: radios.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  avisoTexto: {
    flex: 1,
    fontSize: 13,
    color: colores.error,
  },
  avisoAccion: {
    fontSize: 13,
    fontWeight: '700',
    color: colores.error,
  },
  demo: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    backgroundColor: colores.acentoSuave,
    borderRadius: radios.pildora,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  demoTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: colores.acentoTexto,
  },
});
