# NoiDue

Webapp privata per coppie, pensata per pianificare tempo di qualità insieme tramite un calendario condiviso basato sulla regola 2/2/2.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth, Database, Storage)

## Setup locale

1. Clona il repository
2. Copia `.env.example` in `.env.local` e inserisci le variabili Supabase
3. Installa le dipendenze:
   ```bash
   npm install
   ```
4. Avvia in sviluppo:
   ```bash
   npm run dev
   ```
5. Apri [http://localhost:3000](http://localhost:3000)

## Configurazione Supabase

1. Crea un nuovo progetto su [Supabase](https://supabase.com)
2. Vai nell'editor SQL e incolla il contenuto di `supabase/schema.sql`
3. Esegui lo script per creare tabelle, policy RLS e trigger
4. Crea un bucket Storage chiamato `memories` con accesso privato
5. Copia URL e chiavi anon nelle variabili ambiente

## Deploy su Render

1. Crea un nuovo **Web Service** su Render
2. Collega il repository Git
3. Imposta:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Aggiungi le variabili ambiente da `.env.example`
5. Avvia il deploy

## Regola 2/2/2

- Ogni 2 settimane: un vero appuntamento
- Ogni 2 mesi: una piccola fuga / weekend
- Ogni 2 anni: un viaggio importante

## Struttura

```
app/
  (auth)/        # Login e signup
  (app)/         # Pagine protette
  onboarding/    # Creazione o ingresso coppia
components/
  app/           # Componenti UI
lib/
  supabase/      # Client browser e server
  utils/         # Helper date e regola 2/2/2
supabase/
  schema.sql     # Schema completo
```
