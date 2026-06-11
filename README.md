<div align="center">

# ♞ openchess<span>.dev</span>

### Corre un torneo de ajedrez en dos clicks.

Plataforma **open-source** para crear y gestionar torneos de ajedrez.
Emparejamientos suizos, eliminatorias, round robin o arena en segundos — los jugadores
entran desde cualquier dispositivo con un **código de seis caracteres**. Sin cuentas, sin fricción.

<br />

[![MIT License](https://img.shields.io/badge/license-MIT-0E7343.svg?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-15171A.svg?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-087EA4.svg?style=flat-square&logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Realtime-3FCF8E.svg?style=flat-square&logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org)

[**Crear torneo**](https://openchess.dev) · [Unirse con un código](https://openchess.dev/join) · [Reportar un bug](https://github.com/alxbryann/openchess.dev/issues)

</div>

---

## ✨ Qué hace

- **🏆 Cuatro formatos** — Suizo, Eliminación (simple/doble), Round Robin y Arena, con emparejamientos según convenciones FIDE.
- **🔗 Únete con un código** — Cada torneo tiene un código corto. Échalo en un chat grupal o proyéctalo en la pared; los jugadores solo lo escriben. Sin registro obligatorio.
- **⚡ Tablas en tiempo real** — Emparejamientos, resultados y clasificaciones se actualizan en el instante en que se reporta una partida, vía Supabase Realtime.
- **⚖️ Justo por defecto** — Desempates automáticos (Buchholz, Sonneborn–Berger), manejo de byes y balance de colores listos desde el primer minuto.
- **📺 Modo display** — Vista de pantalla completa para proyectar clasificaciones y emparejamientos en vivo en el club.
- **🌍 Abierto y auto-hosteable** — Núcleo con licencia MIT. Córrelo en nuestra nube o en tu propio servidor: tus datos, tus reglas.

## 🎯 Formatos soportados

| Formato | Descripción | Ideal para |
| --- | --- | --- |
| **Suizo** | Todos juegan cada ronda; se emparejan por puntaje. | Campos abiertos grandes |
| **Eliminación** | Brackets de eliminación simple o doble. | Knockouts y finales |
| **Round Robin** | Todos contra todos. | Secciones pequeñas |
| **Arena** | Emparejamiento continuo contra el reloj. | Blitz y eventos rápidos |

## 🛠️ Stack

| Capa | Tecnología |
| --- | --- |
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) · [React 19](https://react.dev) |
| **Lenguaje** | [TypeScript 5](https://www.typescriptlang.org) |
| **Estilos** | [Tailwind CSS v4](https://tailwindcss.com) · [shadcn/ui](https://ui.shadcn.com) · [Base UI](https://base-ui.com) |
| **Estado** | [Zustand](https://zustand-demo.pmnd.rs) |
| **Backend** | [Supabase](https://supabase.com) — Postgres, Auth y Realtime |
| **UI extra** | [lucide-react](https://lucide.dev) · [sonner](https://sonner.emilkowal.ski) · [date-fns](https://date-fns.org) |

## 🚀 Empezar

### Requisitos

- **Node.js 20+** y **npm**
- Un proyecto de **[Supabase](https://supabase.com)** (gratis) — o la [Supabase CLI](https://supabase.com/docs/guides/local-development) para correr el stack en local.

### 1. Clonar e instalar

```bash
git clone https://github.com/alxbryann/openchess.dev.git
cd openchess.dev
npm install
```

### 2. Variables de entorno

Crea un archivo `.env.local` en la raíz con las claves de tu proyecto de Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

> Las encuentras en tu dashboard de Supabase → **Project Settings → API**.

### 3. Base de datos

Aplica la migración inicial (crea la tabla `tournaments`, las políticas RLS y la función `join_tournament`):

```bash
supabase db push
```

O copia el contenido de [`supabase/migrations/20260607011038_init.sql`](supabase/migrations/20260607011038_init.sql) en el **SQL Editor** de Supabase y ejecútalo.

### 4. Levantar el dev server

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) 🎉

## 📜 Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con hot-reload |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | Linter (ESLint) |

## 🗂️ Estructura del proyecto

```
openchess.dev/
├── app/                      # App Router (rutas y páginas)
│   ├── page.tsx              # Landing
│   ├── dashboard/            # "Mis torneos"
│   ├── join/                 # Unirse con un código
│   ├── tournaments/[id]/     # Vista del torneo + modo display
│   ├── play/[code]/          # Vista del jugador
│   └── auth/callback/        # Callback de auth de Supabase
├── components/               # Componentes de UI (dialogs, tablas, listas…)
│   ├── ui/                   # Primitivas shadcn/ui
│   └── oc/                   # Componentes propios (marca, code input…)
├── lib/
│   ├── pairing/              # Algoritmos: swiss · roundrobin · elimination
│   ├── supabase/             # Clientes server/client
│   ├── store.ts              # Estado global (Zustand)
│   └── types.ts              # Modelos de dominio (Tournament, Player, Round…)
└── supabase/migrations/      # Esquema de la base de datos
```

## 🚢 Deploy

La forma más fácil es [Vercel](https://vercel.com/new): importa el repo, agrega las dos variables de entorno de Supabase y despliega. También puedes auto-hostear con cualquier proveedor que corra Next.js (Docker, Node, etc.).

## 🤝 Contribuir

Las contribuciones son bienvenidas. Abre un [issue](https://github.com/alxbryann/openchess.dev/issues) para discutir un cambio grande, o manda un PR directo para fixes pequeños.

```bash
# Flujo típico
git checkout -b feat/mi-mejora
# … haz tus cambios …
npm run lint
git commit -m "feat: describe tu cambio"
git push origin feat/mi-mejora
```

## 📄 Licencia

Distribuido bajo la **licencia MIT**. Consulta [`LICENSE`](LICENSE) para más detalles.

<div align="center">
<br />
<sub>Hecho para el tablero. ♟️ · © 2026 openchess.dev</sub>
</div>
