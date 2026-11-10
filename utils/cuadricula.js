// Ayuda para las cuadrículas con FlatList (numColumns).
// Completa la última fila con celdas vacías para que todas las tarjetas
// tengan el mismo ancho aunque la fila quede incompleta.

export function completarFilas(datos, columnas) {
  const sobrantes = datos.length % columnas;
  if (sobrantes === 0) return datos;
  const relleno = Array.from({ length: columnas - sobrantes }, (_, i) => ({
    id: `relleno-${i}`,
    relleno: true,
  }));
  return [...datos, ...relleno];
}
