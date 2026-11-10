// Hoja inferior (bottom sheet) para formularios y detalles.
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colores, radios, TACTIL_MIN } from '../../constants/colors';

export default function HojaModal({ visible, titulo, onCerrar, children, pie }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <KeyboardAvoidingView
        style={styles.raiz}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.fondo} onPress={onCerrar} accessibilityLabel="Cerrar" />
        <View style={[styles.hoja, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.agarre} />
          <View style={styles.encabezado}>
            <Text style={styles.titulo} numberOfLines={1}>
              {titulo}
            </Text>
            <Pressable
              onPress={onCerrar}
              style={styles.cerrar}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              hitSlop={8}
            >
              <Ionicons name="close" size={22} color={colores.texto} />
            </Pressable>
          </View>
          <ScrollView
            style={styles.cuerpo}
            contentContainerStyle={styles.cuerpoContenido}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
          {pie ? <View style={styles.pie}>{pie}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  raiz: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  fondo: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 25, 35, 0.45)',
  },
  hoja: {
    backgroundColor: colores.fondo,
    borderTopLeftRadius: radios.xl,
    borderTopRightRadius: radios.xl,
    maxHeight: '90%',
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  agarre: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colores.bordeFuerte,
    marginTop: 8,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 6,
  },
  titulo: {
    flex: 1,
    fontSize: 19,
    fontWeight: '800',
    color: colores.texto,
  },
  cerrar: {
    width: TACTIL_MIN,
    height: TACTIL_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cuerpo: {
    flexGrow: 0,
  },
  cuerpoContenido: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 16,
  },
  pie: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 8,
  },
});
