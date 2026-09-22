import { useState } from 'react'
import { ArrowUpRight, Clock3, Image, MapPin, Network, Route, UsersRound } from 'lucide-react'
import type { Coffret, MagazineData } from '../lib/types'
import { edition } from '../lib/engine'

export default function RelationsGraph({ data, coffret, onOpen, onEdit, onTour }: { data: MagazineData; coffret: Coffret; onOpen: (c: Coffret) => void; onEdit: (c: Coffret, hour?: number) => void; onTour: (id: string) => void }) {
  const [selected, setSelected] = useState('')
  const place = data.places[coffret.place]
  const tour = data.tours.find(t => t.coffretIds.includes(coffret.id))
  const second = data.places[coffret.secondaryPlaceIds[0]]
  const pro = data.professionals[coffret.professionals[0]]
  const nodes = [
    { id: 'place', x: 18, y: 25, label: 'LIEU PRINCIPAL', text: place.name, Icon: MapPin, detail: `${place.city} · ${place.region}. ${data.coffrets.filter(c => c.place === place.id).length} coffrets partagent ce lieu.` },
    { id: 'professional', x: 81, y: 24, label: 'PROFESSIONNELS', text: pro?.name ?? 'Équipe éditoriale', Icon: UsersRound, detail: `${coffret.professionals.length} professionnels démonstrateurs sont reliés à ce coffret par leur identifiant unique.` },
    { id: 'moment', x: 83, y: 73, label: '24 MOMENTS', text: 'Le fil de la journée', Icon: Clock3, detail: '24 heures, 24 scènes éditoriales, accessibles dans l’éditeur intérieur.' },
    { id: 'media', x: 50, y: 88, label: 'MÉDIAS', text: 'Une mémoire vivante', Icon: Image, detail: `${data.media.filter(m => m.coffretIds.includes(coffret.id)).length} média(s) rattaché(s), avec crédits et origine.` },
    { id: 'tour', x: 17, y: 72, label: tour ? 'TOURNÉE' : 'LIEU EN ÉCHO', text: tour?.title ?? second?.name ?? 'Le territoire', Icon: tour ? Route : MapPin, detail: tour ? `${tour.coffretIds.length} coffrets réunis sans dupliquer leurs contenus.` : `${second?.city ?? place.city} : un lien vers un autre lieu du magazine.` },
  ]
  const chosen = nodes.find(n => n.id === selected)
  return <div className="relations-view"><div className="graph-heading"><Network size={16}/><p>Les liens font l’histoire.<span>Chaque nœud est une référence à la source commune.</span></p></div><div className="graph-canvas"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="edgeGradient"><stop offset="0%" stopColor="#c4a872"/><stop offset="100%" stopColor="#e4daca"/></linearGradient></defs>{nodes.map(n => <path key={n.id} d={`M50 47 Q${(50 + n.x) / 2} ${47} ${n.x} ${n.y}`} stroke="url(#edgeGradient)" strokeWidth=".25" fill="none" strokeDasharray={n.id === 'tour' ? '1 1' : undefined}/>)}</svg><button className="graph-center" style={{ left: '50%', top: '47%' }} onClick={() => onOpen(coffret)}><span>COFFRET N° {edition(coffret.editionNumber)}</span><h3>{coffret.title}</h3><small>LA SOURCE COMMUNE <ArrowUpRight size={10}/></small></button>{nodes.map(n => <button key={n.id} className={`graph-node ${selected === n.id ? 'active' : ''}`} style={{ left: `${n.x}%`, top: `${n.y}%` }} onClick={() => setSelected(n.id)}><span className="graph-node-icon"><n.Icon size={19} strokeWidth={1.5}/></span><small>{n.label}</small><strong>{n.text}</strong></button>)}</div><div className="graph-detail">{chosen ? <><chosen.Icon size={17}/><p><strong>{chosen.text}</strong>{chosen.detail}</p>{chosen.id === 'moment' && <button className="text-link" onClick={() => onEdit(coffret, 8)}>Ouvrir l’éditeur <ArrowUpRight size={14}/></button>}{chosen.id === 'tour' && tour && <button className="text-link" onClick={() => onTour(tour.id)}>Voir la tournée <ArrowUpRight size={14}/></button>}</> : <><Network size={17}/><p>Sélectionnez un lien pour découvrir ce qui relie ce coffret au magazine.</p></>}</div></div>
}
