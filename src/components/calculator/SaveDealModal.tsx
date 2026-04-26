'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface SaveDealModalProps {
  open: boolean
  onClose: () => void
  defaultLink: string
  onSave: (data: { titel: string; link: string; notizen: string; bilder: string[] }) => void
}

const MAX_IMAGES = 5
const MAX_BYTES = 5 * 1024 * 1024

export default function SaveDealModal({ open, onClose, defaultLink, onSave }: SaveDealModalProps) {
  const [titel, setTitel] = useState('')
  const [link, setLink] = useState('')
  const [notizen, setNotizen] = useState('')
  const [bilder, setBilder] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTitel('')
      setLink(defaultLink || '')
      setNotizen('')
      setBilder([])
      setError(null)
    }
  }, [open, defaultLink])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setError(null)
    const arr = Array.from(files)
    const accepted = arr.filter((f) => /^image\/(jpeg|jpg|png|webp)$/.test(f.type))
    if (accepted.length !== arr.length) {
      setError('Nur JPG, PNG oder WebP erlaubt.')
    }
    const next: string[] = []
    for (const f of accepted) {
      if (next.length + bilder.length >= MAX_IMAGES) {
        setError(`Maximal ${MAX_IMAGES} Bilder.`)
        break
      }
      if (f.size > MAX_BYTES) {
        setError('Maximal 5 MB pro Bild.')
        continue
      }
      const dataUrl = await readAsDataUrl(f)
      next.push(dataUrl)
    }
    if (next.length) setBilder((b) => [...b, ...next])
  }, [bilder.length])

  if (!open) return null

  const canSave = titel.trim().length > 0

  return (
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'v-fade-in 160ms ease',
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: 560,
          background: '#1C1C1C',
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
          color: '#f7f7f4',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px 26px 22px',
          display: 'flex', flexDirection: 'column', gap: 18,
          animation: 'v-pop-in 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <style>{`
          @keyframes v-pop-in { from { transform: scale(0.96); opacity: 0 } to { transform: scale(1); opacity: 1 } }
          @keyframes v-fade-in { from { opacity: 0 } to { opacity: 1 } }
        `}</style>

        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, font: '700 20px/1.2 var(--font-dm-sans), sans-serif', color: '#ffffff', letterSpacing: '-0.4px' }}>
            Deal speichern
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            style={{ width: 28, height: 28, padding: 0, border: 'none', background: 'rgba(255,255,255,0.06)', color: 'rgba(247,247,244,0.7)', cursor: 'pointer', borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <DarkField label="Titel *">
          <input
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            placeholder="z. B. 3-Zimmer-Wohnung Berlin Mitte"
            style={darkInputStyle}
          />
        </DarkField>

        <DarkField label="Link zum Inserat (optional)">
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://www.immoscout24.de/..."
            style={darkInputStyle}
          />
        </DarkField>

        <DarkField label="Notizen (optional)">
          <textarea
            value={notizen}
            onChange={(e) => setNotizen(e.target.value)}
            placeholder="Eigene Notizen, Eindrücke, To-Dos..."
            rows={4}
            style={{ ...darkInputStyle, resize: 'vertical', minHeight: 92 }}
          />
        </DarkField>

        <div>
          <span style={labelStyle}>Bilder hinzufügen (optional)</span>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              if (e.dataTransfer?.files?.length) void handleFiles(e.dataTransfer.files)
            }}
            style={{
              marginTop: 8,
              padding: '22px 16px',
              borderRadius: 10,
              border: `1.5px dashed ${dragOver ? 'rgba(247,247,244,0.5)' : 'rgba(255,255,255,0.18)'}`,
              background: dragOver ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'background 140ms ease, border-color 140ms ease',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(247,247,244,0.55)', marginBottom: 6 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div style={{ font: '500 13px/1.4 var(--font-dm-sans), sans-serif', color: 'rgba(247,247,244,0.85)' }}>
              Klicken oder Dateien hierher ziehen
            </div>
            <div style={{ marginTop: 4, font: '400 11.5px/1.4 var(--font-dm-sans), sans-serif', color: 'rgba(247,247,244,0.5)' }}>
              JPG, PNG, WebP — max. {MAX_IMAGES} Bilder, je 5 MB
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={(e) => { if (e.target.files?.length) void handleFiles(e.target.files); e.target.value = '' }}
          />

          {bilder.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {bilder.map((src, i) => (
                <div key={i} style={{ position: 'relative', width: 72, height: 72, borderRadius: 8, overflow: 'hidden', background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <button
                    type="button"
                    onClick={() => setBilder((b) => b.filter((_, idx) => idx !== i))}
                    aria-label="Entfernen"
                    style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: 9, border: 'none', background: 'rgba(0,0,0,0.7)', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                  >
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                      <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div style={{ padding: '9px 12px', borderRadius: 8, background: 'rgba(207,45,86,0.16)', border: '1px solid rgba(207,45,86,0.35)', font: '400 12.5px/1.4 var(--font-dm-sans), sans-serif', color: '#f7a8b9' }}>
            {error}
          </div>
        )}

        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 6 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '11px 18px', borderRadius: 9,
              background: 'transparent', color: '#f7f7f4',
              border: '1px solid rgba(255,255,255,0.18)',
              font: '500 13.5px/1 var(--font-dm-sans), sans-serif',
              cursor: 'pointer',
            }}
          >
            Abbrechen
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => onSave({ titel: titel.trim(), link: link.trim(), notizen: notizen.trim(), bilder })}
            style={{
              padding: '11px 22px', borderRadius: 9,
              background: canSave ? 'linear-gradient(to bottom, #f7f7f4, #d8d8d4)' : 'rgba(255,255,255,0.15)',
              color: canSave ? '#0a0a0a' : 'rgba(247,247,244,0.45)',
              border: '1px solid rgba(0,0,0,0.5)',
              font: '500 13.5px/1 var(--font-dm-sans), sans-serif',
              cursor: canSave ? 'pointer' : 'default',
              boxShadow: canSave ? '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            Speichern
          </button>
        </footer>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  font: '500 11px/1 var(--font-dm-sans), sans-serif',
  letterSpacing: 0.6, textTransform: 'uppercase',
  color: 'rgba(247,247,244,0.6)',
}

const darkInputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '11px 12px', borderRadius: 9,
  background: '#2A2A2A',
  border: '1px solid #3A3A3A',
  color: '#f7f7f4',
  font: '400 14px/1.4 var(--font-dm-sans), sans-serif',
  outline: 'none',
}

function DarkField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  )
}

async function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('read_failed'))
    reader.readAsDataURL(file)
  })
}
