// Selector de fecha por semanas (RF-03).
// Solo deja elegir los días en que el restaurante atiende y aún hay horarios.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colores, TACTIL_MIN } from '../constants/colors';
import { DIAS_MAX_ANTICIPACION } from '../constants/config';
import {
  aISO,
  desdeISO,
  fechaCorta,
  hoyISO,
  INICIALES_LUNES,
  inicioDeSemana,
  mesYAnio,
  sumarDias,
} from '../utils/fechas';

export default function SelectorFecha({ fecha, onCambiar, estaHabilitada }) {
  const hoy = hoyISO();
  const primeraSemana = inicioDeSemana(new Date());
  const ultimaSemana = inicioDeSemana(sumarDias(new Date(), DIAS_MAX_ANTICIPACION));
  // La semana visible sigue a la fecha elegida, salvo que el cliente la mueva con las flechas.
  const [semanaVista, setSemanaVista] = useState(null);
  const semana = semanaVista ?? inicioDeSemana(fecha ? desdeISO(fecha) : new Date());
  const elegir = (iso) => {
    setSemanaVista(null);
    onCambiar(iso);
  };

  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(semana, i));
  const puedeAtras = semana > primeraSemana;
  const puedeAdelante = semana < ultimaSemana;

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <Text style={styles.mes}>{mesYAnio(dias[3])}</Text>
        <View style={styles.flechas}>
          <Pressable
            onPress={() => setSemanaVista(sumarDias(semana, -7))}
            disabled={!puedeAtras}
            style={[styles.flecha, !puedeAtras && styles.inactiva]}
            accessibilityRole="button"
            accessibilityLabel="Semana anterior"
          >
            <Ionicons name="chevron-back" size={18} color={colores.texto} />
          </Pressable>
          <Pressable
            onPress={() => setSemanaVista(sumarDias(semana, 7))}
            disabled={!puedeAdelante}
            style={[styles.flecha, !puedeAdelante && styles.inactiva]}
            accessibilityRole="button"
            accessibilityLabel="Semana siguiente"
          >
            <Ionicons name="chevron-forward" size={18} color={colores.texto} />
          </Pressable>
        </View>
      </View>

      <View style={styles.semana}>
        {dias.map((dia, i) => {
          const iso = aISO(dia);
          const elegido = iso === fecha;
          const habilitado = estaHabilitada(iso);
          return (
            <Pressable
              key={iso}
              onPress={() => elegir(iso)}
              disabled={!habilitado}
              style={styles.dia}
              accessibilityRole="button"
              accessibilityLabel={`${fechaCorta(iso)}${habilitado ? '' : ', sin horarios'}`}
              accessibilityState={{ selected: elegido, disabled: !habilitado }}
            >
              <Text style={styles.inicial}>{INICIALES_LUNES[i]}</Text>
              <View style={[styles.numero, elegido && styles.numeroElegido]}>
                <Text
                  style={[
                    styles.numeroTexto,
                    !habilitado && styles.numeroDeshabilitado,
                    elegido && styles.numeroTextoElegido,
                  ]}
                >
                  {dia.getDate()}
                </Text>
              </View>
              <View style={[styles.punto, iso === hoy && styles.puntoHoy]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: 10,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mes: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
  },
  flechas: {
    flexDirection: 'row',
  },
  flecha: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiva: {
    opacity: 0.25,
  },
  semana: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dia: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    minHeight: TACTIL_MIN,
  },
  inicial: {
    fontSize: 11,
    color: colores.textoTenue,
    fontWeight: '600',
  },
  numero: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroElegido: {
    backgroundColor: colores.primario,
  },
  numeroTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
  },
  numeroDeshabilitado: {
    color: colores.bordeFuerte,
    fontWeight: '400',
  },
  numeroTextoElegido: {
    color: colores.blanco,
  },
  punto: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  puntoHoy: {
    backgroundColor: colores.acento,
  },
});
