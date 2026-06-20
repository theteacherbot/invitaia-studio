import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import type { EventTemplate } from "@/lib/event-templates";
import { saveInvitation } from "@/lib/invitations-service";
import { getImageProvider, DEFAULT_PROVIDER_ID } from "@/lib/image-providers";
import { generateImageVersions, downloadImageVersion, type ImageVersion } from "@/lib/image-versions-service";

interface Props {
  template: EventTemplate;
  data: Record<string, string>;
  onBack: () => void;
}

export function ResultView({ template, data, onBack }: Props) {
  const w4h1 = template.buildW4H1(data);
  const prompt = template.buildPrompt(data);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [promptId, setPromptId] = useState<string | null>(null);
  const [imageVersions, setImageVersions] = useState<ImageVersion[]>([]);
  const [isGeneratingVersions, setIsGeneratingVersions] = useState(false);
  const [imageStatus, setImageStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [image, setImage] = useState<{ url: string; provider: string } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Extraer especificaciones de diseño del w4h1
  const w4h1Unknown = w4h1 as unknown;
  const w4h1Framework = (w4h1Unknown as Record<string, unknown>).w4h1_framework as Record<string, unknown>;

  // w4h1Framework ya es el objeto que contiene who, what, when, where, why, how
  const how = w4h1Framework as Record<string, unknown>;

  // Declarar variables con valores por defecto
  let primaryColor = "#D4AF37";
  let secondaryColor = "#F7E7CE";
  let backgroundColor = "#FFF9F2";
  let ornamentalFrameEnabled = true;
  let titleStyle = "Luxury Serif Display";
  let bodyStyle = "Modern Serif";

  try {
    const colorPalette = (how.color_palette as Record<string, unknown>)?.primary_option as Record<string, unknown>;
    const colors = (colorPalette?.colors as string[]) || ["#D4AF37", "#F7E7CE", "#FFF9F2"];
    primaryColor = colors[0] || "#D4AF37";
    secondaryColor = colors[1] || "#F7E7CE";
    backgroundColor = colors[2] || "#FFF9F2";
    const composition = (how.composition as Record<string, unknown>) || {};
    const layoutStyle = (composition.layout_style as string) || "luxury anniversary editorial";
    const decorativeElements = (how.decorative_elements as Record<string, unknown>) || {};
    ornamentalFrameEnabled = (decorativeElements.ornamental_frame as Record<string, unknown>)?.enabled as boolean || true;
    const typography = (how.typography as Record<string, unknown>) || {};
    titleStyle = (typography.title as Record<string, unknown>)?.style as string || "Luxury Serif Display";
    bodyStyle = (typography.body as Record<string, unknown>)?.style as string || "Modern Serif";
  } catch (error) {
    console.error("Error extrayendo especificaciones del w4h1:", error);
  }

  console.log("ResultView montado");
  console.log("Prompt:", prompt);
  console.log("Data:", data);

  // Generar QR cuando los datos cambien
  useEffect(() => {
    const qrPayload = {
      rsvp: true,
      whatsapp: data.whatsapp || null,
      instagram: data.instagram || null,
      evento: template.name,
      fecha: data.fecha,
    };
    const qrPayloadString = JSON.stringify(qrPayload);

    console.log("Generando QR con datos:", qrPayload);
    QRCode.toDataURL(qrPayloadString, {
      width: 512,
      margin: 1,
      color: { dark: "#111111", light: "#FFFFFF" },
    })
      .then((url) => {
        console.log("QR generado exitosamente");
        setQrUrl(url);
      })
      .catch((err) => {
        console.error("Error generando QR:", err);
      });
  }, [data, template.name]);

  // Generar imagen directamente sin depender de Supabase
  useEffect(() => {
    const generateImage = async () => {
      console.log("Iniciando generación de imagen...");
      console.log("Prompt:", prompt);
      setImageStatus("loading");
      try {
        const provider = getImageProvider(DEFAULT_PROVIDER_ID);
        console.log("Proveedor:", DEFAULT_PROVIDER_ID);
        const result = await provider.generate(prompt, {
          metadata: { width: 1024, height: 1024 },
        });
        console.log("Resultado:", result);
        setImage({ url: result.url, provider: result.provider });
        setImageStatus("ready");
        toast.success("Imagen generada exitosamente");
      } catch (error) {
        console.error("Error generando imagen:", error);
        setImageStatus("error");
        toast.error("Error generando imagen");
      }
    };

    generateImage();
  }, [prompt]);

  // Persist invitation once QR is ready (opcional, no bloquea el flujo)
  useEffect(() => {
    if (!qrUrl || savedId) return;
    
    const qrPayload = {
      rsvp: true,
      whatsapp: data.whatsapp || null,
      instagram: data.instagram || null,
      evento: template.name,
      fecha: data.fecha,
    };
    
    saveInvitation({ template, data, qrPayload, qrDataUrl: qrUrl })
      .then((res) => {
        setSavedId(res.project.id);
        setPromptId(res.prompt.id);
        toast.success("Invitación guardada en tu biblioteca");
      })
      .catch((err) => {
        console.error("save invitation failed (opcional):", err);
        // No mostramos error porque es opcional - la imagen ya se generó
      });
  }, [qrUrl, template, data]);


  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  };

  const downloadQR = () => {
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `qr-${template.id}.png`;
    a.click();
  };

  const handleGenerateVersions = async () => {
    if (!image?.url) {
      toast.error("Primero debe generar una imagen");
      return;
    }

    setIsGeneratingVersions(true);
    try {
      const versions = await generateImageVersions({
        imageUrl: image.url,
        includeInstagram: true,
        includeFacebook: true,
        includeWhatsApp: true,
        includePrint: true,
      });
      setImageVersions(versions);
      toast.success("Versiones generadas exitosamente");
    } catch (error) {
      console.error("Error generando versiones:", error);
      toast.error("Error generando versiones de imagen");
    } finally {
      setIsGeneratingVersions(false);
    }
  };

  const handleDownloadVersion = (version: ImageVersion) => {
    downloadImageVersion(version, `invitacion-${template.id}`);
    toast.success(`Versión ${version.platform} descargada`);
  };

  const downloadPDF = () => {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const w = pdf.internal.pageSize.getWidth();
    const h = pdf.internal.pageSize.getHeight();

    // Extraer especificaciones de diseño del w4h1 dentro de la función
    const w4h1Unknown = w4h1 as unknown;
    const w4h1Framework = (w4h1Unknown as Record<string, unknown>).w4h1_framework as Record<string, unknown>;
    const how = w4h1Framework as Record<string, unknown>;

    // Declarar variables con valores por defecto
    let primaryColor = "#D4AF37";
    let secondaryColor = "#F7E7CE";
    let backgroundColor = "#FFF9F2";
    let ornamentalFrameEnabled = true;
    let textContent: Record<string, unknown> = {};
    let typography: Record<string, unknown> = {};

    try {
      const colorPalette = (how.color_palette as Record<string, unknown>)?.primary_option as Record<string, unknown>;
      const colors = (colorPalette?.colors as string[]) || ["#D4AF37", "#F7E7CE", "#FFF9F2"];
      primaryColor = colors[0] || "#D4AF37";
      secondaryColor = colors[1] || "#F7E7CE";
      backgroundColor = colors[2] || "#FFF9F2";
      const decorativeElements = (how.decorative_elements as Record<string, unknown>) || {};
      ornamentalFrameEnabled = (decorativeElements.ornamental_frame as Record<string, unknown>)?.enabled as boolean;
      if (ornamentalFrameEnabled === undefined || ornamentalFrameEnabled === null) {
        ornamentalFrameEnabled = true;
      }
      typography = (how.typography as Record<string, unknown>) || {};
      textContent = (how.text_content as Record<string, unknown>) || {};
    } catch (error) {
      console.error("Error extrayendo especificaciones del w4h1 en PDF:", error);
    }

    // Convertir colores hex a RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 180, g: 140, b: 60 };
    };

    const primaryRgb = hexToRgb(primaryColor);
    const secondaryRgb = hexToRgb(secondaryColor);
    const backgroundRgb = hexToRgb(backgroundColor);

    // Fondo con gradiente simulado usando colores del w4h1
    pdf.setFillColor(backgroundRgb.r, backgroundRgb.g, backgroundRgb.b);
    pdf.rect(0, 0, w, h, "F");

    // Borde elegante con color primario del w4h1
    pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.setLineWidth(2);
    pdf.rect(30, 30, w - 60, h - 60);

    // Marco ornamental en las esquinas si está habilitado
    console.log("ornamentalFrameEnabled en PDF:", ornamentalFrameEnabled);
    if (ornamentalFrameEnabled) {
      pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      pdf.setLineWidth(1.5);
      // Esquina superior izquierda
      pdf.line(30, 60, 30, 30);
      pdf.line(30, 30, 60, 30);
      // Esquina superior derecha
      pdf.line(w - 60, 30, w - 30, 30);
      pdf.line(w - 30, 30, w - 30, 60);
      // Esquina inferior izquierda
      pdf.line(30, h - 60, 30, h - 30);
      pdf.line(30, h - 30, 60, h - 30);
      // Esquina inferior derecha
      pdf.line(w - 60, h - 30, w - 30, h - 30);
      pdf.line(w - 30, h - 30, w - 30, h - 60);
      console.log("Marco ornamental dibujado");
    } else {
      console.log("Marco ornamental no habilitado");
    }

    // Header elegante - usar text_content del w4h1
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.setFontSize(9);
    pdf.text("INVITAIA · STUDIO", w / 2, 70, { align: "center" });

    // Línea decorativa superior
    pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.setLineWidth(1);
    pdf.line(w / 2 - 50, 85, w / 2 + 50, 85);

    // Header del w4h1 o tipo de evento
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.setFontSize(10);
    const header = (textContent as Record<string, unknown>)?.header as string || template.name.toUpperCase();
    pdf.text(header, w / 2, 130, { align: "center" });

    // Línea decorativa central
    pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.setLineWidth(1.5);
    pdf.line(w / 2 - 30, 150, w / 2 + 30, 150);

    // Título principal (nombre del evento) - usar anniversary_title del w4h1
    pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(36);
    const anniversaryTitle = (textContent.anniversary_title as string) || (data.nombre || data.novia || data.anfitrion || data.personas || data.mama || data.graduado || data.comulgante || data.quinceanera || "Tu evento");
    if (data.novio) {
      pdf.text(`${data.novia} & ${data.novio}`, w / 2, 220, { align: "center" });
    } else {
      pdf.text(anniversaryTitle, w / 2, 220, { align: "center" });
    }

    // Detalles del evento con diseño editorial - usar tipografía del w4h1
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(14);
    let y = 260; // Ajustado para después del título

    // Fecha y hora destacadas - usar color primario del w4h1
    if (data.fecha && data.hora) {
      pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text(`${data.fecha} · ${data.hora}`, w / 2, y, { align: "center" });
      y += 40;
    }

    // Lugar - usar color secundario del w4h1
    if (data.lugar) {
      pdf.setTextColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(14);
      pdf.text(data.lugar, w / 2, y, { align: "center" });
      y += 30;
    }

    // Detalles adicionales según tipo de evento - usar colores del w4h1
    pdf.setTextColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
    pdf.setFontSize(12);
    if (data.ceremonia) {
      pdf.text(`Ceremonia: ${data.ceremonia}`, w / 2, y, { align: "center" });
      y += 25;
    }
    if (data.recepcion) {
      pdf.text(`Recepción: ${data.recepcion}`, w / 2, y, { align: "center" });
      y += 25;
    }
    if (data.tema) {
      pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      pdf.setFont("helvetica", "italic");
      pdf.text(`Tema: ${data.tema}`, w / 2, y, { align: "center" });
      y += 25;
    }
    if (data.titulo) {
      pdf.setTextColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
      pdf.setFont("helvetica", "normal");
      pdf.text(data.titulo, w / 2, y, { align: "center" });
      y += 25;
    }
    if (data.institucion) {
      pdf.text(data.institucion, w / 2, y, { align: "center" });
      y += 25;
    }
    if (data.dresscode) {
      pdf.setTextColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Dress code: ${data.dresscode}`, w / 2, y, { align: "center" });
      y += 25;
    }

    // Invitation phrase del w4h1
    const invitationPhrase = (textContent.invitation_phrase as string);
    if (invitationPhrase) {
      pdf.setTextColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(11);
      pdf.text(invitationPhrase, w / 2, y, { align: "center", maxWidth: w - 100 });
      y += 35;
    }

    // Línea decorativa antes del QR - usar color primario del w4h1
    y += 20;
    pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.setLineWidth(0.5);
    pdf.line(w / 2 - 40, y, w / 2 + 40, y);
    y += 30;

    // QR Code centrado
    if (qrUrl) {
      pdf.addImage(qrUrl, "PNG", w / 2 - 60, y, 120, 120);
      y += 130;
    }

    // Texto debajo del QR - usar color secundario del w4h1
    pdf.setFontSize(10);
    pdf.setTextColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
    pdf.text("Escanea para confirmar asistencia", w / 2, y, { align: "center" });

    // Closing phrase del w4h1
    const closingPhrase = (textContent.closing_phrase as string);
    if (closingPhrase) {
      y += 40;
      pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(11);
      pdf.text(closingPhrase, w / 2, y, { align: "center", maxWidth: w - 100 });
      y += 30;
    }

    // Información de contacto en el footer - usar color primario del w4h1
    y += 40;
    pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.setLineWidth(0.5);
    pdf.line(w / 2 - 50, y, w / 2 + 50, y);
    y += 25;

    pdf.setFontSize(9);
    if (data.whatsapp) {
      pdf.setTextColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
      pdf.text(`WhatsApp: ${data.whatsapp}`, w / 2, y, { align: "center" });
      y += 15;
    }
    if (data.instagram) {
      pdf.text(`Instagram: ${data.instagram}`, w / 2, y, { align: "center" });
    }

    // Footer - usar color primario del w4h1
    pdf.setFontSize(8);
    pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.text("Generado con INVITAIA · Studio", w / 2, h - 40, { align: "center" });

    pdf.save(`invitacion-${template.id}.pdf`);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] md:grid-cols-1">
      {/* Invitation preview */}
      <Card className="overflow-hidden border-border p-0 min-w-[300px]">
        <div
          ref={cardRef}
          className="relative flex min-h-[640px] flex-col items-center justify-center gap-6 p-10 text-center"
          style={{
            background: `linear-gradient(to bottom, ${backgroundColor}, ${secondaryColor})`,
            border: ornamentalFrameEnabled ? `2px solid ${primaryColor}` : undefined,
          }}
        >
          <div className="text-xs uppercase tracking-[0.3em]" style={{ color: primaryColor }}>
            {template.name}
          </div>
          <div className="h-px w-16" style={{ backgroundColor: primaryColor }} />
          {ornamentalFrameEnabled && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2" style={{ borderColor: primaryColor, opacity: 0.5 }} />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2" style={{ borderColor: primaryColor, opacity: 0.5 }} />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2" style={{ borderColor: primaryColor, opacity: 0.5 }} />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2" style={{ borderColor: primaryColor, opacity: 0.5 }} />
            </div>
          )}
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-28 w-28 items-center justify-center rounded-xl border text-4xl shadow-sm" style={{ backgroundColor: backgroundColor, borderColor: primaryColor }}>
              {template.icon ?? "✨"}
            </div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {template.name}
            </p>
          </div>
          <h2 className="font-display text-4xl font-semibold" style={{ color: primaryColor, fontFamily: titleStyle.includes("Serif") ? "serif" : "sans-serif" }}>
            {data.nombre || data.novia || "Tu evento"}
            {data.novio && <> <span style={{ color: primaryColor }}>&</span> {data.novio}</>}
          </h2>
          <div className="grid gap-2 text-sm text-muted-foreground" style={{ fontFamily: bodyStyle.includes("Serif") ? "serif" : "sans-serif" }}>
            {data.fecha && <p className="text-base text-foreground">{data.fecha} · {data.hora}</p>}
            {data.lugar && <p>{data.lugar}</p>}
            {data.ceremonia && <p>Ceremonia: {data.ceremonia}</p>}
            {data.recepcion && <p>Recepción: {data.recepcion}</p>}
            {data.tema && <p className="italic">Tema: {data.tema}</p>}
          </div>
          {qrUrl && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <img src={qrUrl} alt="QR" className="h-32 w-32 rounded-lg border bg-white p-2" />
              <p className="text-xs text-muted-foreground">Escanea para confirmar</p>
            </div>
          )}
        </div>
      </Card>

      {/* Side panel */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          <Button onClick={downloadPDF} className="bg-foreground text-background hover:bg-foreground/90">
            Descargar PDF
          </Button>
          <Button onClick={downloadQR} variant="outline">Descargar QR</Button>
          <Button 
            onClick={handleGenerateVersions} 
            variant="outline"
            disabled={!image?.url || isGeneratingVersions}
          >
            {isGeneratingVersions ? "Generando..." : "Generar Versiones"}
          </Button>
          <Button onClick={onBack} variant="ghost">← Editar</Button>
        </div>

        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">JSON Jerárquico</h3>
            <Button size="sm" variant="ghost" onClick={() => copy(JSON.stringify(w4h1, null, 2), "JSON")}>
              Copiar
            </Button>
          </div>
          <pre className="max-h-72 overflow-auto rounded-lg bg-muted p-4 text-xs leading-relaxed">
            {JSON.stringify(w4h1, null, 2)}
          </pre>
        </Card>

        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Prompt IA
            </h3>
            <Button size="sm" variant="ghost" onClick={() => copy(prompt, "Prompt")}>
              Copiar
            </Button>
          </div>
          <p className="rounded-lg bg-muted p-4 text-sm leading-relaxed">{prompt}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            Listo para usar con OpenAI Images, Pollinations, Flux o Ideogram.
          </p>
        </Card>

        {imageVersions.length > 0 && (
          <Card className="p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Versiones para Redes Sociales
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Descarga la versión optimizada para cada plataforma
              </p>
            </div>
            <div className="grid gap-3">
              {imageVersions.map((version) => (
                <div
                  key={version.platform}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <span className="text-lg">
                        {version.platform === "Instagram" && "📱"}
                        {version.platform === "Facebook" && "📘"}
                        {version.platform === "WhatsApp" && "💬"}
                        {version.platform === "Impresión" && "🖨️"}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{version.platform}</div>
                      <div className="text-xs text-muted-foreground">
                        {version.width}x{version.height} · {version.description}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadVersion(version)}
                  >
                    Descargar
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
