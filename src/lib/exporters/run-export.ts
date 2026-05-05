import type { CalcInputs, CalcResult, ProjectionRow } from '../calculator-engine'
import { exportPdf } from './pdf-export'
import { exportXlsx } from './xlsx-export'
import {
  blobToBase64,
  isWithinPersistLimit,
  saveExport,
  triggerDownload,
} from '../exports-store'
import { spendTokens, getUsage, type UsagePlan } from '../usage-store'

export type ExportableFormat = 'pdf' | 'xlsx'

export interface RunExportInput {
  format: ExportableFormat
  titel: string
  link: string
  bilder: string[]
  inputs: CalcInputs
  result: CalcResult
  projection: ProjectionRow[]
  termYr: number
  score: number
  verdict: string
  /** When provided, the export is persisted to localStorage tied to this deal. */
  dealId?: string | null
}

export async function runExport(input: RunExportInput): Promise<{ filename: string; persisted: boolean; truncated: boolean }> {
  const { format, dealId, ...rest } = input

  const usage = await getUsage()
  if (usage.tokens_remaining < 2) {
    throw new Error('Nutzungslimit erreicht. Erneuert sich am Montag oder jetzt upgraden.')
  }
  const plan: UsagePlan = usage.plan

  const result =
    format === 'pdf'
      ? await exportPdf({ ...rest, plan })
      : exportXlsx({
          titel: rest.titel,
          inputs: rest.inputs,
          result: rest.result,
          projection: rest.projection,
          termYr: rest.termYr,
          score: rest.score,
          verdict: rest.verdict,
          link: rest.link,
          plan,
        })

  triggerDownload(result.blob, result.filename)
  await spendTokens('export', `${format.toUpperCase()} · ${rest.titel || 'Deal'}`)

  let persisted = false
  let truncated = false
  if (dealId) {
    const fits = isWithinPersistLimit(result.blob.size)
    const daten = fits ? await blobToBase64(result.blob) : null
    truncated = !fits
    await saveExport({
      deal_id: dealId,
      format,
      dateiname: result.filename,
      daten,
    })
    persisted = true
  }

  return { filename: result.filename, persisted, truncated }
}
