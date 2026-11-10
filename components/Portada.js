// Portada de Inicio con el estilo del menú de Konys:
// fondo azul petróleo, letras "MENÚ" delineadas al fondo y "KONYS" en naranja
// con una línea crema por dentro de cada trazo.
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { useFonts } from 'expo-font';
import { Montserrat_200ExtraLight } from '@expo-google-fonts/montserrat/200ExtraLight';
import { Montserrat_500Medium } from '@expo-google-fonts/montserrat/500Medium';
import { Montserrat_600SemiBold } from '@expo-google-fonts/montserrat/600SemiBold';
import { radios } from '../constants/colors';

const FONDO = '#032D3D';
const NARANJA = '#F28A0A';
const CREMA = '#FFF1DC';
const LINEA = 'rgba(176, 202, 214, 0.55)';

// Letras grandes del fondo: [letra, x, y, alineación]
const LETRAS_FONDO = [
  ['M', -18, 98, 'start'],
  ['E', 378, 98, 'end'],
  ['N', -18, 302, 'start'],
  ['Ú', 378, 302, 'end'],
];
const PUNTOS = [
  [46, 140],
  [124, 30],
  [300, 60],
  [322, 182],
  [104, 200],
  [252, 206],
];

export default function Portada() {
  const [fuentesListas] = useFonts({
    Montserrat_200ExtraLight,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
  });
  // Mientras cargan las fuentes se usa la del sistema.
  const fuente = (nombre) => (fuentesListas ? nombre : undefined);

  const titulo = {
    x: 180,
    y: 132,
    textAnchor: 'middle',
    fontSize: 64,
    letterSpacing: 4,
    fontFamily: fuente('Montserrat_200ExtraLight'),
    fontWeight: fuentesListas ? undefined : '200',
  };

  return (
    <View
      style={styles.portada}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Konys, la pizza más icónica de la ciudad"
    >
      <Svg width="100%" height="100%" viewBox="0 0 360 230">
        {LETRAS_FONDO.map(([letra, x, y, alineacion]) => (
          <SvgText
            key={letra}
            x={x}
            y={y}
            textAnchor={alineacion}
            fontSize={150}
            fontFamily={fuente('Montserrat_500Medium')}
            fill="none"
            stroke={LINEA}
            strokeWidth={1}
          >
            {letra}
          </SvgText>
        ))}
        {PUNTOS.map(([cx, cy]) => (
          <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.8} fill="none" stroke={LINEA} strokeWidth={1} />
        ))}

        {/* KONYS: trazo naranja ancho + la letra fina en crema encima = línea interior */}
        <SvgText
          {...titulo}
          fill={NARANJA}
          stroke={NARANJA}
          strokeWidth={11}
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          KONYS
        </SvgText>
        <SvgText {...titulo} fill={CREMA}>
          KONYS
        </SvgText>

        <SvgText
          x={180}
          y={166}
          textAnchor="middle"
          fontSize={10}
          letterSpacing={1.1}
          fontFamily={fuente('Montserrat_600SemiBold')}
          fontWeight={fuentesListas ? undefined : '600'}
          fill="#FFFFFF"
        >
          · LA PIZZA MÁS IKÓNICA DE LA CIUDAD ·
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  portada: {
    width: '100%',
    aspectRatio: 360 / 230,
    backgroundColor: FONDO,
    borderRadius: radios.xl,
    overflow: 'hidden',
  },
});
