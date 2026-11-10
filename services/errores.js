// Convierte los errores técnicos (red, Supabase, Postgres) en mensajes claros
// para el usuario (requisito RNF-09: manejo de conexión).

export class ErrorApp extends Error {
  constructor(mensaje, { codigo = 'GENERAL', original = null } = {}) {
    super(mensaje);
    this.name = 'ErrorApp';
    this.codigo = codigo;
    this.original = original;
  }
}

export const MENSAJE_SIN_CONEXION =
  'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.';

export function normalizarError(error) {
  if (error instanceof ErrorApp) return error;

  const mensaje = String(error?.message || error || '');
  const codigo = error?.code;

  if (/network|fetch|timeout|internet|load failed|ECONN|ENOTFOUND/i.test(mensaje)) {
    return new ErrorApp(MENSAJE_SIN_CONEXION, { codigo: 'SIN_CONEXION', original: error });
  }
  // Violación del índice único: alguien tomó ese horario primero.
  if (codigo === '23505') {
    return new ErrorApp(
      'Ese horario acaba de ser reservado por otra persona. Elige otro, por favor.',
      { codigo: 'DUPLICADO', original: error },
    );
  }
  // Errores lanzados a propósito por los triggers de la base de datos.
  if (codigo === 'P0001') {
    return new ErrorApp(mensaje, { codigo: 'VALIDACION', original: error });
  }
  // Un dato no cumple las reglas de la tabla (por ejemplo, precio o categoría inválidos).
  if (codigo === '23514') {
    return new ErrorApp('Algún dato no es válido. Revisa el formulario e inténtalo de nuevo.', {
      codigo: 'VALIDACION',
      original: error,
    });
  }
  if (codigo === '42501') {
    return new ErrorApp(
      'La base de datos rechazó la operación. Revisa las políticas RLS en Supabase.',
      { codigo: 'PERMISO', original: error },
    );
  }
  if (codigo === 'PGRST116') {
    return new ErrorApp(
      'No se encontró el registro o no hay permiso para modificarlo.',
      { codigo: 'NO_ENCONTRADO', original: error },
    );
  }
  if (codigo === '42P01' || codigo === 'PGRST205') {
    return new ErrorApp(
      'Faltan las tablas en Supabase. Ejecuta el archivo supabase/schema.sql.',
      { codigo: 'SIN_TABLAS', original: error },
    );
  }
  return new ErrorApp(
    'Ocurrió un problema al comunicarse con la base de datos. Inténtalo de nuevo.',
    { codigo: codigo || 'GENERAL', original: error },
  );
}
