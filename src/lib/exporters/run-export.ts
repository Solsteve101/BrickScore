import type { CalcInputs, CalcResult, ProjectionRow } from '../calculator-engine'
import { exportPdf } from './pdf-export'
import { exportXlsx } from './xlsx-export'
import { exportPng } from './png-export'
import {
  blobToBase64,
  isWithinPersistLimit,
  saveExport,
  triggerDownload,
  type ExportFormatKey,
} from '../exports-store'
import { spendTokens, hasTokens, getUsage, type UsagePlan } from '../usage-store'

export interface RunExportInput {
  format: ExportFormatKey
  titel: string
  link: string
  bilder: string[]
  inputs: CalcInputs
  result: CalcResult
  projection: ProjectionRow[]
  termYr: number
  score: number
  verdict: string
  pngTargetId: string
  /** When provided, the export is persisted to localStorage tied to this deal. */
  dealId?: string | null
}

export async function runExport(input: RunExportInput): Promise<{ filename: string; persisted: boolean; truncated: boolean }> {
  const { format, dealId, pngTargetId, ...rest } = input

  if (!hasTokens('export')) {
    throw new Error('Nicht genug Tokens für einen Export. Warte bis Montag oder upgrade auf Pro.')
  }

  const plan: UsagePlan = getUsage().plan

  const result =
    format === 'pdf'
      ? await exportPdf({ ...rest, plan })
      : format === 'xlsx'
        ? exportXlsx({
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
        : await exportPng({
            pngTargetId,
            titel: rest.titel,
            inputs: rest.inputs,
            result: rest.result,
            score: rest.score,
            verdict: rest.verdict,
            link: rest.link,
            plan,
          })

  triggerDownload(result.blob, result.filename)
  spendTokens('export', `${format.toUpperCase()} · ${rest.titel || 'Deal'}`)

  let persisted = false
  let truncated = false
  if (dealId) {
    const fits = isWithinPersistLimit(result.blob.size)
    const daten = fits ? await blobToBase64(result.blob) : null
    truncated = !fits
    saveExport({
      deal_id: dealId,
      format,
      dateiname: result.filename,
      daten,
    })
    persisted = true
  }

  return { filename: result.filename, persisted, truncated }
}
