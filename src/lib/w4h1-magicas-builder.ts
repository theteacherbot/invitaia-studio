import type { W4H1MarriageFramework } from "./w4h1-marriage-types";
import type { InvitationJSON } from "./invitation-json-types";

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return dateStr;
  }
}

/**
 * Genera una estructura W4H1 para 'Invitaciones Mágicas'
 */
export function buildW4H1MagicasJSON(data: Record<string, string>): any {
  const fecha = new Date(data.fecha || Date.now());

  return {
    w4h1_framework: {
      who: {
        event_type: "Invitación Mágica",
        hosts: {
          celebrant: {
            full_name: data.nombre || "[Nombre]",
            role: "Anfitrión",
            visual_priority: "alta"
          }
        },
        target_audience: {
          profile: "familia y amigos, entusiastas de la fantasía",
          tone: "mágico, encantador, cálido"
        }
      },
      what: {
        asset_type: "Tarjeta de Invitación Mágica",
        design_category: "Fantasy Magical Invitation",
        objective: "Crear una invitación que evoque maravilla, brillo y un toque de cuento de hadas.",
        deliverables: {
          main_card: true,
          digital_version: true,
          social_media_version: true,
          print_ready_version: true
        }
      },
      when: {
        event_date: formatDate(data.fecha),
        event_time: data.hora || "[Hora]",
        season: "auto-detect",
        time_context: "tarde/mágica"
      },
      where: {
        venue: data.lugar || "[Lugar]"
      },
      why: {
        emotional_goal: ["asombro", "alegría", "maravilla"],
        brand_message: "Una experiencia mágica para compartir con seres queridos.",
      },
      how: {
        color_palette: {
          primary_option: {
            colors: ["#6A5ACD", "#FFD700", "#F8F0FF"]
          }
        },
        composition: {
          layout_style: "fantasy editorial",
          orientation: "vertical"
        },
        decorative_elements: {
          sparkles: { enabled: true },
          moon: { enabled: true },
          stars: { enabled: true },
          ornamental_frame: { enabled: true }
        },
        typography: {
          title: { style: "Whimsical Serif Display" },
          body: { style: "Gentle Sans" }
        },
        text_content: {
          header: "Invitaciones Mágicas",
          invitation_phrase: data.mensaje || "Ven a celebrar una noche de magia y maravillas.",
          closing_phrase: "Con cariño y un toque de magia"
        }
      }
    }
  } as InvitationJSON;
}
