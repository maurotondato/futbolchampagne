# ⚽ Fútbol Champagne de los Martes

Una experiencia tipo videojuego (FIFA / EA Sports FC style) para el grupo que
juega fútbol 7 todos los martes: armado de equipos con drag & drop, cartas de
jugador con atributos con humor, estadísticas reales, historial, cargadas
automáticas y más.

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** para animaciones y drag & drop
- **Zustand** (con persistencia local) como store de la app
- **Supabase** (Postgres + Auth + Storage) como backend — opcional
- **Recharts** para los gráficos de estadísticas
- **html-to-image** para exportar la formación como imagen
- Export estático (`output: "export"`) — corre en **GitHub Pages** (con el
  workflow ya incluido) o en **Vercel**, sin necesidad de servidor

## Empezar en local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

### Modo demo (sin Supabase)

Si no configurás las variables de entorno de Supabase, la app arranca igual
en **modo demo**: usa el plantel real de 24 jugadores como semilla y guarda
todos los cambios (partidos, resultados, cartas editadas, fotos, premios) en
el `localStorage` del navegador. Es perfecto para probar toda la app y para
la primera demo en Vercel antes de conectar la base de datos real. Vas a ver
un cartel avisando que estás en modo demo en el panel de administración.

### Conectar Supabase (recomendado para uso real del grupo)

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. Andá a **SQL Editor** y ejecutá el contenido de
   [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql).
   Esto crea las tablas, las políticas de seguridad (RLS), los buckets de
   Storage para fotos/videos y siembra el plantel real de 24 jugadores.
3. Copiá `.env.example` a `.env.local` y completá:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
   (Están en tu proyecto de Supabase, en *Project Settings → API*.)
4. Reiniciá el servidor de desarrollo. A partir de ahí, `/admin` va a pedir
   login real (Supabase Auth) y todo se guarda en la base de datos.
5. **Importante:** los números de teléfono de los jugadores quedan
   guardados en la base de datos para armar los links directos de WhatsApp
   de "Cargadas". Si el repo de este proyecto es público, considerá
   dejarlo privado ya que contiene datos de contacto reales del grupo.

### Multimedia

- **Video de intro:** poné tu archivo en `public/video/intro.mp4` (ver
  `public/video/README.md`). Si no está, la app pasa directo a la pantalla
  de carga sin romperse.
- **Sonidos opcionales:** poné `click.mp3`, `hover.mp3`, `whoosh.mp3`,
  `crowd.mp3`, `goal.mp3` y `select.mp3` en `public/audio/` (ver
  `public/audio/README.md`). Se activan desde ⚙ Configuración.
- **Fotos de jugadores:** se suben directamente desde `/admin/jugadores`
  (tocando el avatar de cada jugador). Con Supabase conectado se guardan en
  el bucket `player-photos`; sin Supabase se guardan como imagen embebida
  en el navegador (modo demo).

## Estructura

```
src/
  app/                  rutas (App Router) — una carpeta por pantalla
  components/
    intro/              video + pantalla de carga + reveal
    menu/                menú principal estilo FIFA
    pitch/               cancha, drag & drop, formación, compartir
    players/             cartas FIFA, editor de atributos
    stats/               rankings, gráficos
    historial/           carga de resultado y estadísticas post-partido
    cargadas/             generador de cargadas
    momentos/             goles / atajadas / papelones
    admin/                panel de administración
    ui/                   design system (glass, botones, avatar, etc.)
  lib/
    data/                 tipos, datos demo, cálculo de estadísticas, ELO
    supabase/              cliente de Supabase (browser) + auth
    cargadasPhrases.ts     banco de frases para las cargadas
    previa.ts               generador de la "simulación previa"
    whatsapp.ts              helper para links de wa.me
  store/appStore.ts        store global (Zustand) con fallback demo + Supabase
supabase/migrations/       esquema SQL completo con RLS y seed del plantel
```

## Acceso con contraseña

Antes de entrar, la app pide una contraseña compartida del grupo
(`fulbito`, ver `src/components/auth/PasswordGate.tsx`). Es solo un filtro
casual para que no entre cualquiera que encuentre el link — no es
seguridad real (queda en el código del sitio), así que no la uses para
nada sensible. Se guarda por dispositivo/navegador; desde ⚙ Configuración
hay un botón "Bloquear ahora" para volver a pedirla. Para cambiarla, editá
la constante `PASSWORD` en ese archivo.

## Deploy

La app es 100% estática (`output: "export"` en `next.config.ts` — no hay
rutas de servidor, todo corre en el navegador con Zustand + Supabase
opcional), así que funciona igual de bien en cualquiera de estas dos
opciones:

### GitHub Pages (recomendado, gratis, ya viene listo)

Ya incluye el workflow [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml).
Para activarlo:

1. En el repo de GitHub: **Settings → Pages → Build and deployment → Source:
   "GitHub Actions"**.
2. Hacé push a `main` (o corré el workflow manualmente desde la pestaña
   *Actions*). Cada push a `main` build y publica solo.
3. El sitio queda en `https://<usuario>.github.io/<nombre-del-repo>/`.

El workflow arma la app con `NEXT_PUBLIC_BASE_PATH=/<nombre-del-repo>`
automáticamente, así que todos los links, imágenes, video y audio
funcionan bien bajo esa subruta. Si en algún momento configurás Supabase,
agregá los secrets `NEXT_PUBLIC_SUPABASE_URL` y
`NEXT_PUBLIC_SUPABASE_ANON_KEY` en **Settings → Secrets and variables →
Actions** y sumalos como `env` al paso *Build static export* del workflow.

### Vercel (alternativa)

1. Importá el repo en [vercel.com/new](https://vercel.com/new).
2. (Opcional) agregá las variables `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Deploy — no hace falta tocar `NEXT_PUBLIC_BASE_PATH`, queda vacío y la
   app sirve desde la raíz del dominio.

En ambos casos la app funciona perfecta desde el celular — pensada para
compartirse por WhatsApp.
