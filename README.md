# INVITAIA · Studio

Invitaciones inteligentes y generadas por IA con descarga PDF, código QR y guardado en Supabase.

## 🚀 Qué hace este proyecto

- Genera invitaciones de eventos con IA y prompts listos para imágenes.
- Crea JSON W4H1 (Who, What, When, Where, Why, How) para cada invitación.
- Genera códigos QR funcionales para la invitación.
- Exporta la invitación como PDF.
- Guarda proyectos en Supabase para administrar invitaciones.
- Soporta varias plantillas de evento.

## 🧩 Tecnologías

- React + TypeScript
- Vite
- Supabase
- TanStack Router
- html2canvas + jsPDF
- qrcode
- Tailwind CSS

## ✅ Características principales

- Plantillas para: Cumpleaños, Matrimonio, Quince, Graduación, Comunión, Baby Shower, Aniversario y Fiesta Especial.
- Generación automática de prompt e invitación visual.
- Renderizado y exportación de PDF.
- Carga y administración de proyectos guardados.
- Interfaz rápida en el navegador.

## 🛠️ Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/theteacherbot/invitaia-studio.git
cd invitaia-studio
```

2. Instala dependencias:

```bash
npm install
```

3. Copia la configuración de ejemplo:

```bash
copy config.js.example config.js
```

4. Abre `config.js` y agrega tu URL y clave de Supabase.

```js
const SUPABASE_CONFIG = {
  URL: "https://tu-proyecto.supabase.co",
  ANON_KEY: "tu-clave-anonima-publica-aqui"
};
```

> `config.js` está en `.gitignore` para proteger tus credenciales.

## 🚀 Ejecutar en local

```bash
npm run dev
```

Luego abre la URL que muestra Vite en tu navegador.

## 📦 Construir para producción

```bash
npm run build
```

## 📁 Estructura relevante

- `src/components/ResultView.tsx` - Vista de resultado con QR, JSON y exportación PDF.
- `src/lib/event-templates.ts` - Registro de plantillas del evento.
- `config.js.example` - Configuración de Supabase de ejemplo.
- `src/routes/index.tsx` - Lógica principal de selección de evento y flujo de edición.

## 🔐 Seguridad

- Nunca incluyas claves reales en el repositorio.
- Usa `config.js.example` como plantilla.
- Agrega claves sensibles al archivo `config.js` local.

## ✨ Plantilla destacada: Invitaciones Mágicas

La plantilla "Invitaciones Mágicas" crea una invitación con estilo fantasioso y texto creativo. Úsala para eventos temáticos, fiestas infantiles, celebraciones especiales o cualquier ocasión en la que quieras un toque de fantasía.

## 📄 Cómo usar el QR y el PDF

1. Completa los campos del evento y selecciona una plantilla.
2. Haz clic en Generar para obtener la invitación, el JSON W4H1 y el código QR.
3. En ResultView, revisa el QR generado para asegurarte de que contiene el enlace o los datos correctos.
4. Presiona Descargar PDF para guardar la invitación completa en tu equipo.

## 🎉 Uso rápido

1. Selecciona una plantilla.
2. Completa los datos del evento.
3. Genera la invitación.
4. Descarga el PDF o guarda el proyecto.

## 📌 Notas

- Si necesitas conectar tu propio backend o mejorar la gestión de proyectos, ajusta la integración de Supabase en `src/lib`.
- El proyecto ya está publicado en GitHub en `https://github.com/theteacherbot/invitaia-studio`.

## 🤝 Contribuciones

Las mejoras son bienvenidas. Abre un issue o PR si deseas proponer cambios.

---

**INVITAIA · Studio**
