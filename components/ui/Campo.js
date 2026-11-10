import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colores, radios } from '../../constants/colors';

/**
 * Campo de texto con etiqueta.
 * estilo 'linea' = subrayado (formulario de reserva), 'caja' = con borde (admin).
 */
export default function Campo({
  etiqueta,
  ayuda,
  error,
  tipo = 'caja',
  multilinea = false,
  ...props
}) {
  return (
    <View style={styles.contenedor}>
      {etiqueta ? <Text style={styles.etiqueta}>{etiqueta}</Text> : null}
      <TextInput
        placeholderTextColor={colores.textoTenue}
        multiline={multilinea}
        style={[
          tipo === 'linea' ? styles.linea : styles.caja,
          multilinea && styles.multilinea,
          error && styles.conError,
        ]}
        accessibilityLabel={etiqueta || props.placeholder}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!error && ayuda ? <Text style={styles.ayuda}>{ayuda}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: 6,
  },
  etiqueta: {
    fontSize: 13,
    fontWeight: '600',
    color: colores.textoSuave,
  },
  caja: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: colores.texto,
    backgroundColor: colores.superficie,
  },
  linea: {
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: colores.bordeFuerte,
    paddingHorizontal: 2,
    fontSize: 16,
    color: colores.texto,
  },
  multilinea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  conError: {
    borderColor: colores.error,
    borderBottomColor: colores.error,
  },
  error: {
    fontSize: 12,
    color: colores.error,
  },
  ayuda: {
    fontSize: 12,
    color: colores.textoTenue,
  },
});
