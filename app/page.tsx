import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Servicios from "@/components/Servicios";
import Roster from "@/components/Roster";
import Nosotros from "@/components/Nosotros";
import Unete from "@/components/Unete";
import Contacto from "@/components/Contacto";
import Footer from "@/components/Footer";
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

  return (
    <>
      <Nav />
      <Hero reach={reach} />
      <Marquee />
      <Servicios />
      <Roster talentos={talentos} />
      <Nosotros equipo={equipo} />
      <Unete />
      <Contacto />
      <Footer />
    </>
  );
}
