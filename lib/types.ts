// Tipos compartidos del dominio MOVDI (espejo de las tablas de Supabase).

export type Crew = "MOVDI" | "UGC";
export type Tier = "Mega" | "Macro" | "Micro";

export interface Plataforma {
  plataforma: string;
  handle?: string;
  link?: string;
  seguidores?: string;
  er?: string;
}

export interface Video {
  titulo: string;
  link: string;
  tipo?: string;
}

export interface Talento {
  id: string;
  slug: string;
  nombre: string;
  crew: Crew;
  tier: Tier | null;
  ciudad: string;
  bio: string;
  pm_email: string;
  photo: string;
  audiencia: string;
  categorias: string[];
  plataformas: Plataforma[];
  marcas: string[];
  videos: Video[];
  publicado: boolean;
  orden: number;
}

// Acceso al panel (tabla team_members). No confundir con MiembroEquipo,
// que es la sección pública "Nosotros" del sitio.
export type TeamRole = "admin" | "editor" | "viewer";

export interface TeamAccess {
  id: string;
  email: string;
  name: string;
  role: TeamRole;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MiembroEquipo {
  id: string;
  nombre: string;
  puesto: string;
  frase: string;
  foto: string;
  publicado: boolean;
  orden: number;
}
