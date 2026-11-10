// Formulario "Nuevo plato" / "Editar plato" (RF-14).
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import HojaModal from '../ui/HojaModal';
import Interruptor from '../ui/Interruptor';
import Campo from '../ui/Campo';
import Chip from '../ui/Chip';
import Boton from '../ui/Boton';
import { actualizarPlato, crearPlato, validarPlato } from '../../services/platos';
import { colores } from '../../constants/colors';
import { CATEGORIAS } from '../../constants/config';
import { formatearPrecio, porcentajeDescuento, soloDigitos } from '../../utils/formato';

const VACIO = {
  nombre: '',
  categoria: 'pizzas',
  descripcion: '',
  precio: '',
  precio_anterior: '',
  disponible: true,
  foto_url: '',
};

export default function FormPlato({ visible, plato, categoriaInicial, onCerrar, onGuardado }) {
  const [datos, setDatos] = useState(VACIO);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Cada vez que se abre, carga los datos del plato (o deja el formulario limpio).
  const apertura = visible ? plato || `nuevo-${categoriaInicial}` : null;
  const [aperturaPrevia, setAperturaPrevia] = useState(null);
  if (apertura !== aperturaPrevia) {
    setAperturaPrevia(apertura);
    if (visible) {
      setDatos(
        plato
          ? {
              ...plato,
              descripcion: plato.descripcion || '',
              precio: String(plato.precio),
              precio_anterior: plato.precio_anterior ? String(plato.precio_anterior) : '',
              foto_url: plato.foto_url || '',
            }
          : { ...VACIO, categoria: categoriaInicial || 'pizzas' },
      );
      setError(null);
    }
  }

  const cambiar = (campo, valor) => setDatos((d) => ({ ...d, [campo]: valor }));
  const descuento = porcentajeDescuento({
    precio: Number(datos.precio),
    precio_anterior: Number(datos.precio_anterior),
  });

  const guardar = async () => {
    const problema = validarPlato(datos);
    if (problema) {
      setError(problema);
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      if (plato) await actualizarPlato(plato.id, datos);
      else await crearPlato(datos);
      onGuardado();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <HojaModal
      visible={visible}
      titulo={plato ? 'Editar plato' : 'Nuevo plato'}
      onCerrar={onCerrar}
      pie={<Boton titulo={plato ? 'Guardar cambios' : 'Agregar a la carta'} onPress={guardar} cargando={guardando} />}
    >
      <Campo
        etiqueta="Nombre"
        placeholder="Ej: Pizza Konys Especial"
        value={datos.nombre}
        onChangeText={(v) => cambiar('nombre', v)}
        maxLength={60}
      />
      <View style={styles.grupo}>
        <Text style={styles.etiqueta}>Categoría</Text>
        <View style={styles.chips}>
          {CATEGORIAS.map((c) => (
            <Chip
              key={c.valor}
              etiqueta={c.etiqueta}
              icono={c.icono}
              activo={datos.categoria === c.valor}
              onPress={() => cambiar('categoria', c.valor)}
            />
          ))}
        </View>
      </View>
      <Campo
        etiqueta="Descripción"
        placeholder="Ingredientes o detalles del plato"
        value={datos.descripcion}
        onChangeText={(v) => cambiar('descripcion', v)}
        multilinea
        maxLength={200}
      />
      <Campo
        etiqueta="Precio (COP)"
        placeholder="Ej: 38000"
        value={datos.precio}
        onChangeText={(v) => cambiar('precio', soloDigitos(v))}
        keyboardType="number-pad"
        maxLength={8}
        ayuda={datos.precio ? `Se mostrará como ${formatearPrecio(datos.precio)}` : undefined}
      />
      <Campo
        etiqueta="Precio antes del descuento (opcional)"
        placeholder="Ej: 39900"
        value={datos.precio_anterior}
        onChangeText={(v) => cambiar('precio_anterior', soloDigitos(v))}
        keyboardType="number-pad"
        maxLength={8}
        ayuda={
          descuento
            ? `Se mostrará en promoción: -${descuento}% (antes ${formatearPrecio(datos.precio_anterior)})`
            : 'Déjalo vacío si el plato no tiene descuento.'
        }
      />
      <Campo
        etiqueta="Foto (opcional)"
        placeholder="https://…"
        value={datos.foto_url}
        onChangeText={(v) => cambiar('foto_url', v)}
        autoCapitalize="none"
        keyboardType="url"
        ayuda={
          datos.foto_url?.startsWith('local:')
            ? 'Foto incluida en la app. Puedes reemplazarla pegando un enlace https://…'
            : 'Enlace a una imagen del plato.'
        }
      />
      <View style={styles.fila}>
        <View style={styles.flex}>
          <Text style={styles.filaTitulo}>Disponible</Text>
          <Text style={styles.filaAyuda}>Si lo apagas, el plato se oculta de la carta.</Text>
        </View>
        <Interruptor
          valor={datos.disponible}
          onCambiar={(v) => cambiar('disponible', v)}
          etiqueta="Disponible"
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </HojaModal>
  );
}

const styles = StyleSheet.create({
  grupo: {
    gap: 8,
  },
  etiqueta: {
    fontSize: 13,
    fontWeight: '600',
    color: colores.textoSuave,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  filaTitulo: {
    fontSize: 15,
    fontWeight: '600',
    color: colores.texto,
  },
  filaAyuda: {
    fontSize: 12,
    color: colores.textoSuave,
  },
  error: {
    fontSize: 13,
    color: colores.error,
  },
});
