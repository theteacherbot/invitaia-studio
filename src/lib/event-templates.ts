import { buildInvitationJSON } from "./invitation-json-builder";
import { buildW4H1MatrimonioJSON } from "./w4h1-marriage-builder";
import { buildW4H1QuinceJSON } from "./w4h1-quince-builder";
import { buildW4H1ComunionJSON } from "./w4h1-comunion-builder";
import { buildW4H1BabyShowerJSON } from "./w4h1-babyshower-builder";
import { buildW4H1CumpleanosJSON } from "./w4h1-cumpleanos-builder";
import { buildW4H1AniversarioJSON } from "./w4h1-aniversario-builder";
import { buildW4H1MagicasJSON } from "./w4h1-magicas-builder";

export type FieldType = "text" | "date" | "time" | "number" | "textarea";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
}

export interface W4H1 {
  who: Record<string, unknown>;
  what: Record<string, unknown>;
  when: Record<string, unknown>;
  where: Record<string, unknown>;
  why: Record<string, unknown>;
  how: Record<string, unknown>;
}

export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: FieldDef[];
  buildW4H1: (data: Record<string, string>) => W4H1;
  buildPrompt: (data: Record<string, string>) => string;
}

// ---- Reusable building blocks ---------------------------------------------

const SOCIAL_FIELDS: FieldDef[] = [
  { name: "instagram", label: "Instagram", type: "text", placeholder: "@usuario" },
  { name: "whatsapp", label: "WhatsApp", type: "text", placeholder: "+57 300 000 0000" },
];

const WHEN_WHERE_FIELDS: FieldDef[] = [
  { name: "fecha", label: "Fecha", type: "date", required: true },
  { name: "hora", label: "Hora", type: "time", required: true },
  { name: "lugar", label: "Lugar", type: "text", required: true },
];

const social = (d: Record<string, string>) => ({
  instagram: d.instagram || "",
  whatsapp: d.whatsapp || "",
});

interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  extraFields: FieldDef[];
  /** Use full custom field list instead of WHEN_WHERE_FIELDS + extras. */
  customFields?: FieldDef[];
  who: (d: Record<string, string>) => Record<string, unknown>;
  what: (d: Record<string, string>) => Record<string, unknown>;
  where?: (d: Record<string, string>) => Record<string, unknown>;
  why: (d: Record<string, string>) => Record<string, unknown>;
  how: (d: Record<string, string>) => Record<string, unknown>;
  promptStyle: string;
  promptSubject: (d: Record<string, string>) => string;
}

function buildTemplate(cfg: TemplateConfig): EventTemplate {
  const fields =
    cfg.customFields ?? [...cfg.extraFields, ...WHEN_WHERE_FIELDS, ...SOCIAL_FIELDS];

  return {
    id: cfg.id,
    name: cfg.name,
    description: cfg.description,
    icon: cfg.icon,
    fields,
    buildW4H1: (d) => ({
      who: { ...cfg.who(d), ...social(d) },
      what: cfg.what(d),
      when: { fecha: d.fecha, hora: d.hora },
      where: cfg.where ? cfg.where(d) : { lugar: d.lugar },
      why: cfg.why(d),
      how: cfg.how(d),
    }),
    buildPrompt: (d) =>
      `${cfg.promptSubject(d)} Date ${d.fecha} at ${d.hora}, venue ${d.lugar || "—"}. ` +
      `Style: ${cfg.promptStyle}, photorealistic, high detail, 4k, editorial typography, ` +
      `Apple-like minimal luxury, gold accents on white and black.`,
  };
}

// ---- Templates -------------------------------------------------------------

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: "cumpleanos",
    name: "Cumpleaños",
    description: "Celebra un año más con una invitación memorable.",
    icon: "🎂",
    fields: [
      { name: "nombre", label: "Nombre", type: "text", required: true },
      { name: "edad", label: "Edad", type: "number", required: true },
      { name: "tema", label: "Tema", type: "text", placeholder: "Ej: Tropical, Neón" },
      { name: "colores", label: "Colores", type: "text", placeholder: "Ej: Dorado y blanco" },
      { name: "fecha", label: "Fecha", type: "date", required: true },
      { name: "hora", label: "Hora", type: "time", required: true },
      { name: "lugar", label: "Lugar", type: "text", required: true },
      { name: "instagram", label: "Instagram", type: "text", placeholder: "@usuario" },
      { name: "whatsapp", label: "WhatsApp", type: "text", placeholder: "+57 300 000 0000" },
    ],
    buildW4H1: (d) => buildW4H1CumpleanosJSON(d) as any,
    buildPrompt: (d) =>
      `Elegant premium birthday invitation card for ${d.nombre} turning ${d.edad}. Theme: ${d.tema || "modern minimal"}. Date ${d.fecha} at ${d.hora}, venue ${d.lugar}. ` +
      `Style: modern minimal birthday luxury, photorealistic, high detail, 4k, editorial typography, ` +
      `Apple-like minimal luxury, gold accents.`,
  },

  {
    id: "matrimonio",
    name: "Matrimonio",
    description: "Una invitación elegante para el día más especial.",
    icon: "💍",
    fields: [
      { name: "novia", label: "Nombre Novia", type: "text", required: true },
      { name: "novio", label: "Nombre Novio", type: "text", required: true },
      { name: "fecha", label: "Fecha", type: "date", required: true },
      { name: "hora", label: "Hora", type: "time", required: true },
      { name: "ceremonia", label: "Ceremonia", type: "text", required: true, placeholder: "Iglesia / lugar" },
      { name: "recepcion", label: "Recepción", type: "text", required: true, placeholder: "Salón / lugar" },
      { name: "instagram", label: "Instagram", type: "text", placeholder: "@usuario" },
      { name: "whatsapp", label: "WhatsApp", type: "text", placeholder: "+57 300 000 0000" },
    ],
    buildW4H1: (d) => buildW4H1MatrimonioJSON(d) as any,
    buildPrompt: (d) =>
      `Luxury wedding invitation for ${d.novia} & ${d.novio}. Ceremony at ${d.ceremonia}, reception at ${d.recepcion}. Date ${d.fecha} at ${d.hora}. ` +
      `Style: timeless elegance, botanical accents, gold foil details, photorealistic, high detail, 4k, editorial typography, ` +
      `Apple-like minimal luxury, romantic atmosphere.`,
  },

  {
    id: "quince",
    name: "Quince Años",
    description: "Diseño sofisticado para una noche inolvidable.",
    icon: "👑",
    fields: [
      { name: "nombre", label: "Nombre", type: "text", required: true },
      { name: "tema", label: "Tema", type: "text", placeholder: "Ej: Cenicienta, Hollywood" },
      { name: "fecha", label: "Fecha", type: "date", required: true },
      { name: "hora", label: "Hora", type: "time", required: true },
      { name: "lugar", label: "Lugar", type: "text", required: true, placeholder: "Salón / lugar" },
      { name: "instagram", label: "Instagram", type: "text", placeholder: "@usuario" },
      { name: "whatsapp", label: "WhatsApp", type: "text", placeholder: "+57 300 000 0000" },
    ],
    buildW4H1: (d) => buildW4H1QuinceJSON(d) as any,
    buildPrompt: (d) =>
      `Luxury quinceañera invitation for ${d.nombre}. Theme: ${d.tema || "royal glamour"}. Date ${d.fecha} at ${d.hora}, venue ${d.lugar}. ` +
      `Style: premium editorial quinceañera, tiara motif, royal glamour, photorealistic, high detail, 4k, editorial typography, ` +
      `Apple-like minimal luxury, rose gold accents.`,
  },

  {
    id: "graduacion",
    name: "Graduación",
    description: "Honra un logro académico con estilo.",
    icon: "🎓",
    fields: [
      { name: "nombre", label: "Nombre del graduado", type: "text", required: true },
      { name: "titulo", label: "Título / Grado", type: "text", required: true, placeholder: "Ej: Ingeniería" },
      { name: "institucion", label: "Institución", type: "text", required: true },
      { name: "promocion", label: "Promoción", type: "text", placeholder: "Ej: 2026" },
      { name: "fecha", label: "Fecha", type: "date", required: true },
      { name: "hora", label: "Hora", type: "time", required: true },
      { name: "lugar", label: "Lugar", type: "text", required: true },
      { name: "instagram", label: "Instagram", type: "text", placeholder: "@usuario" },
      { name: "whatsapp", label: "WhatsApp", type: "text", placeholder: "+57 300 000 0000" },
    ],
    buildW4H1: (d) => buildInvitationJSON("graduacion", d) as any,
    buildPrompt: (d) =>
      `Premium graduation invitation for ${d.nombre}, graduating in ${d.titulo} at ${d.institucion}. Date ${d.fecha} at ${d.hora}, venue ${d.lugar}. ` +
      `Style: academic elegance, laurel and graduation cap motif, deep navy and gold, photorealistic, high detail, 4k, editorial typography, ` +
      `Apple-like minimal luxury, gold accents on white and black.`,
  },

  {
    id: "comunion",
    name: "Primera Comunión",
    description: "Una invitación serena para un día sagrado.",
    icon: "🕊️",
    fields: [
      { name: "nombre", label: "Nombre del niño/a", type: "text", required: true },
      { name: "iglesia", label: "Parroquia / Iglesia", type: "text", required: true },
      { name: "fecha", label: "Fecha", type: "date", required: true },
      { name: "hora", label: "Hora", type: "time", required: true },
      { name: "recepcion", label: "Recepción", type: "text", required: true, placeholder: "Lugar de celebración" },
      { name: "instagram", label: "Instagram", type: "text", placeholder: "@usuario" },
      { name: "whatsapp", label: "WhatsApp", type: "text", placeholder: "+57 300 000 0000" },
    ],
    buildW4H1: (d) => buildW4H1ComunionJSON(d) as any,
    buildPrompt: (d) =>
      `Serene first communion invitation for ${d.nombre}. Church: ${d.iglesia}. Date ${d.fecha} at ${d.hora}, reception at ${d.recepcion}. ` +
      `Style: serene religious elegance, dove motif, heavenly light, photorealistic, high detail, 4k, editorial typography, ` +
      `Apple-like minimal luxury, soft gold accents.`,
  },

  {
    id: "magicas",
    name: "Invitaciones Mágicas",
    description: "Invitaciones con un toque de fantasía, brillo y encanto.",
    icon: "🪄",
    fields: [
      { name: "nombre", label: "Nombre", type: "text", required: true },
      { name: "fecha", label: "Fecha", type: "date", required: true },
      { name: "hora", label: "Hora", type: "time", required: true },
      { name: "lugar", label: "Lugar", type: "text", required: true },
      { name: "mensaje", label: "Mensaje / Frase", type: "textarea", placeholder: "Mensaje mágico para la invitación" },
      { name: "instagram", label: "Instagram", type: "text", placeholder: "@usuario" },
      { name: "whatsapp", label: "WhatsApp", type: "text", placeholder: "+57 300 000 0000" },
    ],
    buildW4H1: (d) => buildW4H1MagicasJSON(d) as any,
    buildPrompt: (d) =>
      `Magical fantasy invitation for ${d.nombre}. Theme: enchanted, sparkling, whimsical. Date ${d.fecha} at ${d.hora}, venue ${d.lugar}. ` +
      `Style: fantasy editorial, soft glows, starry accents, high detail, ethereal color palette.`,
  },

  {
    id: "babyshower",
    name: "Baby Shower",
    description: "Da la bienvenida con dulzura y elegancia.",
    icon: "👶",
    fields: [
      { name: "mama", label: "Nombre de la mamá", type: "text", required: true },
      { name: "bebe", label: "Nombre del bebé", type: "text", placeholder: "Si ya tiene nombre" },
      { name: "genero", label: "Género", type: "text", placeholder: "Niño / Niña / Sorpresa" },
      { name: "tema", label: "Tema", type: "text", placeholder: "Ej: Nubes, Safari" },
      { name: "fecha", label: "Fecha", type: "date", required: true },
      { name: "hora", label: "Hora", type: "time", required: true },
      { name: "lugar", label: "Lugar", type: "text", required: true },
      { name: "instagram", label: "Instagram", type: "text", placeholder: "@usuario" },
      { name: "whatsapp", label: "WhatsApp", type: "text", placeholder: "+57 300 000 0000" },
    ],
    buildW4H1: (d) => buildW4H1BabyShowerJSON(d) as any,
    buildPrompt: (d) =>
      `Tender baby shower invitation for ${d.mama}${d.bebe ? `, welcoming ${d.bebe}` : ""}. Theme: ${d.tema || "dreamy clouds"}. Date ${d.fecha} at ${d.hora}, venue ${d.lugar}. ` +
      `Style: soft pastel baby shower, dreamy clouds, delicate gold lines, photorealistic, high detail, 4k, editorial typography, ` +
      `Apple-like minimal luxury, rose gold accents.`,
  },

  {
    id: "aniversario",
    name: "Aniversario",
    description: "Conmemora años de amor o historia.",
    icon: "🥂",
    fields: [
      { name: "personas", label: "Personas / Pareja", type: "text", required: true, placeholder: "Ej: Ana & Luis" },
      { name: "anios", label: "Años a celebrar", type: "number", required: true },
      { name: "tipo", label: "Tipo", type: "text", placeholder: "Bodas / Empresa / Amistad" },
      { name: "fecha", label: "Fecha", type: "date", required: true },
      { name: "hora", label: "Hora", type: "time", required: true },
      { name: "lugar", label: "Lugar", type: "text", required: true },
      { name: "instagram", label: "Instagram", type: "text", placeholder: "@usuario" },
      { name: "whatsapp", label: "WhatsApp", type: "text", placeholder: "+57 300 000 0000" },
    ],
    buildW4H1: (d) => buildW4H1AniversarioJSON(d) as any,
    buildPrompt: (d) =>
      `Sophisticated anniversary invitation celebrating ${d.anios} years of ${d.personas}. Date ${d.fecha} at ${d.hora}, venue ${d.lugar}. ` +
      `Style: timeless anniversary, champagne tones, fine art typography, photorealistic, high detail, 4k, editorial typography, ` +
      `Apple-like minimal luxury, gold accents.`,
  },

  buildTemplate({
    id: "fiesta",
    name: "Fiesta Especial",
    description: "Para cualquier celebración fuera de catálogo.",
    icon: "🎉",
    extraFields: [
      { name: "titulo", label: "Título del evento", type: "text", required: true, placeholder: "Ej: Halloween Gala" },
      { name: "anfitrion", label: "Anfitrión", type: "text", required: true },
      { name: "tema", label: "Tema / Concepto", type: "text" },
      { name: "dresscode", label: "Dress code", type: "text", placeholder: "Ej: Black tie" },
      { name: "descripcion", label: "Descripción", type: "textarea" },
    ],
    who: (d) => ({ anfitrion: d.anfitrion }),
    what: (d) => ({ evento: d.titulo, tema: d.tema || null, descripcion: d.descripcion || null }),
    why: (d) => ({ motivo: d.descripcion || `Fiesta especial: ${d.titulo}` }),
    how: (d) => ({ estilo: d.tema || "Editorial moderno", dresscode: d.dresscode || null }),
    promptStyle: "bold editorial party, contemporary luxury, dramatic lighting",
    promptSubject: (d) =>
      `Striking invitation for "${d.titulo}" hosted by ${d.anfitrion}${d.tema ? `, theme ${d.tema}` : ""}${d.dresscode ? `, dress code ${d.dresscode}` : ""}.`,
  }),
];

export const getTemplate = (id: string) =>
  EVENT_TEMPLATES.find((t) => t.id === id);
