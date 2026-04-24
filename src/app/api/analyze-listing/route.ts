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
  geschaetzte_kaltmiete_pro_qm: number | null
  hat_makler: boolean | null
}

interface RequestBody {
  url?: string
  text?: string
}

const EXTRACTION_PROMPT = `Extrahiere aus diesem Immobilieninserat folgende Daten als JSON. Antworte NUR mit JSON, nichts anderes:
{
  "kaufpreis": number|null,
  "wohnflaeche": number|null,
  "zimmer": number|null,
  "baujahr": number|null,
  "plz": string|null,
  "ort": string|null,
  "bundesland": string|null,
  "objektart": string|null,
  "zustand": string|null,
  "geschaetzte_kaltmiete_pro_qm": number|null,
  "hat_makler": boolean|null
}

Regeln:
- hat_makler: true wenn Maklerprovision erwähnt wird, false wenn "provisionsfrei" oder "keine Maklerkosten", null wenn unklar
- geschaetzte_kaltmiete_pro_qm: realistische Marktmiete für diese Lage schätzen (in €/m²/Monat)
- Preise als Zahlen ohne € Zeichen
- null wenn nicht gefunden

Inseratstext:`

export async function POST(req: NextRequest) {
  console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY, 'Firecrawl Key exists:', !!process.env.FIRECRAWL_API_KEY)

  let body: RequestBody
  try {
    body = await req.json() as RequestBody
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  let content = ''

  if (body.url) {
    console.log('Received URL:', body.url)
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

      console.log('Firecrawl response status:', fcRes.status)

      if (fcRes.ok) {
        const fcData = await fcRes.json() as { data?: { markdown?: string } }
        content = fcData.data?.markdown?.trim() ?? ''
        console.log('Firecrawl content length:', content.length)
      } else {
        const errorBody = await fcRes.text()
        console.log('Firecrawl error body:', errorBody.slice(0, 500))
      }
    } catch (e) {
      console.log('Firecrawl exception:', String(e))
    }

    // Require at least 200 chars of meaningful content — less means scrape failed or got a redirect/bot page
    if (content.length < 200) {
      console.log('Firecrawl returned insufficient content:', content.length, 'chars')
      return NextResponse.json(
        { error: 'scrape_failed', message: 'Seite konnte nicht geladen werden. Bitte kopiere den Inseratstext manuell.' },
        { status: 422 },
      )
    }
  } else if (body.text?.trim()) {
    content = body.text.trim()
    console.log('Using text input, length:', content.length)
  } else {
    return NextResponse.json({ error: 'missing_input' }, { status: 400 })
  }

  content = content.slice(0, 10000)

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
        max_tokens: 512,
        messages: [{ role: 'user', content: `${EXTRACTION_PROMPT}\n${content}` }],
      }),
      signal: AbortSignal.timeout(20000),
    })
  } catch (e) {
    console.log('Claude exception:', String(e))
    return NextResponse.json(
      { error: 'claude_failed', message: String(e) },
      { status: 500 },
    )
  }

  console.log('Claude response status:', claudeRes.status)

  if (!claudeRes.ok) {
    const errorText = await claudeRes.text()
    console.log('Claude error:', errorText.slice(0, 500))
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
    console.log('Extracted data:', JSON.stringify(extracted))
  } catch {
    console.log('Parse failed, raw Claude text:', rawText.slice(0, 500))
    return NextResponse.json(
      { error: 'parse_failed', message: 'Daten konnten nicht aus dem Inserat extrahiert werden.' },
      { status: 422 },
    )
  }

  // Require a valid kaufpreis — without it the calculator is useless
  if (!extracted.kaufpreis || extracted.kaufpreis <= 0) {
    console.log('Validation failed: kaufpreis =', extracted.kaufpreis)
    return NextResponse.json(
      { error: 'parse_failed', message: 'Kaufpreis konnte nicht ermittelt werden. Bitte Text manuell einfügen.' },
      { status: 422 },
    )
  }

  const bundeslandCode = extracted.bundesland
    ? (STATE_NAME_TO_CODE[extracted.bundesland] ?? null)
    : null

  const monthlyRent =
    extracted.wohnflaeche != null && extracted.geschaetzte_kaltmiete_pro_qm != null
      ? Math.round(extracted.wohnflaeche * extracted.geschaetzte_kaltmiete_pro_qm)
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
    monthlyRent,
    grestPct,
    hatMakler: extracted.hat_makler,
  })
}
