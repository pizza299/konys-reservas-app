// Acceso al panel con PIN de 4 dígitos.
// Si el PIN es incorrecto muestra un aviso; tras varios intentos bloquea unos segundos.
import { useCallback, useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAdminAuth } from '../../context/AdminAuth';
import { colores, radios } from '../../constants/colors';
import { MAX_INTENTOS_PIN, SEGUNDOS_BLOQUEO_PIN } from '../../constants/config';

const LARGO_PIN = 4;
const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'borrar', '0', 'entrar'];

export default function IngresoPin() {
  const { ingresar } = useAdminAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);
  const [intentos, setIntentos] = useState(0);
  const [segundosBloqueo, setSegundosBloqueo] = useState(0);
  const [sacudida] = useState(() => new Animated.Value(0));

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  // Cuenta regresiva del bloqueo (un segundo a la vez).
  const bloqueado = segundosBloqueo > 0;
  useEffect(() => {
    if (!bloqueado) return undefined;
    const temporizador = setTimeout(() => setSegundosBloqueo((s) => s - 1), 1000);
    return () => clearTimeout(temporizador);
  }, [bloqueado, segundosBloqueo]);

  const sacudir = () => {
    sacudida.setValue(0);
    Animated.sequence(
      [10, -10, 8, -8, 0].map((x) =>
        Animated.timing(sacudida, { toValue: x, duration: 55, useNativeDriver: true }),
      ),
    ).start();
  };

  const enviar = async () => {
    if (pin.length < LARGO_PIN || bloqueado) return;
    const correcto = await ingresar(pin);
    if (correcto) return;
    const nuevos = intentos + 1;
    setIntentos(nuevos);
    setPin('');
    sacudir();
    if (nuevos >= MAX_INTENTOS_PIN) {
      setIntentos(0);
      setSegundosBloqueo(SEGUNDOS_BLOQUEO_PIN);
      setError(null);
    } else {
      setError('PIN incorrecto · intenta de nuevo');
    }
  };

  const tocar = (tecla) => {
    if (bloqueado) return;
    if (tecla === 'borrar') {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (tecla === 'entrar') {
      enviar();
      return;
    }
    setError(null);
    setPin((p) => (p.length < LARGO_PIN ? p + tecla : p));
  };

  return (
    <View style={styles.pantalla}>
      <View style={styles.superior}>
        <SafeAreaView edges={['top']} style={styles.superiorContenido}>
          <Ionicons name="lock-closed-outline" size={44} color={colores.blanco} />
          <Text style={styles.titulo}>Panel de administración</Text>
          <Text style={styles.subtitulo}>Ingresa el PIN de {LARGO_PIN} dígitos</Text>
          <Animated.View style={[styles.puntos, { transform: [{ translateX: sacudida }] }]}>
            {Array.from({ length: LARGO_PIN }, (_, i) => (
              <View key={i} style={[styles.punto, i < pin.length && styles.puntoLleno]} />
            ))}
          </Animated.View>
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {bloqueado ? `Demasiados intentos. Espera ${segundosBloqueo} s.` : error || ' '}
          </Text>
        </SafeAreaView>
      </View>

      <View style={styles.teclado}>
        {TECLAS.map((tecla) => {
          const esEntrar = tecla === 'entrar';
          const esBorrar = tecla === 'borrar';
          const inactiva = bloqueado || (esEntrar && pin.length < LARGO_PIN);
          return (
            <Pressable
              key={tecla}
              onPress={() => tocar(tecla)}
              disabled={inactiva}
              accessibilityRole="button"
              accessibilityLabel={esEntrar ? 'Entrar' : esBorrar ? 'Borrar' : tecla}
              style={({ pressed }) => [
                styles.tecla,
                esBorrar && styles.teclaBorrar,
                esEntrar && styles.teclaEntrar,
                inactiva && styles.teclaInactiva,
                pressed && styles.teclaPresionada,
              ]}
            >
              <Text
                style={[
                  styles.teclaTexto,
                  (esEntrar || esBorrar) && styles.teclaTextoAccion,
                  esEntrar && styles.teclaTextoEntrar,
                ]}
              >
                {esEntrar ? 'Entrar' : esBorrar ? 'Borrar' : tecla}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  superior: {
    flex: 1,
    backgroundColor: colores.primario,
    borderBottomLeftRadius: radios.xl,
    borderBottomRightRadius: radios.xl,
  },
  superiorContenido: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 24,
    gap: 8,
  },
  titulo: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: '800',
    color: colores.blanco,
  },
  subtitulo: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
  },
  puntos: {
    flexDirection: 'row',
    gap: 22,
    marginTop: 22,
  },
  punto: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  puntoLleno: {
    backgroundColor: colores.blanco,
    borderColor: colores.blanco,
  },
  error: {
    marginTop: 14,
    fontSize: 13,
    color: '#FFD3AE',
    minHeight: 18,
  },
  teclado: {
    flex: 1.25,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  tecla: {
    width: '30.5%',
    height: 58,
    borderRadius: radios.md,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teclaBorrar: {
    backgroundColor: colores.fondo,
  },
  teclaEntrar: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  teclaInactiva: {
    opacity: 0.45,
  },
  teclaPresionada: {
    backgroundColor: colores.superficieTenue,
  },
  teclaTexto: {
    fontSize: 22,
    fontWeight: '600',
    color: colores.texto,
  },
  teclaTextoAccion: {
    fontSize: 15,
  },
  teclaTextoEntrar: {
    color: colores.blanco,
    fontWeight: '700',
  },
});
