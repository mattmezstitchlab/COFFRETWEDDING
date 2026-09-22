import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, Database, LoaderCircle, X } from 'lucide-react'
import type { Coffret, Filters, MagazineData, Projection, Workspace } from './lib/types'
import { EMPTY_FILTERS } from './lib/types'
import { downloadJSON, validateMagazine } from './lib/engine'
import { useMagazine } from './lib/useMagazine'
import Shell from './components/Shell'
import Hero from './components/Hero'
import Atlas from './components/Atlas'
import CoffretDetail from './components/CoffretDetail'
import ClaimDialog from './components/ClaimDialog'
import ToursPage, { AddToTourDialog } from './components/Tours'
import { MediaPage, PlacesPage, ProfessionalsPage } from './components/Directories'
import LegacyEditor, { type EditorChange } from './components/LegacyEditor'
import About from './components/About'
import { BrandMark, Modal } from './components/ui'

function App() {
  const { data, setData, update, saveState, saveNow, error } = useMagazine()
  const [workspace, setWorkspace] = useState<Workspace>('explore')
  const [projection, setProjection] = useState<Projection>('grid')
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [selectedId, setSelectedId] = useState('wedding_apr')
  const [editorHour, setEditorHour] = useState(8)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [claimId, setClaimId] = useState<string | null>(null)
  const [addToTourId, setAddToTourId] = useState<string | null>(null)
  const [selectedTour, setSelectedTour] = useState<string | null>(null)
  const [showAbout, setShowAbout] = useState(false)
  const [mediaCoffret, setMediaCoffret] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; time: number } | null>(null)
  const [importData, setImportData] = useState<MagazineData | null>(null)
  const importInput = useRef<HTMLInputElement>(null)
  const notify = useCallback((message: string) => setToast({ message, time: Date.now() }), [])
  useEffect(() => { if (!toast) return; const timeout = window.setTimeout(() => setToast(null), 5200); return () => window.clearTimeout(timeout) }, [toast])
  useEffect(() => {
    document.title = workspace === 'editor' ? 'L’éditeur intérieur — World Wedding Magazine' : workspace === 'tours' ? 'Les tournées — World Wedding Magazine France' : 'World Wedding Magazine — La France en 365 histoires'
  }, [workspace])
  const navigate = useCallback((next: Workspace) => {
    setWorkspace(next); setDetailId(null); setClaimId(null); setAddToTourId(null)
    if (next === 'coffrets') setProjection('magazine')
    if (next === 'tours') setSelectedTour(null)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])
  const open = useCallback((c: Coffret) => { setSelectedId(c.id); setDetailId(c.id) }, [])
  const edit = useCallback((c: Coffret, hour = 8) => { setSelectedId(c.id); setEditorHour(hour); setDetailId(null); setWorkspace('editor'); window.scrollTo({ top: 0, behavior: 'instant' }) }, [])
  const favorite = useCallback((id: string) => update(d => ({ ...d, favorites: d.favorites.includes(id) ? d.favorites.filter(x => x !== id) : [...d.favorites, id] })), [update])
  const updateCoffret = useCallback((coffret: Coffret) => update(d => ({ ...d, coffrets: d.coffrets.map(c => c.id === coffret.id ? coffret : c) })), [update])
  const updateFull = useCallback((next: MagazineData) => update(() => next), [update])
  const showTour = useCallback((id: string) => { setDetailId(null); setAddToTourId(null); setWorkspace('tours'); setSelectedTour(id); window.scrollTo({ top: 0, behavior: 'instant' }) }, [])
  const editorChange = useCallback((patch: EditorChange) => {
    if (!['surtitre', 'title', 'chapo', 'block'].includes(patch.field)) return
    update(d => ({ ...d, coffrets: d.coffrets.map(c => {
      if (c.id !== patch.coffretId || !c.hours[patch.hour]?.scenes[patch.sceneIndex]) return c
      const hour = c.hours[patch.hour]
      const scenes = hour.scenes.map((s, index) => {
        if (index !== patch.sceneIndex) return s
        if (patch.field === 'block') return { ...s, blocks: s.blocks.map((b, bi) => bi === patch.blockIndex ? { ...b, content: patch.value } : b) }
        return { ...s, [patch.field]: patch.value }
      })
      return { ...c, hours: { ...c.hours, [patch.hour]: { ...hour, ...(patch.field === 'title' ? { title: patch.value } : {}), scenes } } }
    }) }))
  }, [update])
  const importMagazine = async (file?: File) => {
    if (!file) return
    if (file.size > 70 * 1024 * 1024) { notify('Ce fichier dépasse 70 Mo. Utilisez un export JSON du magazine.'); return }
    try {
      const parsed: unknown = JSON.parse(await file.text())
      if (!validateMagazine(parsed)) throw new Error('Le fichier ne respecte pas le modèle : 365 dates uniques, 24 moments par coffret et des relations valides sont nécessaires.')
      setImportData(parsed)
    } catch (err) { notify(err instanceof Error ? err.message : 'Le fichier JSON est invalide.') }
    if (importInput.current) importInput.current.value = ''
  }
  if (!data) return <div className="initial-loading"><BrandMark/><h1>World Wedding <em>Magazine</em></h1><div className="loading-rule"/><p>{error || 'La France et ses 365 histoires vous attendent…'}</p>{error ? <button className="button button-dark" onClick={() => location.reload()}>Réessayer<ArrowRight size={15}/></button> : <LoaderCircle className="spin" size={18}/>}</div>
  const selected = data.coffrets.find(c => c.id === selectedId) ?? data.coffrets[0]
  const detail = data.coffrets.find(c => c.id === detailId)
  const claim = data.coffrets.find(c => c.id === claimId)
  const addToTour = data.coffrets.find(c => c.id === addToTourId)
  return <>
    <Shell workspace={workspace} onNavigate={navigate} onClaim={() => { setClaimId(selected.editorialStatus === 'available' ? selected.id : data.coffrets.find(c => c.editorialStatus === 'available')!.id); setDetailId(null) }} onAbout={() => setShowAbout(true)} onExport={() => { downloadJSON(data, 'World-Wedding-Magazine-France-2026.json'); notify('La source complète du magazine a été exportée.') }} onImport={() => importInput.current?.click()} data={data} saveState={saveState}>
      {(workspace === 'explore' || workspace === 'coffrets') && <>{workspace === 'explore' && <Hero data={data} onOpen={open} onAbout={() => setShowAbout(true)}/>}<Atlas data={data} projection={projection} onProjection={setProjection} filters={filters} onFilters={setFilters} onOpen={open} onEdit={edit} onFavorite={favorite} onTour={showTour} collections={workspace === 'coffrets'}/>{workspace === 'explore' && <div className="bottom-editorial-cta"><div><span className="tiny-label">L’HISTOIRE NE S’ARRÊTE PAS À UNE JOURNÉE.</span><h2>Et si l’on prenait <em>la route ensemble ?</em></h2></div><button className="button button-dark" onClick={() => navigate('tours')}>Découvrir les tournées<ArrowRight size={16}/></button></div>}</>}
      {workspace === 'tours' && <ToursPage data={data} selectedId={selectedTour} onSelect={setSelectedTour} onUpdate={updateFull} onOpen={open} onNotify={notify}/>}
      {workspace === 'places' && <PlacesPage data={data} onRegion={region => { setFilters({ ...EMPTY_FILTERS, region }); setProjection('map'); setWorkspace('coffrets'); window.scrollTo({ top: 0, behavior: 'instant' }) }}/>}
      {workspace === 'professionals' && <ProfessionalsPage data={data} onOpen={open}/>}
      {workspace === 'media' && <MediaPage data={data} onUpdate={updateFull} onNotify={notify} preselectedCoffret={mediaCoffret}/>}
      {workspace === 'editor' && <LegacyEditor data={data} coffret={selected} hour={editorHour} saveState={saveState} onChange={editorChange} onSelect={(id, h) => { if (data.coffrets.some(c => c.id === id) && h >= 0 && h < 24) { setSelectedId(id); setEditorHour(h) } }} onNavigate={p => { setProjection(p); setWorkspace('explore') }} onRead={c => { setWorkspace('explore'); open(c) }} onBack={() => navigate('explore')} onSave={saveNow}/>}
    </Shell>
    <input className="hidden-input" ref={importInput} type="file" accept="application/json,.json" aria-label="Importer une sauvegarde JSON du magazine" onChange={e => void importMagazine(e.target.files?.[0])}/>
    {detail && <CoffretDetail key={detail.id} data={data} coffret={detail} onClose={() => setDetailId(null)} onEdit={edit} onFavorite={favorite} onClaim={c => { setDetailId(null); setClaimId(c.id) }} onAddToTour={c => { setDetailId(null); setAddToTourId(c.id) }} onUpdate={c => { updateCoffret(c); notify('Le coffret a été mis à jour dans toutes les vues.') }} onTour={showTour} onMedia={() => { setMediaCoffret(detail.id); setDetailId(null); setWorkspace('media'); window.scrollTo({ top: 0, behavior: 'instant' }) }} onOpen={open}/>}
    {claim && <ClaimDialog key={claim.id} coffret={claim} onClose={() => { setClaimId(null); setDetailId(claim.id) }} onUpdate={(c, message) => { updateCoffret(c); notify(message) }}/>}
    {addToTour && <AddToTourDialog data={data} coffret={addToTour} onClose={() => { setAddToTourId(null); setDetailId(addToTour.id) }} onUpdate={updateFull} onTour={showTour}/>}
    {showAbout && <About onClose={() => setShowAbout(false)}/>}
    {importData && <Modal title="Retrouver votre magazine." onClose={() => setImportData(null)}><div className="import-summary"><Database size={34} strokeWidth={1.2}/><h3>Votre source commune est prête.</h3><p>365 coffrets · 8 760 moments · {importData.tours.length} tournées · {importData.media.length} médias</p><div className="local-notice">L’import remplacera la collection sauvegardée sur cet appareil. Exportez d’abord le magazine actuel si vous souhaitez le conserver.</div><div className="form-actions"><button className="button button-outline" onClick={() => downloadJSON(data, 'WWM-avant-import.json')}>Exporter la version actuelle</button><button className="button button-dark" onClick={() => { setData(importData); setImportData(null); navigate('explore'); notify('Votre magazine a été restauré avec ses 365 coffrets.') }}>Restaurer le magazine<Check size={14}/></button></div></div></Modal>}
    {toast && <div className="toast" role="status"><span><Check size={15}/></span><p>{toast.message}</p><button onClick={() => setToast(null)} aria-label="Fermer la notification"><X size={14}/></button></div>}
  </>
}

export default App
