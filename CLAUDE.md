# CLAUDE.md — BrickScore

## Projekt
BrickScore ist eine Immobilien-Investment Analyse Plattform für den deutschen Markt (€).

## Tech Stack
- Next.js 14 (App Router)
- TypeScript (strict)
- Tailwind CSS
- shadcn/ui
- Recharts (Charts)
- Lucide React (Icons)

## Sprache
- UI und Labels: Deutsch
- Code, Variablen, Kommentare: Englisch
- Zahlenformat: deutsches Format (Punkt als Tausender, Komma als Dezimal)
- Währung: immer Euro (€)

## Code-Regeln
- Functional Components mit TypeScript
- Keine "any" Types — immer explizit typen
- Hooks in src/hooks/, Utilities in src/lib/
- Komponenten: eine Datei pro Komponente
- API Routes in src/app/api/
- Keine unnötigen Dependencies installieren

## Struktur
- Seiten in src/app/
- Wiederverwendbare Komponenten in src/components/
- Feature-spezifische Komponenten in Unterordnern (z.B. components/calculator/)
- Layouts und Navigation in components/layout/

## Git
- Commit Messages: kurz, auf Englisch, beschreibend
- Vor jedem Commit: Code muss fehlerfrei kompilieren

## Wichtig
- Keine hardcodierten Farben oder Werte verstreut im Code — zentral definieren
- Kein console.log in Production Code
- Responsives Design beachten
- API Keys nur über .env.local, niemals im Code
