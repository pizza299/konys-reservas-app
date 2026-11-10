// Muestra la foto de una mesa o plato; si no hay foto (o falla), un marcador con ícono.
// Acepta enlaces https:// y fotos incluidas en la app ("local:<nombre>").
//
// El tamaño lo define el contenedor (estilo) y la imagen lo llena por completo:
// así funciona igual con fotos de internet y con fotos locales (que traen su
// propio tamaño y, si no, ignorarían el aspectRatio).
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colores } from '../../constants/colors';
import { fuenteDeFoto } from '../../constants/fotosLocales';

export default function Foto({ uri, icono = 'image-outline', estilo, tamanoIcono = 30 }) {
  const [fallo, setFallo] = useState(false);
  const fuente = fuenteDeFoto(uri);
  const conFoto = fuente && !fallo;
  return (
    <View style={[styles.base, !conFoto && styles.marcador, estilo]}>
      {conFoto ? (
        <Image
          source={fuente}
          style={styles.imagen}
          resizeMode="cover"
          onError={() => setFallo(true)}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Ionicons name={icono} size={tamanoIcono} color={colores.bordeFuerte} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colores.superficieTenue,
    overflow: 'hidden',
  },
  marcador: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagen: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
});
