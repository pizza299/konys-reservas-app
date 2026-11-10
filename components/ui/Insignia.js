import { StyleSheet, Text, View } from 'react-native';
import { colores, radios } from '../../constants/colors';

// Estilos de las insignias de estado (mesas y reservas).
const VARIANTES = {
  libre: { fondo: colores.libreFondo, borde: colores.libreFondo, texto: colores.libre },
  llena: { fondo: colores.superficieTenue, borde: colores.superficieTenue, texto: colores.textoSuave },
  sin_turnos: { fondo: colores.superficieTenue, borde: colores.superficieTenue, texto: colores.textoSuave },
  confirmada: { fondo: colores.primario, borde: colores.primario, texto: colores.blanco },
  completada: { fondo: colores.superficieTenue, borde: colores.superficieTenue, texto: colores.textoSuave },
  cancelada: { fondo: colores.superficie, borde: colores.bordeFuerte, texto: colores.textoTenue },
  activa: { fondo: colores.libreFondo, borde: colores.libreFondo, texto: colores.libre },
  inactiva: { fondo: colores.superficieTenue, borde: colores.superficieTenue, texto: colores.textoSuave },
  acento: { fondo: colores.acentoSuave, borde: colores.acentoSuave, texto: colores.acentoTexto },
};

export default function Insignia({ texto, variante = 'llena' }) {
  const v = VARIANTES[variante] || VARIANTES.llena;
  return (
    <View style={[styles.insignia, { backgroundColor: v.fondo, borderColor: v.borde }]}>
      <Text style={[styles.texto, { color: v.texto }]} numberOfLines={1}>
        {texto}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  insignia: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radios.pildora,
    borderWidth: 1,
  },
  texto: {
    fontSize: 12,
    fontWeight: '700',
  },
});
