export type ToastVariant = 'info' | 'warning' | 'success' | 'error'

export interface ToastAction {
  label: string
  href: string
}

export interface ToastInput {
  variant: ToastVariant
  message: string
  title?: string
  action?: ToastAction
  /** When true, the toast does not auto-dismiss. Defaults to false (auto-dismiss after 6s). */
  persistent?: boolean
  /** Override auto-dismiss duration in ms. Ignored when persistent. */
  durationMs?: number
  /** Deduplication key — when set, replaces any existing toast with the same key. */
  key?: string
}

export interface ToastItem extends ToastInput {
  id: string
}

type Action =
  | { type: 'add'; toast: ToastItem }
  | { type: 'remove'; id: string }

type Listener = (action: Action) => void

const listeners = new Set<Listener>()

function emit(action: Action): void {
  for (const l of listeners) l(action)
}

export function subscribeToasts(l: Listener): () => void {
  listeners.add(l)
  return () => { listeners.delete(l) }
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function pushToast(input: ToastInput): string {
  const id = makeId()
  emit({ type: 'add', toast: { ...input, id } })
  return id
}

export function dismissToast(id: string): void {
  emit({ type: 'remove', id })
}
