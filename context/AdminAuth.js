// Sesión del administrador (RF-08).
// El panel se protege con un PIN y la sesión se recuerda en el celular con
// AsyncStorage durante unas horas, para no pedir el PIN a cada rato.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HORAS_SESION_ADMIN, PIN_ADMIN } from '../constants/config';

const CLAVE_SESION = 'konys-admin-sesion';
const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [esAdmin, setEsAdmin] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Al abrir la app, revisa si hay una sesión guardada que no haya vencido.
  useEffect(() => {
    (async () => {
      try {
        const guardada = await AsyncStorage.getItem(CLAVE_SESION);
        if (guardada) {
          const { expira } = JSON.parse(guardada);
          if (expira > Date.now()) setEsAdmin(true);
          else await AsyncStorage.removeItem(CLAVE_SESION);
        }
      } catch {
        // Sin acceso al almacenamiento: se pedirá el PIN.
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const ingresar = useCallback(async (pin) => {
    if (pin !== PIN_ADMIN) return false;
    setEsAdmin(true);
    try {
      const expira = Date.now() + HORAS_SESION_ADMIN * 60 * 60 * 1000;
      await AsyncStorage.setItem(CLAVE_SESION, JSON.stringify({ expira }));
    } catch {
      // La sesión sigue activa mientras la app esté abierta.
    }
    return true;
  }, []);

  const cerrarSesion = useCallback(async () => {
    setEsAdmin(false);
    try {
      await AsyncStorage.removeItem(CLAVE_SESION);
    } catch {
      // Nada que hacer.
    }
  }, []);

  const valor = useMemo(
    () => ({ esAdmin, cargando, ingresar, cerrarSesion }),
    [esAdmin, cargando, ingresar, cerrarSesion],
  );

  return <AdminAuthContext.Provider value={valor}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const contexto = useContext(AdminAuthContext);
  if (!contexto) throw new Error('useAdminAuth debe usarse dentro de AdminAuthProvider');
  return contexto;
}
