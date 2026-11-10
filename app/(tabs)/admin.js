// Pestaña Admin (RF-08): pide el PIN y, si es correcto, muestra el panel.
import { useAdminAuth } from '../../context/AdminAuth';
import IngresoPin from '../../components/admin/IngresoPin';
import PanelAdmin from '../../components/admin/PanelAdmin';
import { Cargando } from '../../components/ui/Estados';

export default function Admin() {
  const { esAdmin, cargando } = useAdminAuth();
  if (cargando) return <Cargando />;
  return esAdmin ? <PanelAdmin /> : <IngresoPin />;
}
