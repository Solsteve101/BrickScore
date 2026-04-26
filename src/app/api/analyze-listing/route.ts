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

const EXTRACTION_PROMPT = `Du bist ein präziser Immobilien-Daten-Extraktor für den deutschen Markt. Analysiere den folgenden Inseratstext und extrahiere ALLE verfügbaren Daten.

WICHTIG:
- Antworte NUR mit validem JSON, kein anderer Text, keine Erklärungen
- Alle Preise als Zahlen ohne € Zeichen und ohne Punkte als Tausendertrenner (also 249000 statt 249.000)
- Suche GRÜNDLICH nach jedem einzelnen Feld
- Wenn ein Wert nicht gefunden wird, setze null

SUCHHINWEISE für schwer zu findende Felder:
- hausgeld: Wird auch genannt als 'Hausgeld', 'monatliches Hausgeld', 'Wohngeld', 'Nebenkosten (Hausgeld)', 'Betriebskosten', 'Bewirtschaftungskosten', 'mtl. Hausgeld', 'Hausgeld inkl.', oder steht unter 'Kosten' / 'Monatliche Kosten'
- wohnflaeche: Wird auch genannt als 'Wohnfläche ca.', 'Wfl.', 'ca. X m²', 'Quadratmeter'
- kaufpreis: Wird auch genannt als 'Kaufpreis', 'Preis', 'Angebotspreis', 'Verkaufspreis'
- zimmer: Wird auch genannt als 'Zi.', 'Zimmer', 'Räume', kann Dezimalzahlen sein wie 1,5 oder 2,5
- baujahr: Wird auch genannt als 'Baujahr', 'Bj.', 'erbaut', 'Fertigstellung'
- monatsmiete: Wird auch genannt als 'Kaltmiete', 'Nettokaltmiete', 'Mieteinnahmen', 'mtl. Mieteinnahmen', 'Ist-Miete', 'Soll-Miete'. Bei Kapitalanlage-Inseraten steht oft eine tatsächliche Miete drin. NIEMALS schätzen — wenn keine konkrete Miete im Text steht, setze null.
- hat_makler: Suche nach 'provisionsfrei', 'keine Maklerprovision', 'keine Provision', 'ohne Provision' (dann false). Suche nach 'Provision', 'Käuferprovision', 'Maklerprovision', 'Courtage' (dann true). Wenn nichts gefunden wird, setze true als Default.
- laufende_kosten: Suche nach 'nicht umlagefähige Kosten', 'Instandhaltungsrücklage', 'Verwaltungskosten'

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
- hausgeld ist der MONATLICHE Betrag in Euro
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
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        messages: [{ role: 'user', content: `${EXTRACTION_PROMPT}\n${content}` }],
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
      { error: 'parse_failed', message: 'Kaufpreis konnte nicht ermittelt werden. Bitte Text manuell einfügen.' },
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
