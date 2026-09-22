import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Compass, MapPin, Minus, Plus, RotateCcw } from 'lucide-react'
import type { Coffret, MagazineData } from '../lib/types'
import { edition, formatDate } from '../lib/engine'
import { StatusBadge } from './ui'

type Feature = { properties: { nom: string; code: string }; geometry: { type: string; coordinates: number[][][] | number[][][][] } }
const project = (lng: number, lat: number): [number, number] => [(lng + 5.4) * 31.5 + 40, (51.5 - lat) * 43 + 20]
function pathFor(feature: Feature) {
  const polygons = feature.geometry.type === 'MultiPolygon' ? feature.geometry.coordinates as number[][][][] : [feature.geometry.coordinates as number[][][]]
  return polygons.map(poly => poly.map(ring => ring.map(([lng, lat], i) => `${i === 0 ? 'M' : 'L'}${project(lng, lat).join(',')}`).join(' ') + 'Z').join(' ')).join(' ')
}
export default function FranceMap({ data, coffrets, onOpen, activeRegion, onRegion }: { data: MagazineData; coffrets: Coffret[]; onOpen: (c: Coffret) => void; activeRegion?: string; onRegion?: (region: string) => void }) {
  const [features, setFeatures] = useState<Feature[]>([])
  const [error, setError] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<string>('place_apr')
  const [zoom, setZoom] = useState(1)
  const [visibleCount, setVisibleCount] = useState(6)
  useEffect(() => { fetch('/data/france-regions.json').then(r => { if (!r.ok) throw new Error('Carte indisponible'); return r.json() }).then(d => setFeatures(d.features)).catch(() => setError(true)) }, [])
  const places = useMemo(() => Object.values(data.places).filter(p => coffrets.some(c => c.place === p.id)), [data.places, coffrets])
  const focusPlace = places.find(p => p.id === selectedPlace) ?? places[0]
  const placeCoffrets = focusPlace ? coffrets.filter(c => c.place === focusPlace.id) : []
  const select = (id: string) => { setSelectedPlace(id); setVisibleCount(6) }
  return <div className="france-map-layout"><div className="france-map-canvas"><div className="map-top-label"><Compass size={16}/><span>UN TERRITOIRE, MILLE HISTOIRES</span></div>{error ? <div className="map-error">Le fond de carte est indisponible. Les coffrets restent accessibles dans la liste des territoires.</div> : <svg viewBox="0 0 560 500" className="france-map" aria-label="Carte interactive des coffrets en France"><text x="133" y="54" className="map-sea-label">LA MANCHE</text><text x="40" y="270" className="map-sea-label" transform="rotate(-90 40 270)">OCÉAN ATLANTIQUE</text><text x="316" y="470" className="map-sea-label">MÉDITERRANÉE</text><g transform={`translate(280 250) scale(${zoom}) translate(-280 -250)`}>{features.map(f => <path key={f.properties.code} d={pathFor(f)} className={`region-path ${activeRegion === f.properties.nom ? 'active-region' : ''}`} tabIndex={onRegion ? 0 : undefined} role={onRegion ? 'button' : undefined} aria-label={`Filtrer : ${f.properties.nom}`} onClick={() => onRegion?.(activeRegion === f.properties.nom ? '' : f.properties.nom)} onKeyDown={e => { if (e.key === 'Enter') onRegion?.(f.properties.nom) }}><title>{f.properties.nom}</title></path>)}{places.filter(p => p.lat > 40 && p.lng > -6 && p.lng < 11).map(p => {
    const [x, y] = project(p.lng, p.lat)
    const count = coffrets.filter(c => c.place === p.id).length
    const selected = p.id === focusPlace?.id
    return <g key={p.id} className={`map-place ${selected ? 'selected' : ''}`} role="button" tabIndex={0} aria-label={`${p.city}, ${count} coffrets`} onClick={() => select(p.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') select(p.id) }}><circle cx={x} cy={y} r={selected ? 17 : 12} className="map-marker-halo"/><circle cx={x} cy={y} r={selected ? 8 : 5} className="map-marker-core"/>{(selected || ['place_feb', 'place_may', 'place_oct', 'place_aug', 'place_jun'].includes(p.id)) && <text x={x + (p.id === 'place_jun' ? -15 : 13)} y={y + 4} textAnchor={p.id === 'place_jun' ? 'end' : 'start'} className="map-city-label">{p.city}</text>}<title>{p.city} · {count} coffrets</title></g>
  })}</g></svg>}<div className="map-controls"><button onClick={() => setZoom(z => Math.min(z + 0.25, 2))} aria-label="Agrandir la carte"><Plus size={15}/></button><button onClick={() => setZoom(z => Math.max(z - 0.25, .75))} aria-label="Réduire la carte"><Minus size={15}/></button><button onClick={() => setZoom(1)} aria-label="Réinitialiser le zoom"><RotateCcw size={13}/></button></div><div className="overseas"><span>ET AU-DELÀ DE L’HEXAGONE</span><div>{Object.values(data.places).filter(p => p.lat < 40).map(p => <button key={p.id} className={focusPlace?.id === p.id ? 'active' : ''} onClick={() => { select(p.id); if (!places.some(x => x.id === p.id)) onRegion?.(p.region) }}><MapPin size={10}/>{p.region}</button>)}</div></div></div><aside className="map-place-panel"><span className="tiny-label">LES HISTOIRES DU TERRITOIRE</span><h3>{focusPlace?.city ?? 'La France'}</h3><p>{focusPlace?.region ?? 'Choisissez un territoire sur la carte'}</p><div className="map-count"><span>{placeCoffrets.length}</span> coffrets à découvrir</div><div className="map-coffret-list">{placeCoffrets.slice(0, visibleCount).map(c => <button key={c.id} onClick={() => onOpen(c)}><div className="map-list-date"><b>{String(c.day).padStart(2, '0')}</b><span>{formatDate(c, true).split(' ')[1]}</span></div><div><small>COFFRET {edition(c.editionNumber)}</small><strong>{c.title}</strong><StatusBadge status={c.editorialStatus}/></div><ArrowRight size={14}/></button>)}</div>{visibleCount < placeCoffrets.length && <button className="text-link" onClick={() => setVisibleCount(n => n + 6)}>Voir plus de coffrets <Plus size={13}/></button>}<p className="map-note">Coordonnées territoriales. Les lieux et récits sont des démonstrateurs, sans réservation associée.</p></aside></div>
}
