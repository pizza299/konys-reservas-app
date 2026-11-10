// Hook para cargar datos de Supabase en una pantalla.
// - Carga al abrir la pantalla y cada vez que vuelve a estar en foco.
// - Si cambian las dependencias (por ejemplo la fecha), muestra "cargando".
// - Ignora respuestas viejas si llegan después de una más nueva.
import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

export function useDatos(cargar, dependencias = []) {
  const [estado, setEstado] = useState({
    datos: null,
    error: null,
    cargando: true,
    refrescando: false,
  });
  const cargarRef = useRef(cargar);
  cargarRef.current = cargar;
  const turno = useRef(0);
  const claveCargada = useRef(null);
  const clave = JSON.stringify(dependencias);

  const ejecutar = useCallback(async (modo, claveActual) => {
    const miTurno = ++turno.current;
    setEstado((previo) => ({
      datos: modo === 'inicial' ? null : previo.datos,
      error: modo === 'inicial' ? null : previo.error,
      cargando: modo === 'inicial',
      refrescando: modo === 'refresco',
    }));
    try {
      const datos = await cargarRef.current();
      if (miTurno !== turno.current) return;
      claveCargada.current = claveActual;
      setEstado({ datos, error: null, cargando: false, refrescando: false });
    } catch (error) {
      if (miTurno !== turno.current) return;
      setEstado((previo) => ({ ...previo, error, cargando: false, refrescando: false }));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Primera carga o cambio de filtros: "inicial". Volver a la pantalla: silencioso.
      ejecutar(claveCargada.current === clave ? 'silencioso' : 'inicial', clave);
    }, [ejecutar, clave]),
  );

  const recargar = useCallback(() => ejecutar('refresco', clave), [ejecutar, clave]);
  const recargarSilencioso = useCallback(() => ejecutar('silencioso', clave), [ejecutar, clave]);

  return { ...estado, recargar, recargarSilencioso };
}
