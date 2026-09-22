import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Box, Check, Download, LoaderCircle, PenLine } from 'lucide-react'
import type { Coffret, MagazineData, Projection } from '../lib/types'
import { downloadJSON, edition, formatDate } from '../lib/engine'
import { Eyebrow } from './ui'

export interface EditorChange { coffretId: string; hour: number; sceneIndex: number; field: string; value: string; blockIndex?: number }
export default function LegacyEditor({ data, coffret, hour, saveState, onChange, onSelect, onNavigate, onRead, onBack, onSave }: { data: MagazineData; coffret: Coffret; hour: number; saveState: string; onChange: (patch: EditorChange) => void; onSelect: (id: string, h: number) => void; onNavigate: (p: Projection) => void; onRead: (c: Coffret) => void; onBack: () => void; onSave: () => Promise<boolean | undefined> }) {
  const iframe = useRef<HTMLIFrameElement>(null)
  const readyRef = useRef(false)
  const [loaded, setLoaded] = useState(false)
  const [view3d, setView3d] = useState(false)
  const callbacks = useRef({ data, coffret, hour, onChange, onSelect, onNavigate, onRead, onSave })
  callbacks.current = { data, coffret, hour, onChange, onSelect, onNavigate, onRead, onSave }
  const send = useCallback((message: object) => { iframe.current?.contentWindow?.postMessage(message, location.origin) }, [])
  const initialize = useCallback(() => {
    if (readyRef.current) return
    readyRef.current = true
    const current = callbacks.current
    send({ type: 'wmm:init', data: current.data, coffretId: current.coffret.id, hour: current.hour })
  }, [send])
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== iframe.current?.contentWindow || !event.data) return
      const message = event.data
      const current = callbacks.current
      if (message.type === 'wmm:ready') initialize()
      if (message.type === 'wmm:loaded') setLoaded(true)
      if (message.type === 'wmm:change' && typeof message.value === 'string' && message.value.length <= 100000) current.onChange(message as EditorChange)
      if (message.type === 'wmm:selection') current.onSelect(message.coffretId, message.hour)
      if (message.type === 'wmm:view') setView3d(message.view === '3d')
      if (message.type === 'wmm:navigate') {
        const selected = current.data.coffrets.find(c => c.id === message.coffretId) ?? current.coffret
        if (message.view === 'magazine') current.onRead(selected)
        else current.onNavigate(message.view)
      }
      if (message.type === 'wmm:save') void current.onSave().then(success => send({ type: 'wmm:saved', success: !!success, explicit: true }))
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [initialize, send])
  useEffect(() => { if (readyRef.current) send({ type: 'wmm:select', coffretId: coffret.id, hour }) }, [coffret.id, hour, send])
  useEffect(() => { if (loaded && (saveState === 'saved' || saveState === 'error')) send({ type: 'wmm:saved', success: saveState === 'saved' }) }, [saveState, loaded, send])
  return <section className="interior-editor"><div className="editor-page-heading"><div><button className="back-link" onClick={onBack}><ArrowLeft size={13}/>Le magazine</button><Eyebrow>L’ATELIER D’ORIGINE, UN HORIZON PLUS GRAND</Eyebrow><h1>L’éditeur <em>intérieur.</em></h1></div><div className="editor-external-actions"><span className={`save-status ${saveState === 'error' ? 'error' : ''}`}>{saveState === 'saved' ? <Check size={12}/> : <LoaderCircle size={12}/>} {saveState === 'saved' ? 'Enregistré sur cet appareil' : saveState === 'error' ? 'Sauvegarde indisponible' : 'Enregistrement…'}</span><button className="button button-outline" onClick={() => onRead(coffret)}>Lire le coffret<ArrowUpRight size={14}/></button></div></div><div className="editor-context-bar"><label><span>COFFRET</span><select aria-label="Choisir le coffret dans l’éditeur" value={coffret.id} onChange={e => onSelect(e.target.value, hour)}>{data.coffrets.map(c => <option key={c.id} value={c.id}>N° {edition(c.editionNumber)} · {formatDate(c)} · {c.title}</option>)}</select></label><label className="editor-hour-select"><span>MOMENT</span><select aria-label="Choisir l’heure dans l’éditeur" value={hour} onChange={e => onSelect(coffret.id, Number(e.target.value))}>{Object.values(coffret.hours).map(h => <option key={h.hour} value={h.hour}>{h.label} · {h.title}</option>)}</select></label><button className={`button button-outline editor-3d-button ${view3d ? 'active' : ''}`} onClick={() => send({ type: 'wmm:show', view: view3d ? 'editor' : '3d' })}>{view3d ? <PenLine size={15}/> : <Box size={15}/>} {view3d ? 'Éditeur' : 'Atelier 3D'}</button></div><div className="legacy-editor-frame">{!loaded && <div className="editor-loading"><LoaderCircle className="spin" size={25}/><p>Ouverture de l’éditeur préservé…</p><span>365 coffrets · 8 760 moments · une source commune</span></div>}<iframe src="/editor.html?embedded=1" title="Éditeur intérieur original World Wedding Magazine" ref={iframe} onLoad={initialize}/></div><div className="editor-preserved-note"><span><Check size={13}/>L’arbre, les scènes, les blocs et l’aperçu de l’éditeur d’origine sont conservés.</span><button onClick={() => downloadJSON(coffret, `WWM-coffret-${edition(coffret.editionNumber)}.json`)}>Exporter ce coffret<Download size={12}/></button></div></section>
}
