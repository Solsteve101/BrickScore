import { NextRequest, NextResponse } from 'next/server'

const GREST_BY_STATE: Record<string, number> = {
  BW: 5.0, BY: 3.5, BE: 6.0, BB: 6.5, HB: 5.0,
  HH: 5.5, HE: 6.0, MV: 6.0, NI: 5.0, NW: 6.5,
  RP: 5.0, SL: 6.5, SN: 5.5, ST: 5.0, SH: 6.5, TH: 5.0,
}

const STATE_NAME_TO_CODE: Record<string, string> = {
  'Baden-Württemberg': 'BW',
  'Bayern': 'BY',
  'Berlin': 'BE',
  'Brandenburg': 'BB',
  'Bremen': 'HB',
  'Hamburg': 'HH',
  'Hessen': 'HE',
  'Mecklenburg-Vorpommern': 'MV',
  'Niedersachsen': 'NI',
  'Nordrhein-Westfalen': 'NW',
  'Rheinland-Pfalz': 'RP',
  'Saarland': 'SL',
  'Sachsen': 'SN',
  'Sachsen-Anhalt': 'ST',
  'Schleswig-Holstein': 'SH',
  'Thüringen': 'TH',
}

interface ClaudeExtracted {
  kaufpreis: number | null
  wohnflaeche: number | null
  zimmer: number | null
  baujahr: number | null
  plz: string | null
  ort: string | null
  bundesland: string | null
  objektart: string | null
  zustand: string | null
  hausgeld: number | null
  monatsmiete: number | null
  hat_makler: boolean
  etage: number | null
  stellplatz: string | null
}

interface RequestBody {
  url?: string
  text?: string
}

interface IS24Obj {
  obj_purchasePrice?: string
  obj_rentSubsidy?: string
  obj_livingSpace?: string
  obj_noRooms?: string
  obj_yearConstructed?: string
  obj_zipCode?: string
  obj_regio1?: string
  obj_regio2?: string
  obj_regio3?: string
  obj_regio4?: string
  obj_courtage?: string
  obj_thermalChar?: string
  obj_cellar?: string
  obj_balcony?: string
  obj_purchasePriceRange?: string
  obj_noRoomsRange?: string
  obj_typeOfFlat?: string
  obj_floor?: string
  obj_condition?: string
}

interface PreExtracted {
  kaufpreis: number | null
  hausgeld: number | null
  wohnflaeche: number | null
  zimmer: number | null
  baujahr: number | null
  plz: string | null
  ort: string | null
  bundesland: string | null
  etage: number | null
  energiekennwert: number | null
  keller: boolean | null
  balkon: boolean | null
  hat_makler: boolean | null
  wohnungstyp: string | null
  zustand: string | null
}

/**
 * ImmoScout24 sometimes returns a raw analytics JSON blob via Firecrawl
 * (no rendered listing markup). This blob carries Hausgeld as
 * `obj_rentSubsidy` and most other key fields as `obj_*` strings, often
 * with backslash-escaped underscores from the markdown converter.
 */
function tryParseIS24Json(content: string): PreExtracted | null {
  const trimmed = content.trim()
  if (!trimmed.startsWith('{')) return null
  const unescaped = trimmed.replace(/\\_/g, '_')
  let obj: IS24Obj
  try {
    obj = JSON.parse(unescaped) as IS24Obj
  } catch {
    return null
  }
  if (!obj.obj_purchasePrice && !obj.obj_livingSpace) return null

  const num = (s: string | undefined): number | null => {
    if (!s) return null
    const n = Number(s)
    return Number.isFinite(n) ? n : null
  }
  const yesNo = (s: string | undefined): boolean | null => {
    if (s === 'y') return true
    if (s === 'n') return false
    return null
  }

  return {
    kaufpreis: num(obj.obj_purchasePrice),
    hausgeld: num(obj.obj_rentSubsidy),
    wohnflaeche: num(obj.obj_livingSpace),
    zimmer: num(obj.obj_noRooms),
    baujahr: num(obj.obj_yearConstructed),
    plz: obj.obj_zipCode ?? null,
    ort: obj.obj_regio2 ?? null,
    bundesland: obj.obj_regio1?.replace(/_/g, '-') ?? null,
    etage: num(obj.obj_floor),
    energiekennwert: num(obj.obj_thermalChar),
    keller: yesNo(obj.obj_cellar),
    balkon: yesNo(obj.obj_balcony),
    hat_makler: yesNo(obj.obj_courtage),
    wohnungstyp: obj.obj_typeOfFlat ?? null,
    zustand: obj.obj_condition && obj.obj_condition !== 'no_information' ? obj.obj_condition : null,
  }
}

function buildPreExtractedHint(p: PreExtracted): string {
  const lines: string[] = []
  const push = (label: string, val: string | number | boolean | null) => {
    if (val === null || val === undefined) return
    lines.push(`- ${label}: ${val}`)
  }
  push('kaufpreis', p.kaufpreis)
  push('hausgeld', p.hausgeld)
  push('wohnflaeche', p.wohnflaeche)
  push('zimmer', p.zimmer)
  push('baujahr', p.baujahr)
  push('plz', p.plz)
  push('ort', p.ort)
  push('bundesland', p.bundesland)
  push('etage', p.etage)
  push('hat_makler', p.hat_makler)
  if (lines.length === 0) return ''
  return `HINWEIS — Folgende Werte wurden bereits aus dem strukturierten JSON-Objekt der Plattform extrahiert. Übernimm sie genau so, es sei denn der Inseratstext zeigt einen offensichtlich präziseren Wert:\n${lines.join('\n')}\n\n`
}

const EXTRACTION_PROMPT = `Du bist ein präziser Immobilien-Daten-Extraktor für den deutschen Markt. Analysiere den folgenden Inseratstext und extrahiere ALLE verfügbaren Daten.

WICHTIG:
- Antworte NUR mit validem JSON, kein anderer Text, keine Erklärungen
- Suche GRÜNDLICH nach jedem einzelnen Feld
- Wenn ein Wert nicht gefunden wird, setze null

DEUTSCHE ZAHLENFORMATE:
- Komma = Dezimaltrennzeichen: '289,50 €' bedeutet 289.50 Euro (NICHT 28950)
- Punkt = Tausendertrennzeichen: '1.245 €' bedeutet 1245 Euro (NICHT 1.245)
- Kombiniert: '1.289,50 €' bedeutet 1289.50 Euro
- Gib alle Werte als reine Zahlen zurück OHNE Währungszeichen, OHNE Tausenderpunkte
- Beispiele: 249000 statt 249.000 — 289.50 statt 289,50 — 1289.50 statt 1.289,50

SUCHHINWEISE für schwer zu findende Felder:
- hausgeld: Wird auch genannt als 'Hausgeld', 'monatliches Hausgeld', 'Wohngeld', 'Nebenkosten (Hausgeld)', 'Betriebskosten', 'Bewirtschaftungskosten', 'mtl. Hausgeld', 'Hausgeld inkl.', oder steht unter 'Kosten' / 'Monatliche Kosten'
- wohnflaeche: Wird auch genannt als 'Wohnfläche ca.', 'Wfl.', 'ca. X m²', 'Quadratmeter'
- kaufpreis: Wird auch genannt als 'Kaufpreis', 'Preis', 'Angebotspreis', 'Verkaufspreis'
- zimmer: Wird auch genannt als 'Zi.', 'Zimmer', 'Räume', kann Dezimalzahlen sein wie 1,5 oder 2,5
- baujahr: Wird auch genannt als 'Baujahr', 'Bj.', 'erbaut', 'Fertigstellung'
- monatsmiete: Wird auch genannt als 'Kaltmiete', 'Nettokaltmiete', 'Mieteinnahmen', 'mtl. Mieteinnahmen', 'Ist-Miete', 'Soll-Miete'. Bei Kapitalanlage-Inseraten steht oft eine tatsächliche Miete drin. NIEMALS schätzen — wenn keine konkrete Miete im Text steht, setze null.
- hat_makler: Suche nach 'provisionsfrei', 'keine Maklerprovision', 'keine Provision', 'ohne Provision' (dann false). Suche nach 'Provision', 'Käuferprovision', 'Maklerprovision', 'Courtage' (dann true). Wenn nichts gefunden wird, setze true als Default.
- laufende_kosten: Suche nach 'nicht umlagefähige Kosten', 'Instandhaltungsrücklage', 'Verwaltungskosten'

HAUSGELD-EXTRAKTION (KRITISCHES FELD — besonders sorgfältig!):
- Hausgeld steht bei ImmoScout24 fast immer in einer Markdown-Tabelle unter der Sektion 'Kosten' mit | Pipe-Trennern
- Wenn 'Hausgeld jährlich' angegeben ist: durch 12 teilen und den Monatswert zurückgeben
  Beispiel: 'Hausgeld jährlich: 3.420 €' → hausgeld = 285
- 'Hausgeld inkl. Heizung 350 €' → hausgeld = 350 (Heizung ist bereits drin)
- 'Hausgeld zzgl. Heizung 180 €' → hausgeld = 180 (Heizung wird separat berechnet)
- Hausgeld ist IMMER der monatliche Betrag in Euro (jährliche Werte umrechnen)
- Hausgeld ist NICHT die Provision, NICHT die Grunderwerbsteuer, NICHT die Notarkosten

TABELLEN-FORMAT:
- Firecrawl liefert IS24-Kosten oft als Markdown-Tabelle: | Label | Wert |
- Parse diese Tabellen sorgfältig — Kaufpreis, Provision, Hausgeld, Grunderwerbsteuer und Notar stehen oft direkt untereinander
- Jedes Feld muss dem RICHTIGEN JSON-Key zugeordnet werden — NICHT verwechseln!
- Lies in Tabellenzeilen das Label (linke Zelle) und nimm den dazugehörigen Wert (rechte Zelle)

NEGATIVBEISPIELE (häufige Verwechslungsgefahren):
- Provision ist NICHT Hausgeld
- Grunderwerbsteuer ist NICHT Hausgeld
- Notarkosten sind NICHT Hausgeld
- Kaufpreis ist NICHT Nebenkosten
- Kaltmiete ist NICHT Warmmiete (für monatsmiete IMMER die Kaltmiete nehmen)
- 'Gesamtkosten' / 'Erwerbskosten' sind NICHT der Kaufpreis (das ist Kaufpreis + Nebenkosten)

JSON-Format:
{
  "kaufpreis": number | null,
  "wohnflaeche": number | null,
  "zimmer": number | null,
  "baujahr": number | null,
  "plz": "string" | null,
  "ort": "string" | null,
  "bundesland": "string" | null,
  "objektart": "string" | null,
  "zustand": "string" | null,
  "hausgeld": number | null,
  "monatsmiete": number | null,
  "hat_makler": boolean,
  "etage": number | null,
  "stellplatz": "string" | null
}

REGELN:
- hausgeld ist der MONATLICHE Betrag in Euro (jährliche Angaben durch 12 teilen)
- monatsmiete: NUR ausfüllen wenn eine konkrete Monatsmiete im Inserat steht. Niemals schätzen oder ableiten — sonst null.
- Bei Bundesland: Immer den vollen Namen (z.B. 'Nordrhein-Westfalen' nicht 'NRW')
- hat_makler: Default ist true, nur false wenn explizit provisionsfrei steht

Inseratstext:`

export async function POST(req: NextRequest) {
  let body: RequestBody
  try {
    body = await req.json() as RequestBody
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  let content = ''

  if (body.url) {
    try {
      const fcRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        },
        body: JSON.stringify({ url: body.url, formats: ['markdown'] }),
        signal: AbortSignal.timeout(25000),
      })

      if (fcRes.ok) {
        const fcData = await fcRes.json() as { data?: { markdown?: string } }
        content = fcData.data?.markdown?.trim() ?? ''
      }
    } catch {
      // fall through to length check below
    }

    // Require at least 200 chars of meaningful content — less means scrape failed or got a redirect/bot page
    if (content.length < 200) {
      return NextResponse.json(
        { error: 'scrape_failed', message: 'Seite konnte nicht geladen werden. Bitte kopiere den Inseratstext manuell.' },
        { status: 422 },
      )
    }
  } else if (body.text?.trim()) {
    content = body.text.trim()
  } else {
    return NextResponse.json({ error: 'missing_input' }, { status: 400 })
  }

  content = content.slice(0, 20000)

  // Pre-parse IS24 analytics blob (when Firecrawl returned the obj_* JSON
  // dump instead of the rendered listing). Gives Claude a high-confidence
  // reference for fields like Hausgeld that aren't in the visible text.
  const preExtracted = tryParseIS24Json(content)
  const preHint = preExtracted ? buildPreExtractedHint(preExtracted) : ''

  let claudeRes: Response
  try {
    claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        messages: [{ role: 'user', content: `${EXTRACTION_PROMPT}\n\n${preHint}${content}` }],
      }),
      signal: AbortSignal.timeout(20000),
    })
  } catch (e) {
    return NextResponse.json(
      { error: 'claude_failed', message: String(e) },
      { status: 500 },
    )
  }

  if (!claudeRes.ok) {
    const errorText = await claudeRes.text()
    return NextResponse.json(
      { error: 'claude_failed', message: errorText },
      { status: 500 },
    )
  }

  const claudeData = await claudeRes.json() as { content?: { type: string; text: string }[] }
  const rawText = claudeData.content?.[0]?.text?.trim() ?? ''

  let extracted: ClaudeExtracted
  try {
    const codeBlock = rawText.match(/```(?:json)?\s*([\s\S]*?)```/)
    const jsonStr = codeBlock ? codeBlock[1].trim() : rawText
    extracted = JSON.parse(jsonStr) as ClaudeExtracted
  } catch {
    return NextResponse.json(
      { error: 'parse_failed', message: 'Daten konnten nicht aus dem Inserat extrahiert werden.' },
      { status: 422 },
    )
  }

  // Require a valid kaufpreis — without it the calculator is useless
  if (!extracted.kaufpreis || extracted.kaufpreis <= 0) {
    return NextResponse.json(
      { error: 'parse_failed', message: 'Automatisches Auslesen nicht möglich.' },
      { status: 422 },
    )
  }

  const bundeslandCode = extracted.bundesland
    ? (STATE_NAME_TO_CODE[extracted.bundesland] ?? null)
    : null

  // Only use rent if it was explicitly stated in the listing — never estimate
  const monthlyRent: number | null =
    extracted.monatsmiete != null && extracted.monatsmiete > 0
      ? Math.round(extracted.monatsmiete)
      : null

  const grestPct = bundeslandCode ? (GREST_BY_STATE[bundeslandCode] ?? null) : null

  return NextResponse.json({
    kaufpreis: extracted.kaufpreis,
    wohnflaeche: extracted.wohnflaeche,
    zimmer: extracted.zimmer,
    baujahr: extracted.baujahr,
    plz: extracted.plz,
    ort: extracted.ort,
    bundesland: extracted.bundesland,
    bundeslandCode,
    objektart: extracted.objektart,
    zustand: extracted.zustand,
    hausgeld: extracted.hausgeld,
    monthlyRent,
    grestPct,
    hatMakler: extracted.hat_makler,
  })
}
