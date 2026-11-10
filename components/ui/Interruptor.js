// Interruptor (Switch) con los colores de la app en Android, iOS y web.
import { Platform, Switch } from 'react-native';
import { colores } from '../../constants/colors';

export default function Interruptor({ valor, onCambiar, deshabilitado, etiqueta }) {
  return (
    <Switch
      value={valor}
      onValueChange={onCambiar}
      disabled={deshabilitado}
      trackColor={{ false: colores.bordeFuerte, true: colores.primario }}
      thumbColor={colores.blanco}
      ios_backgroundColor={colores.bordeFuerte}
      accessibilityLabel={etiqueta}
      // Propiedad solo de react-native-web (en web el círculo activo es verde por defecto).
      {...(Platform.OS === 'web' ? { activeThumbColor: colores.blanco } : null)}
    />
  );
}
