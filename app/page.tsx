import HomeClient from "@/components/HomeClient";
import { getTalentos, getEquipo } from "@/lib/queries";
import { parseNum } from "@/lib/data";

// Revalida los datos del roster/equipo cada 5 minutos (ISR).
export const revalidate = 300;

export default async function HomePage() {
  const [talentos, equipo] = await Promise.all([getTalentos(), getEquipo()]);

  const reach = talentos.reduce(
    (acc, t) => acc + (t.plataformas || []).reduce((a, p) => a + parseNum(p.seguidores), 0),
    0
  );

  return <HomeClient talentos={talentos} equipo={equipo} reach={reach} />;
}
