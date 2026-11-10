// Formulario "Nueva mesa" / "Editar mesa" (RF-09).
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import HojaModal from '../ui/HojaModal';
import Campo from '../ui/Campo';
import Chip from '../ui/Chip';
import Contador from '../ui/Contador';
import Boton from '../ui/Boton';
import { CAPACIDAD_MAXIMA, actualizarMesa, crearMesa, validarMesa } from '../../services/mesas';
import { colores } from '../../constants/colors';
import { ZONAS } from '../../constants/config';

const VACIA = { nombre: '', zona: 'salon', capacidad: 4, foto_url: '' };

export default function FormMesa({ visible, mesa, onCerrar, onGuardada }) {
  const [datos, setDatos] = useState(VACIA);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Cada vez que se abre, carga los datos de la mesa (o deja el formulario limpio).
  const apertura = visible ? mesa || 'nueva' : null;
  const [aperturaPrevia, setAperturaPrevia] = useState(null);
  if (apertura !== aperturaPrevia) {
    setAperturaPrevia(apertura);
    if (visible) {
      setDatos(mesa ? { ...mesa, foto_url: mesa.foto_url || '' } : VACIA);
      setError(null);
    }
  }

  const cambiar = (campo, valor) => setDatos((d) => ({ ...d, [campo]: valor }));

  const guardar = async () => {
    const problema = validarMesa(datos);
    if (problema) {
      setError(problema);
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      if (mesa) await actualizarMesa(mesa.id, datos);
      else await crearMesa(datos);
      onGuardada();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <HojaModal
      visible={visible}
      titulo={mesa ? `Editar ${mesa.nombre}` : 'Nueva mesa'}
      onCerrar={onCerrar}
      pie={<Boton titulo={mesa ? 'Guardar cambios' : 'Crear mesa'} onPress={guardar} cargando={guardando} />}
    >
      <Campo
        etiqueta="Nombre o número"
        placeholder="Ej: Mesa 7"
        value={datos.nombre}
        onChangeText={(v) => cambiar('nombre', v)}
        maxLength={40}
        autoFocus={!mesa}
      />
      <View style={styles.grupo}>
        <Text style={styles.etiqueta}>Zona</Text>
        <View style={styles.chips}>
          {ZONAS.map((z) => (
            <Chip
              key={z.valor}
              etiqueta={z.etiqueta}
              activo={datos.zona === z.valor}
              onPress={() => cambiar('zona', z.valor)}
            />
          ))}
        </View>
      </View>
      <Contador
        etiqueta="Capacidad (personas)"
        valor={Number(datos.capacidad)}
        min={1}
        max={CAPACIDAD_MAXIMA}
        onCambiar={(v) => cambiar('capacidad', v)}
      />
      <Campo
        etiqueta="Foto (opcional)"
        placeholder="https://…"
        value={datos.foto_url}
        onChangeText={(v) => cambiar('foto_url', v)}
        autoCapitalize="none"
        keyboardType="url"
        ayuda="Enlace a una imagen de la mesa o de su zona."
      />
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
    gap: 8,
  },
  error: {
    fontSize: 13,
    color: colores.error,
  },
});
