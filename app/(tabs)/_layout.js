// Pestañas inferiores: Inicio, Carta y Admin.
import { Tabs } from 'expo-router/js-tabs';
import BarraPildora from '../../components/BarraPildora';
import { useAdminAuth } from '../../context/AdminAuth';
import { colores } from '../../constants/colors';

const PESTANAS = [
  { clave: 'index', etiqueta: 'Inicio', icono: 'home' },
  { clave: 'carta', etiqueta: 'Carta', icono: 'restaurant' },
  { clave: 'admin', etiqueta: 'Admin', icono: 'lock-closed' },
];

function BarraPestanas({ state, emitter, navigateToTab }) {
  const { esAdmin } = useAdminAuth();
  const rutaActual = state.routes[state.index];

  // Dentro del panel de administración se muestra la barra propia del panel.
  if (rutaActual.name === 'admin' && esAdmin) return null;

  const seleccionar = (clave) => {
    const ruta = state.routes.find((r) => r.name === clave);
    if (!ruta) return;
    const evento = emitter.emit({ type: 'tabPress', target: ruta.key, canPreventDefault: true });
    if (ruta.key !== rutaActual.key && !evento.defaultPrevented) {
      navigateToTab(ruta.key);
    }
  };

  return <BarraPildora items={PESTANAS} activo={rutaActual.name} onSeleccionar={seleccionar} />;
}

export default function LayoutPestanas() {
  return (
    <Tabs
      tabBar={(props) => <BarraPestanas {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colores.fondo },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="carta" options={{ title: 'Carta' }} />
      <Tabs.Screen name="admin" options={{ title: 'Admin' }} />
    </Tabs>
  );
}
