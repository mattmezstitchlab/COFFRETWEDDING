import { useEffect, useId, useRef, type ReactNode } from 'react'
import { ArrowUpRight, Check, ShieldCheck, X } from 'lucide-react'
import type { EditorialStatus } from '../lib/types'
import { STATUS_LABELS } from '../lib/types'

export function BrandMark({ small = false }: { small?: boolean }) {
  return <svg className={small ? 'brand-mark small' : 'brand-mark'} viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M7 16 16 7h16l9 9v16l-9 9H16l-9-9V16Z" stroke="currentColor" strokeWidth=".8"/><path d="m12 17 6 16 6-12 6 12 6-16M16 17h5m6 0h5M24 11v5m0 20v3M4 24H1m46 0h-3" stroke="currentColor" strokeWidth="1.1"/><path d="m24 3 2 3-2 3-2-3 2-3Z" fill="currentColor"/></svg>
}
export function Eyebrow({ children }: { children: ReactNode }) { return <div className="eyebrow"><span />{children}</div> }
export function StatusBadge({ status, compact = false }: { status: EditorialStatus; compact?: boolean }) {
  return <span className={`status-badge ${status}`} title="Statut illustratif de la collection de démonstration">{status === 'verified' ? <ShieldCheck size={12} /> : status === 'claimed' ? <Check size={12} /> : <span className="status-small-dot" />}{!compact && STATUS_LABELS[status]}</span>
}
export function Modal({ children, title, onClose, wide = false, className = '' }: { children: ReactNode; title: string; onClose: () => void; wide?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const id = useId()
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => ref.current?.focus(), 10)
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onCloseRef.current() }
      if (e.key === 'Tab') {
        const focusable = ref.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select, textarea, [tabindex="0"]')
        if (!focusable?.length) return
        const first = focusable[0], last = focusable[focusable.length - 1]
        if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => { window.clearTimeout(timer); document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', handleKey); before?.focus() }
  }, [])
  return <div className={`modal-overlay ${className}`} onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}><div className={`modal ${wide ? 'modal-wide' : ''}`} ref={ref} role="dialog" aria-modal="true" aria-labelledby={id} tabIndex={-1}><div className="modal-heading"><div><span className="tiny-label">WORLD WEDDING MAGAZINE · FRANCE</span><h2 id={id}>{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Fermer la fenêtre"><X size={20}/></button></div>{children}</div></div>
}
export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return <div className="empty-state"><BrandMark small/><h3>{title}</h3><p>{text}</p>{action}</div>
}
export function TextLink({ children, onClick }: { children: ReactNode; onClick: () => void }) { return <button className="text-link" onClick={onClick}>{children}<ArrowUpRight size={14}/></button> }
