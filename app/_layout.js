// Layout raíz: navegación en pila sobre las pestañas.
// (tabs) → reservar/[mesaId] → reservar/datos → confirmacion
// (tabs)/carta → pedido → pedido-enviado · y la carta del panel admin.
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AdminAuthProvider } from '../context/AdminAuth';
import { PedidoProvider } from '../context/Pedido';
import { colores } from '../constants/colors';

export default function LayoutRaiz() {
  return (
    <SafeAreaProvider>
      <AdminAuthProvider>
        <PedidoProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colores.fondo },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="reservar/[mesaId]" />
            <Stack.Screen name="reservar/datos" />
            <Stack.Screen name="confirmacion" options={{ gestureEnabled: false }} />
            <Stack.Screen name="pedido" />
            <Stack.Screen name="pedido-enviado" options={{ gestureEnabled: false }} />
            <Stack.Screen name="admin-carta" />
          </Stack>
        </PedidoProvider>
      </AdminAuthProvider>
    </SafeAreaProvider>
  );
}
