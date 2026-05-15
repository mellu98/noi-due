# NoiDue — System Design Document (SDD)

> Documento di architettura e design per l'app NoiDue. Da usare come base per analisi, refactor e orchestrazione agenti.

---

## 1. Project Overview

**NoiDue** è una webapp PWA privata per coppie, pensata per pianificare tempo di qualità insieme tramite un calendario condiviso basato sulla **regola 2/2/2**:

- Ogni 2 settimane: un vero appuntamento
- Ogni 2 mesi: una piccola fuga / weekend
- Ogni 2 anni: un viaggio importante

L'app è ottimizzata per mobile (max-width 768px, layout mobile-first) e deployata su Render.

---

## 2. Tech Stack

| Layer | Tecnologia | Versione |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.6 |
| Runtime | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.3.0 |
| UI Kit | **shadcn/ui** (inizializzato, componenti in `components/ui/`) | latest |
| Icons | Lucide React | 1.16.0 |
| Auth & DB | Supabase | 2.105.4 |
| Date Utils | date-fns | 4.1.0 |
| Utilities | clsx, tailwind-merge, class-variance-authority | latest |
| Package Manager | bun | 1.3.11 |
| Build Output | standalone | — |

**Nota critica:** il progetto usa Tailwind CSS v4 con configurazione `@theme inline` in CSS. shadcn/ui è stato inizializzato con supporto v4. Il tema custom warm (rosa/pesca/lavanda) è preservato.

---

## 3. Architecture Overview

### App Router (Next.js 16)
- **Server Components** per pagine protette che leggono dati (`page.tsx` in `(app)/`)
- **Client Components** (`'use client'`) per interattività, form, API calls
- **API Routes** (`app/api/*/route.ts`) per operazioni CRUD lato server con Supabase Service Role

### Authentication Pattern
- **Client-side auth** via Supabase Auth (localStorage + cookie bridge)
- Il middleware (`middleware.ts`) è attualmente un pass-through (no server-side auth check)
- Dopo login/signup, il token viene salvato in cookie `sb-auth-token` per permettere ai Server Component di fare query autenticate
- Il client Supabase browser inietta il token JWT nelle richieste fetch via custom `global.fetch`

### Data Flow
```
Browser → Supabase Auth (localStorage)
        → Cookie sb-auth-token
        → Server Components leggono cookie → query Supabase
        → Client Components chiamano API Routes → Supabase Service Role
```

---

## 4. Directory Structure

```
noi-due/
├── app/
│   (app)/                    # Route group protette (con AppShell + BottomNav)
│   │   page.tsx              # Dashboard (Server Component)
│   │   layout.tsx            # Client layout: auth cookie sync + AppShell
│   │   budget/page.tsx
│   │   calendar/page.tsx
│   │   ideas/page.tsx
│   │   memories/page.tsx
│   │   notifications/page.tsx
│   │   settings/page.tsx
│   │   events/new/page.tsx
│   │   events/[id]/page.tsx
│   (auth)/                   # Route group auth pubblica
│   │   login/page.tsx
│   │   signup/page.tsx
│   api/                      # API Routes server-side
│   │   admin/fix-policy/
│   │   checklist/[id]/
│   │   couples/
│   │   couples/join/
│   │   events/
│   │   events/[id]/
│   │   ideas/
│   │   memories/
│   │   notifications/
│   │   settings/
│   onboarding/page.tsx       # Creazione o ingresso coppia
│   logout/page.tsx
│   layout.tsx                # Root layout (font, metadata)
│   globals.css               # Tailwind v4 theme variables
├── components/app/           # Componenti UI custom dell'app
│   AppShell.tsx
│   BottomNavigation.tsx
│   CountdownCard.tsx
│   CoupleInviteCard.tsx
│   DaysTogetherCard.tsx
│   EmptyState.tsx
│   EventCard.tsx
│   IdeaCard.tsx
│   LoadingState.tsx
│   MemoryCard.tsx
│   NotificationBell.tsx
│   RandomIdeaButton.tsx
│   RitualStatusCard.tsx
│   TutorialOverlay.tsx
├── lib/
│   hooks/
│   │   useSwipeNavigation.ts
│   supabase/
│   │   client.ts             # Browser client con token injection
│   │   server.ts             # Server client con cookie auth
│   utils/
│   │   cn.ts                 # clsx + tailwind-merge
│   │   dates.ts              # date-fns helpers
│   │   222-rule.ts           # Logica regola 2/2/2
│   │   notifications.ts      # Helper per notifiche in-app
├── types/
│   index.ts                  # TypeScript domain types
│   supabase.ts               # (se presente) tipi generati
├── supabase/
│   schema.sql                # Schema completo DB + RLS
├── public/
├── package.json
├── next.config.js            # output: 'standalone'
├── tsconfig.json
├── middleware.ts
└── DESIGN.md                 # Questo file
```

---

## 5. Database Schema (Supabase)

### Tabelle

| Tabella | Scopo | RLS |
|---|---|---|
| `profiles` | Profilo utente (nome, avatar) | ✅ |
| `couples` | Coppia (nome, codice invito) | ✅ |
| `couple_members` | Appartenenza utente a coppia | ✅ |
| `events` | Eventi calendario | ✅ |
| `event_checklist_items` | Checklist associata a evento | ✅ |
| `date_ideas` | Idee per appuntamenti | ✅ |
| `memories` | Ricordi (foto, note) di eventi completati | ✅ |
| `reminders` | Promemoria eventi | ✅ |
| `notifications` | Notifiche in-app (nuova, da attivare su DB) | ✅ |

### Auth
- Supabase Auth con email/password
- Trigger `on_auth_user_created` crea automaticamente riga in `profiles`
- Row Level Security (RLS) su tutte le tabelle con policy basate su `auth.uid()`

---

## 6. Component Architecture

### Layout Hierarchy
```
RootLayout
└── (app)/layout.tsx     [Client] sync auth cookie
    └── AppShell         [Client]
        ├── NotificationBell  [Client] polling notifiche
        ├── <main>            contenuto pagina
        │   ├── page.tsx      [Server o Client]
        │   └── ...
        └── BottomNavigation  [Client] prefetch + swipe
```

### Styling Pattern
- **NO design system esterno** — tutti i componenti sono custom
- Ogni componente usa classi Tailwind inline (es. `rounded-2xl border border-border bg-card p-4`)
- **Tema warm/romantic** con colori pastello:
  - Primary: `#e8927c` (corallo/pesca)
  - Secondary: `#c4a8d0` (lavanda)
  - Accent: `#e8cfa8` (sabbia)
  - Background: `#fff8f5` (panna caldo)
- **NO dark mode toggle** — il tema è single-theme (warm light)
- Bordi arrotondati ovunque (`rounded-xl`, `rounded-2xl`)
- Layout mobile-first con `max-w-md` centrato

---

## 7. API Routes

Tutte le API usano Supabase **Service Role Key** per bypassare RLS lato server.

| Route | Metodi | Scopo |
|---|---|---|
| `/api/couples` | POST | Crea coppia |
| `/api/couples/join` | POST | Unisciti a coppia con codice |
| `/api/events` | POST | Crea evento + checklist |
| `/api/events/[id]` | GET, PATCH, DELETE | Dettaglio, completa, elimina |
| `/api/checklist/[id]` | PATCH | Toggle item checklist |
| `/api/ideas` | GET, POST | Lista e crea idee |
| `/api/memories` | POST | Crea/aggiorna ricordo |
| `/api/settings` | GET | Dati coppia |
| `/api/notifications` | GET, PATCH | Lista notifiche, segna lette |
| `/api/admin/fix-policy` | — | Route debug (legacy) |

---

## 8. State Management

- **NO global state library** (no Zustand, Redux, Context)
- Stato locale con `useState` nei Client Components
- Auth state gestito da Supabase Auth + cookie bridge
- Notifiche: polling client-side ogni 10s
- Tutorial: `localStorage` flag

---

## 9. Known Issues & Technical Debt

| # | Problema | Impatto | Soluzione ideale |
|---|---|---|---|
| 1 | ~~NO shadcn/ui~~ | ✅ **RISOLTO** — shadcn/ui inizializzato con Tailwind v4 | Usare i componenti per il refactor |
| 2 | **Tailwind v4** | Compatibilità limitata con molte librerie UI (shadcn incluso) | Valutare downgrade a v3 o usare shadcn v4-compat |
| 3 | **Auth middleware pass-through** | Nessuna protezione SSR, rotte protette sono "trust client" | Implementare auth server-side nel middleware |
| 4 | **user_id passato nei body API** | Sicurezza: chiunque può spoofare un altro user_id | Usare sessione server-side per identificare l'utente |
| 5 | **NO animazioni** | UX statica e poco immersiva | Aggiungere Framer Motion, page transitions, micro-interactions |
| 6 | **Tema single-theme** | Nessuna dark mode, nessuna personalizzazione | Aggiungere dark mode o theme switcher |
| 7 | **NO PWA manifest/service worker** | Non installabile come app nativa | Aggiungere manifest.json + service worker |
| 8 | **Bottom nav visibile su auth pages** | Se errore, può mostrarsi fuori contesto | Condizionare AppShell alle route protette |
| 9 | **Gestione errori API generica** | Messaggi generici, no retry logic | Aggiungere toast notifications + error boundaries |
| 10 | **Tutti gli input sono HTML nativi** | No componenti form riutilizzabili, no validation UX | Creare Input, Textarea, Select con shadcn/ui |

---

## 10. Future Improvements / Refactor Targets

### A. UI/UX Immersiva (Priorità Alta)
- ✅ **shadcn/ui inizializzato** — Componenti disponibili: Button, Card, Input, Textarea, Label, Dialog, Sheet, Badge, Avatar, Separator, Tabs, Sonner (toast)
- **Framer Motion** per:
  - Page transitions (slide tra tab)
  - Micro-interactions (press su bottoni, card flip)
  - Stagger animations su liste
- **Confetti / celebration effects** al completamento evento
- **Glassmorphism / neumorphism** leggero su card e nav
- **Gradient backgrounds** dinamici in base al tipo di evento

### B. PWA & Mobile Experience
- `manifest.json` con theme color, icons, display standalone
- Service worker per offline cache
- Splash screen iOS/Android
- Haptic feedback su azioni importanti (se disponibile)

### C. Theme System
- Dark mode romantica (toni scuri con accenti caldi)
- Theme selector per la coppia (es. "Rosa & Lavanda", "Blu & Oro", "Minimal")
- CSS variables dynamiche

### D. Performance
- Image optimization per foto ricordi (Next.js Image)
- Virtual scrolling se liste crescono
- React Query / SWR per caching e stale-while-revalidate

### E. Code Quality
- ESLint + Prettier configurati correttamente
- Storybook per componenti UI
- Test E2E con Playwright (flussi critici: signup → crea coppia → evento → ricordo)

---

## 11. shadcn/ui Migration Notes

**Stato attuale:** shadcn/ui NON è inizializzato (`components.json` mancante).

**Situazione Tailwind v4:**
- Tailwind v4 usa `@import "tailwindcss"` + `@theme inline` in CSS
- shadcn/ui ha supporto sperimentale per v4 ma richiede attenzione
- Le classi shadcn usano spesso nomi di colori che potrebbero confliggere con il tema custom attuale

**Strategie possibili:**
1. **Inizializzare shadcn v4** direttamente (se il CLI lo supporta) e adattare il tema
2. **Downgrade a Tailwind v3** + init shadcn standard, poi migrare componenti
3. **Usare Radix UI + CVA manualmente** senza shadcn CLI, mantenendo v4

**Consiglio:** la strategia 1 è ideale se funziona; altrimenti la 2 è la più sicura per avere l'ecosistema shadcn completo.

---

*Documento versione 1.0 — Generato per orchestrazione agenti di analisi e refactor.*
