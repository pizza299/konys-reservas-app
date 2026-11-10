// Layout raíz: navegación en pila sobre las pestañas.
// (tabs) → reservar/[mesaId] → confirmacion · y la carta del panel admin.
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AdminAuthProvider } from '../context/AdminAuth';
import { colores } from '../constants/colors';

export default function LayoutRaiz() {
  return (
    <SafeAreaProvider>
      <AdminAuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colores.fondo },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="reservar/[mesaId]" />
          <Stack.Screen name="confirmacion" options={{ gestureEnabled: false }} />
          <Stack.Screen name="admin-carta" />
        </Stack>
      </AdminAuthProvider>
    </SafeAreaProvider>
  );
}
