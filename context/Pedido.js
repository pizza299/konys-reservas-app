// Pedido en curso del cliente (carrito): los platos que va agregando desde la
// carta antes de enviarlos a la cocina. También recuerda su mesa y nombre para
// el siguiente pedido.
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { MAX_CANTIDAD_PLATO, MAX_NOTA_PLATO } from '../constants/config';

const PedidoContext = createContext(null);

const limitar = (n) => Math.max(1, Math.min(MAX_CANTIDAD_PLATO, n));

export function PedidoProvider({ children }) {
  const [items, setItems] = useState([]);
  const [cliente, setCliente] = useState({ mesaId: null, nombre: '' });

  /** Agrega un plato. Si ya estaba con la misma indicación, suma la cantidad. */
  const agregar = useCallback((plato, cantidad, nota = '') => {
    const notaLimpia = String(nota).trim().slice(0, MAX_NOTA_PLATO);
    setItems((actuales) => {
      const igual = actuales.find((i) => i.platoId === plato.id && i.nota === notaLimpia);
      if (igual) {
        return actuales.map((i) =>
          i === igual ? { ...i, cantidad: limitar(i.cantidad + cantidad) } : i,
        );
      }
      return [
        ...actuales,
        {
          clave: `${plato.id}-${Date.now()}`,
          platoId: plato.id,
          nombre: plato.nombre,
          precio: plato.precio,
          foto_url: plato.foto_url,
          categoria: plato.categoria,
          cantidad: limitar(cantidad),
          nota: notaLimpia,
        },
      ];
    });
  }, []);

  const cambiarCantidad = useCallback((clave, cantidad) => {
    setItems((actuales) =>
      cantidad < 1
        ? actuales.filter((i) => i.clave !== clave)
        : actuales.map((i) => (i.clave === clave ? { ...i, cantidad: limitar(cantidad) } : i)),
    );
  }, []);

  const quitar = useCallback((clave) => {
    setItems((actuales) => actuales.filter((i) => i.clave !== clave));
  }, []);

  const vaciar = useCallback(() => setItems([]), []);

  const valor = useMemo(() => {
    const cantidadTotal = items.reduce((suma, i) => suma + i.cantidad, 0);
    const total = items.reduce((suma, i) => suma + i.precio * i.cantidad, 0);
    const cantidadDe = (platoId) =>
      items.filter((i) => i.platoId === platoId).reduce((suma, i) => suma + i.cantidad, 0);
    return {
      items,
      cantidadTotal,
      total,
      cantidadDe,
      agregar,
      cambiarCantidad,
      quitar,
      vaciar,
      cliente,
      setCliente,
    };
  }, [items, cliente, agregar, cambiarCantidad, quitar, vaciar]);

  return <PedidoContext.Provider value={valor}>{children}</PedidoContext.Provider>;
}

export function usePedido() {
  const contexto = useContext(PedidoContext);
  if (!contexto) throw new Error('usePedido debe usarse dentro de <PedidoProvider>.');
  return contexto;
}
