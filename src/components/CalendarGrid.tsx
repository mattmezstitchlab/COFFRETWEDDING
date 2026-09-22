import { ArrowUpRight, Flower2, Leaf, MapPin, Snowflake, Sun } from 'lucide-react'
import type { Coffret, MagazineData } from '../lib/types'
import { MONTHS, STATUS_LABELS } from '../lib/types'
import { edition, formatDate } from '../lib/engine'

export default function CalendarGrid({ data, filtered, month, onOpen }: { data: MagazineData; filtered: Coffret[]; month: string; onOpen: (c: Coffret) => void }) {
  const allowed = new Set(filtered.map(c => c.id))
  return <div className={`calendar-grid ${month ? 'single-month' : ''}`}>{MONTHS.map((name, index) => {
    if (month && Number(month) - 1 !== index) return null
    const coffrets = data.coffrets.filter(c => c.month === index)
    const count = coffrets.filter(c => allowed.has(c.id)).length
    const featured = coffrets.find(c => c.originalEdition && allowed.has(c.id)) ?? coffrets.find(c => allowed.has(c.id)) ?? coffrets[0]
    const place = data.places[featured.place]
    const offset = (new Date(Date.UTC(data.year, index, 1)).getUTCDay() + 6) % 7
    const SeasonIcon = index < 2 || index === 11 ? Snowflake : index < 5 ? Flower2 : index < 8 ? Sun : Leaf
    return <article className={`month-card ${count === 0 ? 'month-dimmed' : ''}`} key={name}><div className="month-heading"><h3>{name}<span>{String(index + 1).padStart(2, '0')}</span></h3><SeasonIcon size={15} strokeWidth={1.3}/></div><p className="month-subheading">{count} coffrets <span>·</span> {count * 24} moments</p><div className="calendar-weekdays">{['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <span key={i}>{d}</span>)}</div><div className="calendar-days">{Array.from({ length: offset }, (_, i) => <span className="empty-day" key={`empty-${i}`}/>)}{coffrets.map(c => <button key={c.id} data-testid="calendar-day" className={`calendar-day ${c.editorialStatus} ${c.id === 'wedding_apr' ? 'spotlight-day' : ''} ${!allowed.has(c.id) ? 'filtered-out' : ''}`} disabled={!allowed.has(c.id)} onClick={() => onOpen(c)} aria-label={`${formatDate(c)} : ${c.title}, ${data.places[c.place].city}, ${STATUS_LABELS[c.editorialStatus]}, 24 moments`}><span>{c.day}</span><span className="day-tooltip"><strong>N° {edition(c.editionNumber)} · {c.title}</strong><span><MapPin size={11}/>{data.places[c.place].city} · {c.season}</span><small>{formatDate(c)} · 24 moments</small></span></button>)}</div><button className="month-footer" onClick={() => onOpen(featured)} disabled={!count}><span><MapPin size={12}/>{place.city} <i>& ailleurs</i></span><ArrowUpRight size={13}/></button></article>
  })}</div>
}
