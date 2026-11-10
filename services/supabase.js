// Cliente de Supabase.
// Las credenciales se leen del archivo .env (ver .env.example).
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const clave = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Si no hay credenciales, la app funciona en "modo demo" con datos locales.
export const supabaseConfigurado = Boolean(url && clave);

export const supabase = supabaseConfigurado
  ? createClient(url, clave, {
      // Los clientes no inician sesión, así que no se guarda sesión de Supabase.
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;
