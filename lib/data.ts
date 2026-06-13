// Contenido estático del sitio (no vive en Supabase): marcas, servicios,
// valores y resultados de campañas. Extraído del index.html original.

export const WA = "525548418158"; // WhatsApp MOVDI: +52 55 4841 8158
export function waLink(txt: string) {
  return "https://wa.me/" + WA + "?text=" + encodeURIComponent(txt);
}

export const BRANDS = [
  "Amazon", "Gotrendier", "Yakampot", "Fashion Nova", "Pandora", "Heineken",
  "Silicare", "YouTube", "L'Oréal", "Nestlé", "Pepsi", "Calvin Klein", "Ring",
  "VISA", "BAC", "Rappi", "Duolingo", "Crunchyroll", "Coca-Cola", "Liverpool",
  "DiDi", "PUBG",
];

export const CATEGORIAS = [
  "Arte", "Belleza", "Comedia", "Cosplay", "Educación", "Entretenimiento",
  "Familia", "Fitness", "Foodies", "Gaming", "Geek", "Lifestyle", "Moda",
  "Motivación", "Tecnología", "Viajes", "Wellness",
];

export const PLATAFORMAS = ["TikTok", "Instagram", "YouTube", "Twitch"];

export interface ServiceProject {
  name: string;
  desc: string;
  img: string;
  link: string;
}
export interface Service {
  id: string;
  ico: string;
  title: string;
  desc: string;
  body: string;
  projects: ServiceProject[];
}

export const SERVICES: Service[] = [
  {
    id: "imkt", ico: "▣▣", title: "Influencer Marketing / UGC",
    desc: "Estrategias no convencionales para generar conversiones, posicionamiento y visibilidad.",
    body: "No llegamos al influencer marketing porque está de moda. Llegamos porque llevamos años dentro del ecosistema, conocemos a los creadores y sus comunidades.",
    projects: [
      { name: "Pepsi Black", desc: "Ayudamos a Pepsi Black a dar a conocer a su nueva embajadora junto a influencers lifestyle y músicos en un evento inmersivo y experiencial.", img: "https://res.cloudinary.com/duy1hjauz/image/upload/v1778272869/pepsi_ayug3c.png", link: "https://www.instagram.com/p/DMgoN-PMWtx/" },
      { name: "Nestlé Chocotrio", desc: "Creamos la estrategia de Chocotrio para Nestlé México, activando influencers foodie y lifestyle en un evento inmersivo del universo del chocolate.", img: "https://res.cloudinary.com/duy1hjauz/image/upload/v1778272896/chocotrio_fn4maq.png", link: "https://www.instagram.com/reels/DHoOLKfRiN_/" },
      { name: "Calvin Klein × Bad Bunny", desc: "Desarrollamos la estrategia de Calvin Klein para impulsar la compra de underwear con influencers mostrando la experiencia y el incentivo del poster de Bad Bunny.", img: "https://res.cloudinary.com/duy1hjauz/image/upload/v1778272902/ck_ildrcp.png", link: "https://vt.tiktok.com/ZS9VCLEe4/" },
      { name: "Ring Amazon", desc: "Posicionamos Ring como parte de la vida diaria con una estrategia UGC en TikTok centrada en storytelling, humor y momentos cotidianos.", img: "https://res.cloudinary.com/duy1hjauz/image/upload/v1778272900/amazon_fbszsd.png", link: "https://www.tiktok.com/@ringmexico/video/7607983197149744395" },
    ],
  },
  {
    id: "gaming", ico: "▲", title: "We Speak Gaming",
    desc: "No llegamos al gaming porque está de moda. Llevamos años trabajando dentro del ecosistema gaming, geek y tech.",
    body: "Conectamos marcas con comunidades gaming reales. Sabemos distinguir lo auténtico de lo forzado.",
    projects: [
      { name: "DiDi Card League", desc: "Impulsamos el uso de la tarjeta DiDi Card dentro del mundo gamer, dando vida al primer torneo DiDi Card League.", img: "https://res.cloudinary.com/duy1hjauz/image/upload/v1778272880/didi_brdvql.png", link: "https://www.instagram.com/reel/DSV0L6rElr6/" },
      { name: "Agentes en Ascenso · VISA & BAC", desc: "Torneo internacional en colaboración con VISA y BAC, impulsando talento de Guatemala, Costa Rica y México. La gran final con la participación de Soy Pan.", img: "https://res.cloudinary.com/duy1hjauz/image/upload/v1778272864/gaming_bac_a4kmhh.png", link: "https://www.instagram.com/reels/DOuJneajatr/" },
      { name: "CCXP 2026", desc: "MOVDI presente en CCXP con grandes marcas y creadores como Rodezel, Renrize, Oscar Amaury y Sin6, generando alta interacción con sus comunidades.", img: "https://res.cloudinary.com/duy1hjauz/image/upload/v1778272907/ccxp_n1qicj.png", link: "https://www.instagram.com/p/DXlJuZyDGnz/" },
    ],
  },
  {
    id: "socialmedia", ico: "◉◉", title: "Social Media & Consultoría Estratégica",
    desc: "Creamos presencia, no solo contenido. Diseñamos estrategias para las plataformas correctas.",
    body: "Entendemos el ecosistema digital antes de actuar. Definimos dónde estar, cómo hablar y con quién conectar.",
    projects: [
      { name: "Pina Cosmetic", desc: "Creamos la tienda online y las redes desde cero. Estrategia de marketing digital combinada con creación de contenido y reportes de KPIs.", img: "https://res.cloudinary.com/duy1hjauz/image/upload/v1778272898/pina_qkqh8j.png", link: "#" },
      { name: "Xiomara", desc: "Diseñamos y gestionamos la estrategia de marketing digital, creación de contenido (reels, stories, lives y shootings) y operación de ecommerce.", img: "https://res.cloudinary.com/duy1hjauz/image/upload/v1778272899/xiomara_bhuu1h.png", link: "https://xiomaraprofesional.com.mx/" },
      { name: "Creators Quest by Fede Vigevani", desc: "Diseñamos un curso online de verano para niñas y niños junto a Fede Vigevani: concepto, branding y ecosistema digital para alcance y conversión.", img: "https://res.cloudinary.com/duy1hjauz/image/upload/v1778272863/creators_qg1q9g.png", link: "https://www.creators-quest.com/" },
    ],
  },
  {
    id: "webdesign", ico: "⬤▲", title: "Web Design",
    desc: "Sitios web atractivos y funcionales que reflejan la esencia de tu marca.",
    body: "No hacemos plantillas. Diseñamos experiencias digitales únicas que convierten visitantes en clientes.",
    projects: [
      { name: "Durobu", desc: "E-commerce de skincare coreano y japonés construido desde cero, pensado para reflejar visual y estratégicamente la identidad de la marca.", img: "https://res.cloudinary.com/duy1hjauz/image/upload/v1778272886/durobu_wowk7w.png", link: "https://www.durobu.com" },
      { name: "NO NAME Industries", desc: "Migramos y rediseñamos el sitio para transformar la experiencia en algo más claro, ágil y mobile-first.", img: "https://res.cloudinary.com/duy1hjauz/image/upload/v1778272866/noname_ch2aey.png", link: "https://www.nonameindustries.mx" },
      { name: "Amkie Gamus", desc: "E-commerce de haute couture construido desde cero, transformando una marca de desfiles en una experiencia digital.", img: "https://res.cloudinary.com/duy1hjauz/image/upload/v1778272873/amkie_jxgupp.png", link: "https://amkiegamus.com" },
      { name: "Cerveza Ruth", desc: "Tienda online para llevar cerveza artesanal a nuevos mercados fuera de CDMX, unificando el universo visual de la marca.", img: "https://res.cloudinary.com/duy1hjauz/image/upload/v1778272902/ruth_rcotdf.png", link: "https://www.ruth.mx" },
    ],
  },
  {
    id: "data", ico: "∧", title: "Data Driven",
    desc: "Decisiones basadas en métricas clave que impulsan resultados medibles.",
    body: "Utilizamos datos para optimizar cada estrategia. Reportes claros, métricas que importan, decisiones basadas en información real.",
    projects: [],
  },
  {
    id: "branding", ico: "▲", title: "Branding",
    desc: "Identidades únicas con coherencia y autenticidad que conectan con tu audiencia.",
    body: "Creamos identidades únicas que conectan con tu audiencia, asegurando que tu negocio destaque con coherencia en todos los puntos de contacto digitales.",
    projects: [],
  },
];

export const VALUES: [string, string, string][] = [
  ["01", "Humanidad", "Trabajamos con humanos, para humanos."],
  ["02", "Impacto", "Rastreamos y analizamos cada KPI."],
  ["03", "Creatividad", "Campañas auténticas que generan movimiento real."],
  ["04", "Cercanía", "Conexiones sociales genuinas desde adentro."],
  ["05", "Experiencia", "+5 años y +1500 proyectos en el ecosistema digital MX."],
  ["06", "Estrategia", "Datos y métricas en cada decisión creativa."],
];

export interface ResultItem {
  perfiles: number;
  perfilesNota?: string;
  alcance: string;
  top: string[];
  contenidos: { p: "ig" | "tt"; url: string }[];
}

export const RESULTS: Record<string, ResultItem[]> = {
  imkt: [
    { perfiles: 20, alcance: "200K", top: ["Vinyleo", "Caroh", "Randy Rocha"], contenidos: [{ p: "ig", url: "https://www.instagram.com/reels/DNZLCKQhTbF/" }, { p: "ig", url: "https://www.instagram.com/reel/DOthm0IjoUR/" }, { p: "tt", url: "https://www.tiktok.com/@soyrandyrocha/video/7538992712033324305" }] },
    { perfiles: 60, alcance: "800K", top: ["Kameoyo", "Soyhaliii", "Jess Barajas"], contenidos: [{ p: "tt", url: "https://www.tiktok.com/@kameoyo/video/7518118790119410962" }, { p: "tt", url: "https://www.tiktok.com/@soyhali/video/7485513509355261239" }, { p: "ig", url: "https://www.instagram.com/reels/DHoOLKfRiN_/" }] },
    { perfiles: 22, alcance: "500K", top: ["Hell", "Marovame", "Andy"], contenidos: [{ p: "tt", url: "https://www.tiktok.com/@hellsangri/video/7496970742026882312" }, { p: "tt", url: "https://www.tiktok.com/@marovame/video/7497427008683658503" }, { p: "tt", url: "https://www.tiktok.com/@andrea_delafuente/video/7498776038953012488" }] },
    { perfiles: 45, perfilesNota: "al momento", alcance: "5M", top: ["Tin el Regio", "Sabina", "Gaturón"], contenidos: [{ p: "tt", url: "https://www.tiktok.com/@ringmexico/video/7624997345972800775" }, { p: "tt", url: "https://www.tiktok.com/@ringmexico/video/7633500146558422293" }, { p: "tt", url: "https://www.tiktok.com/@ringmexico/video/7630648638192045332" }] },
  ],
  gaming: [
    { perfiles: 10, alcance: "909K", top: ["Sin6n", "Deus Amir", "Patty Meza"], contenidos: [{ p: "ig", url: "https://www.instagram.com/reel/DSWF50Dkary/" }, { p: "tt", url: "https://www.tiktok.com/@deusamirr/video/7584913931295149333" }, { p: "tt", url: "https://www.tiktok.com/@pattymezam/video/7584587751022955796" }] },
    { perfiles: 3, alcance: "260K", top: ["Soy Pan", "Natalan", "Rodezel"], contenidos: [{ p: "ig", url: "https://www.instagram.com/reel/DNjbNrTJb1C/" }, { p: "ig", url: "https://www.instagram.com/reel/DNWtw8gRdEW/" }, { p: "tt", url: "https://www.tiktok.com/@soypan_/video/7541245343619419410" }, { p: "ig", url: "https://www.instagram.com/reel/DNW5z2MMQFv/" }] },
    { perfiles: 2, alcance: "860K", top: ["Renrize", "Rodezel"], contenidos: [{ p: "ig", url: "https://www.instagram.com/p/DXlJuZyDGnz/" }, { p: "ig", url: "https://www.instagram.com/p/DXiTWzbDDGb/" }] },
  ],
};

// Helpers numéricos para alcance/seguidores.
export function parseNum(s?: string): number {
  if (!s) return 0;
  const m = String(s).replace(/[^0-9.kmKM]/g, "");
  const v = parseFloat(m) || 0;
  if (/m/i.test(s)) return v * 1e6;
  if (/k/i.test(s)) return v * 1e3;
  return v;
}
export function fmt(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return Math.round(n / 1e3) + "K";
  return String(n);
}
export function parseAlcance(s: string): number {
  s = String(s).trim().toUpperCase();
  const n = parseFloat(s);
  if (s.indexOf("M") >= 0) return n * 1e6;
  if (s.indexOf("K") >= 0) return n * 1e3;
  return n || 0;
}
export function fmtAlcance(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return Math.round(n / 1e3) + "K";
  return "" + n;
}
