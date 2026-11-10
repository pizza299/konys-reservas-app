// Diálogos de confirmación que funcionan igual en Android, iOS y web.
import { Alert, Platform } from 'react-native';

/**
 * Muestra un diálogo de confirmación y devuelve una promesa con true/false.
 */
export function confirmar(titulo, mensaje, textoConfirmar = 'Aceptar') {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    return Promise.resolve(window.confirm(`${titulo}\n\n${mensaje}`));
  }
  return new Promise((resolver) => {
    Alert.alert(
      titulo,
      mensaje,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolver(false) },
        { text: textoConfirmar, style: 'destructive', onPress: () => resolver(true) },
      ],
      { cancelable: true, onDismiss: () => resolver(false) },
    );
  });
}

/** Aviso simple con un solo botón. */
export function avisar(titulo, mensaje) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    window.alert(`${titulo}\n\n${mensaje}`);
    return;
  }
  Alert.alert(titulo, mensaje);
}
