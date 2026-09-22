import type { Coffret, Filters, LegacySeed, MagazineData, MediaAsset, Moment, Place, Scene, Season } from './types'
import { MONTHS } from './types'

export const YEAR = 2026
export const formatDate = (coffret: Pick<Coffret, 'day' | 'month' | 'year'>, short = false) => `${coffret.day} ${short ? MONTHS[coffret.month].slice(0, 3).toLowerCase() + '.' : MONTHS[coffret.month].toLowerCase()} ${coffret.year}`
export const edition = (n: number) => String(n).padStart(3, '0')
export const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
export const getCover = (data: MagazineData, coffret: Coffret) => data.media.find(m => m.id === coffret.coverId) ?? data.media[0]
export const getSeason = (month: number, day: number): Season => {
  const md = (month + 1) * 100 + day
  return md >= 321 && md < 621 ? 'Printemps' : md >= 621 && md < 923 ? 'Été' : md >= 923 && md < 1221 ? 'Automne' : 'Hiver'
}

const additionalPlaces: [string, string, string, string, number, number, string][] = [
  ['normandie', 'Manoir des Pommiers', 'Honfleur', 'Normandie', 49.4197, 0.2329, 'manoir'],
  ['loire', 'Domaine des Rives', 'Saumur', 'Pays de la Loire', 47.2594, -0.0781, 'domaine'],
  ['centre', 'Château des Jardins', 'Amboise', 'Centre-Val de Loire', 47.412, 0.982, 'chateau'],
  ['bourgogne', 'Maison des Vignes', 'Beaune', 'Bourgogne-Franche-Comté', 47.0247, 4.8383, 'vignoble'],
  ['hauts', 'Pavillon de la Forêt', 'Chantilly', 'Hauts-de-France', 49.1932, 2.4712, 'domaine'],
  ['reunion', 'Maison de l’Océan', 'Saint-Paul', 'La Réunion', -21.0096, 55.2698, 'plage'],
  ['guadeloupe', 'Jardin des Alizés', 'Deshaies', 'Guadeloupe', 16.3067, -61.7928, 'jardin'],
  ['martinique', 'Habitation des Fleurs', 'Les Trois-Îlets', 'Martinique', 14.539, -61.037, 'jardin'],
  ['guyane', 'Villa des Palmiers', 'Cayenne', 'Guyane', 4.9224, -52.3135, 'villa'],
  ['mayotte', 'Terrasse du Lagon', 'Dzaoudzi', 'Mayotte', -12.785, 45.269, 'plage'],
  ['cote', 'Maison des Roches', 'Collioure', 'Occitanie', 42.525, 3.083, 'villa'],
  ['riviere', 'Moulin de la Rivière', 'L’Isle-sur-la-Sorgue', 'Provence-Alpes-Côte d’Azur', 43.9196, 5.0514, 'moulin'],
  ['reims', 'Pavillon des Bulles', 'Reims', 'Grand Est', 49.2583, 4.0317, 'domaine'],
  ['lyon', 'Maison des Lumières', 'Lyon', 'Auvergne-Rhône-Alpes', 45.764, 4.8357, 'hotel_particulier'],
]
const coupleNames = ['Alice & Gabriel', 'Louise & Louis', 'Jeanne & Thomas', 'Rose & Hugo', 'Anna & Raphaël', 'Emma & Jules', 'Margaux & Arthur', 'Clara & Victor', 'Sofia & Paul', 'Jade & Alexandre', 'Chloé & Maxime', 'Agathe & Simon', 'Lucie & Baptiste', 'Salomé & Adrien', 'Sarah & Léon', 'Manon & Alexis', 'Eva & Nathan', 'Zoé & Oscar', 'Alice & Camille', 'Louis & Antoine']
const titleIdeas = ['La promesse des beaux jours', 'Un amour en lumière', 'L’échappée belle', 'Une journée pour toujours', 'Les heures heureuses', 'À l’ombre des souvenirs', 'L’élégance des choses simples', 'Là où tout commence', 'Une parenthèse à deux', 'La beauté de l’instant', 'Le grand oui', 'Les liens du cœur', 'Un jour, une éternité', 'La maison des retrouvailles', 'Au rythme de l’amour', 'Les promesses du matin', 'Un bonheur en partage', 'Le goût des jours heureux', 'Une histoire en douceur', 'Le plus beau des voyages', 'La lumière en héritage', 'Le jardin des serments', 'Au-delà des horizons', 'Les détails du bonheur', 'Le temps de se retrouver', 'L’amour en filigrane', 'L’invitation au bonheur', 'Un ciel pour deux', 'L’art de célébrer', 'L’infiniment précieux', 'Le début de nous']
const baseHours = ['Les derniers secrets de la nuit', 'La maison s’endort', 'Le silence du domaine', 'Les étoiles pour témoins', 'Avant les premières lueurs', 'L’éveil du paysage', 'Le jour se lève', 'Le petit-déjeuner des retrouvailles', 'Les préparatifs de la mariée', 'Les préparatifs du marié', 'Les premiers regards', 'L’arrivée des proches', 'La cérémonie', 'Le déjeuner en famille', 'Une parenthèse à deux', 'Les portraits du bonheur', 'La découverte du territoire', 'Les douceurs de l’après-midi', 'L’heure dorée', 'L’apéritif des retrouvailles', 'Le dîner de célébration', 'Le premier pas de danse', 'La fête sous les étoiles', 'Les souvenirs de demain']

function sceneFor(id: string, hour: number, title: string, place: Place, season: Season, couple: string): Scene {
  const mood = season === 'Hiver' ? 'la chaleur des matières et la douceur des retrouvailles' : season === 'Printemps' ? 'les fleurs fraîches et la lumière du renouveau' : season === 'Été' ? 'les longues heures de lumière et les conversations au jardin' : 'les couleurs profondes et la générosité des tables'
  const chapo = `À ${place.city}, ${title.toLowerCase()} prend une couleur singulière. ${couple} imaginent une journée où chaque détail fait écho au territoire.`
  return {
    id: `${id}-scene-${hour}`, title, surtitre: `${place.region} · ${season}`, subtitle: '', chapo,
    blocks: [
      { id: `${id}-text-${hour}`, type: 'text', content: `À ${String(hour).padStart(2, '0')} heures, le récit nous emmène à ${place.name}. Cette proposition éditoriale privilégie ${mood}. Un geste, une rencontre, un regard : ce moment compose une nouvelle page de l’histoire de ${couple}. Le décor et le déroulé sont des intentions à confirmer avec les personnes et les lieux concernés.`, position: { x: 0, y: 0 }, size: { w: 12, h: 4 }, metadata: { source: 'PROPOSITION ÉDITORIALE', verificationStatus: 'TO_CONFIRM' }, source: 'fictional', relations: [place.id] },
      { id: `${id}-image-${hour}`, type: 'image', content: `Intention photographique : ${title.toLowerCase()}, lumière naturelle, détails du lieu et émotions spontanées à ${place.city}.`, position: { x: 0, y: 4 }, size: { w: 12, h: 6 }, metadata: { source: 'DIRECTION ARTISTIQUE', verificationStatus: 'ILLUSTRATIVE', mediaType: 'IMAGE' }, source: 'fictional', relations: [place.id] },
      { id: `${id}-quote-${hour}`, type: 'quote', content: `Le bonheur se raconte aussi dans les petits instants. — Proposition de citation éditoriale, non attribuée.`, position: { x: 0, y: 10 }, size: { w: 8, h: 2 }, metadata: { source: 'PROPOSITION ÉDITORIALE', verificationStatus: 'TO_CONFIRM' }, source: 'fictional', relations: [] },
    ], media: [], relations: [place.id], status: 'DEMO',
  }
}

function makeSections(w: { title: string; people: { name: string }[]; day: number; month: number; year: number; season: Season }, place: Place, second: Place, story: string): Coffret['sections'] {
  return {
    identity: { title: 'Identité du coffret', body: `${w.people[0].name} · ${w.title}. Édition du ${formatDate(w)}, en ${w.season.toLowerCase()}. Une proposition de mariage intime, attachée au territoire et au rythme de ses habitants.` },
    territory: { title: 'Le territoire', body: `${place.city}, ${place.region}. Le paysage, le patrimoine et les savoir-faire locaux donnent à ce récit sa singularité. Les coordonnées du territoire permettent de retrouver cette journée sur la carte de France.` },
    story: { title: 'L’histoire', body: story },
    venue: { title: 'Le lieu principal', body: `${place.name}, à ${place.city}. Ce lieu démonstrateur accueille les préparatifs, les retrouvailles et la célébration. Son identité, sa capacité et sa disponibilité devront être confirmées avant toute publication réelle.` },
    secondaryPlaces: { title: 'Les lieux en écho', body: `Un itinéraire imaginé entre le centre historique de ${place.city}, les paysages alentour et ${second.name}, à ${second.city}. Les étapes restent des propositions éditoriales, sans engagement de disponibilité.` },
    professionals: { title: 'Les talents réunis', body: `Une équipe de création accompagne le récit : coordination, photographie, musique et gastronomie. Les professionnels démonstrateurs sont partagés entre les coffrets par leur identifiant, sans duplication de fiche ni partenariat présumé.` },
    activities: { title: 'Les expériences', body: `À ${place.city}, une promenade à deux, une découverte artisanale et un temps partagé avec les proches ponctuent la journée. Le moment de 16 heures est réservé à la découverte du territoire, selon la météo et l’envie du couple.` },
    transport: { title: 'Venir & se déplacer', body: `Prévoir une arrivée à ${place.city} la veille, puis un transfert mutualisé vers ${place.name}. Un point de rendez-vous et une navette de retour après la soirée sont à définir avec un transporteur. Les horaires et l’accessibilité seront confirmés par les intervenants.` },
    accommodation: { title: 'Prolonger le séjour', body: `Privilégier des chambres d’hôtes et hébergements de proximité autour de ${place.city}. Prévoir une nuit avant la célébration et une nuit après, ainsi qu’un petit-déjeuner de retrouvailles. Aucune chambre n’est réservée dans cette démonstration.` },
    gastronomy: { title: 'Le goût du territoire', body: `Une table de ${w.season.toLowerCase()}, inspirée des produits de ${place.region}. Le menu éditorial propose un accueil léger, un déjeuner de partage et un dîner en trois temps. Les besoins alimentaires seront recueillis auprès des invités avant de choisir un traiteur.` },
    music: { title: 'La bande-son du jour', body: `Une ouverture acoustique pour la cérémonie, des notes de jazz à l’apéritif et un premier morceau choisi par ${w.people[0].name}. La soirée s’ouvre ensuite à une sélection dansante. Les droits de diffusion et les artistes seront confirmés.` },
    media: { title: 'Images, sons & émotions', body: `Une couverture d’inspiration, des portraits, des détails de ${place.name} et un reportage en 24 séquences. Chaque média garde son crédit, son origine et ses liens avec les scènes. Les visuels actuels sont illustratifs et ne documentent pas un mariage réel.` },
    documents: { title: 'Le dossier éditorial', body: `Le coffret réunit le synopsis, le conducteur des 24 heures, la liste des contacts, les autorisations de publication et les justificatifs de vérification. La fiche JSON téléchargeable constitue le dossier structuré ; les pièces complémentaires s’ajoutent depuis la médiathèque.` },
    timeline: { title: 'Le fil des 24 heures', body: `Du premier instant de la nuit à 23 heures, chaque heure possède sa scène, ses blocs de contenu, ses médias et ses relations. La grille, le fil du temps, le magazine et l’éditeur intérieur lisent ces mêmes 24 moments.` },
    relations: { title: 'Les liens qui racontent', body: `Ce coffret se relie à ${place.name}, à ses professionnels, à ${second.name} et aux tournées dont il fait partie. Les liens utilisent les identifiants de la source commune ; une modification est visible dans chaque projection.` },
  }
}

export function createMagazine(seed: LegacySeed): MagazineData {
  const places = structuredClone(seed.places)
  Object.values(places).forEach(p => { p.region = p.region.replace("d'Azur", 'd’Azur') })
  additionalPlaces.forEach(([key, name, city, region, lat, lng, type]) => { places[`place_${key}`] = { id: `place_${key}`, name, city, region, country: 'France', lat, lng, type, status: 'DEMO' } })
  const placeList = Object.values(places)
  const professionalIds = Object.keys(seed.professionals)
  const media: MediaAsset[] = [
    { id: 'cover-provence', name: 'Lumière de Provence', src: '/images/provence-editorial.webp', kind: 'image', credit: 'Illustration éditoriale générée par IA', caption: 'Bastide provençale imaginée · visuel d’inspiration, non documentaire', coffretIds: [] },
    { id: 'cover-chateau', name: 'Les jardins d’un château', src: '/images/chateau.jpg', kind: 'image', credit: 'Sipal Photography · Pexels', caption: 'Château de Chenonceau · photographie illustrative, non liée aux mariages', coffretIds: [] },
    { id: 'cover-corse', name: 'L’horizon corse', src: '/images/corse.jpg', kind: 'image', credit: 'SlimMars 13 · Pexels', caption: 'Patrimonio, Corse · paysage d’inspiration', coffretIds: [] },
    { id: 'cover-alpes', name: 'L’hiver en altitude', src: '/images/alpes.jpg', kind: 'image', credit: 'Ollie Craig · Pexels', caption: 'Chalets enneigés · photographie illustrative', coffretIds: [] },
  ]
  const coffrets: Coffret[] = Array.from({ length: 365 }, (_, i) => {
    const date = new Date(Date.UTC(YEAR, 0, i + 1))
    const month = date.getUTCMonth(), day = date.getUTCDate()
    const original = seed.weddings.find(w => w.month === month && w.day === day)
    const place = original ? places[original.place] : placeList[(i * 7 + Math.floor(i / 31) * 3) % placeList.length]
    const second = placeList[(placeList.findIndex(p => p.id === place.id) + 1) % placeList.length]
    const season = getSeason(month, day)
    const id = original?.id ?? `coffret-${YEAR}-${edition(i + 1)}`
    const couple = original?.people[0].name ?? coupleNames[(i * 3 + month) % coupleNames.length]
    const title = original?.title ?? `${titleIdeas[(i + month) % titleIdeas.length]} à ${place.city}`
    const hours: Record<number, Moment> = {}
    for (let hour = 0; hour < 24; hour++) {
      const old = original?.hours[hour]
      const hourTitle = old?.hasContent ? old.title : baseHours[hour]
      hours[hour] = { id: old?.id ?? `${id}-hour-${hour}`, hour, label: `${String(hour).padStart(2, '0')}:00`, title: hourTitle, hasContent: true, scenes: old?.scenes.length ? structuredClone(old.scenes) : [sceneFor(id, hour, hourTitle, place, season, couple)], status: 'DEMO' }
    }
    const professionals = original?.professionals ?? [professionalIds[i % professionalIds.length], professionalIds[(i + 3) % professionalIds.length]]
    const coverId = place.region.includes('Provence') || ['moulin', 'jardin'].includes(place.type) ? 'cover-provence' : ['plage', 'villa'].includes(place.type) || place.region === 'Corse' ? 'cover-corse' : place.region.includes('Alpes') && season === 'Hiver' ? 'cover-alpes' : 'cover-chateau'
    const story = `${LeOuLa(season)} ${season.toLowerCase()} donne le ton à cette journée imaginée pour ${couple}. À ${place.city}, le ${day} ${MONTHS[month].toLowerCase()}, ${place.name} devient le point de départ d’un récit sensible : les préparatifs, les retrouvailles, les promesses, puis la fête. Ici, ce sont les détails qui font l’histoire — une lumière, une matière, un geste transmis. Ce coffret est une proposition éditoriale à faire grandir, heure après heure, avec celles et ceux qui la rendront réelle.`
    const base = { title, people: original?.people ?? [{ id: `${id}-couple`, name: couple, role: 'mariés', status: 'DEMO' }], day, month, year: YEAR, season }
    return {
      ...(original ? structuredClone(original) : {}), ...base, id, subtitle: original?.subtitle ?? `Une journée singulière, au cœur de ${place.region}`, surtitre: original?.surtitre ?? `FRANCE · ${place.region.toUpperCase()}`, place: place.id,
      ambiance: original?.ambiance ?? `${season.toLowerCase()}, ${place.type}, retrouvailles`, color: original?.color ?? (season === 'Printemps' ? '#899b7d' : season === 'Été' ? '#c5a063' : season === 'Automne' ? '#a47a60' : '#8997a7'), status: 'DEMO', professionals, hours,
      editionNumber: i + 1, date: date.toISOString().slice(0, 10), editorialStatus: original ? 'available' : i % 13 === 0 ? 'verified' : i % 4 === 0 ? 'claimed' : 'available', coverId, story,
      sections: makeSections(base, place, second, story), secondaryPlaceIds: [second.id],
      relations: [{ id: `${id}-main`, targetId: place.id, type: 'place', label: 'Lieu principal' }, { id: `${id}-second`, targetId: second.id, type: 'place', label: 'Lieu en écho' }, ...professionals.map((p, n) => ({ id: `${id}-pro-${n}`, targetId: p, type: 'professional' as const, label: 'Équipe éditoriale' }))],
      ...(original ? { originalEdition: 2025 } : {}), source: 'demo',
    }
  })
  media.forEach(m => { m.coffretIds = coffrets.filter(c => c.coverId === m.id).map(c => c.id) })
  const pick = (test: (p: Place) => boolean, count: number) => coffrets.filter(c => test(places[c.place])).filter((_, i) => i % 5 === 0).slice(0, count).map(c => c.id)
  return {
    schemaVersion: 2, year: YEAR, coffrets, places, professionals: structuredClone(seed.professionals), media, favorites: [], updatedAt: new Date().toISOString(),
    tours: [
      { id: 'tour-provence', title: 'Une échappée en Provence', description: 'De la pierre dorée de Gordes aux rives de la Sorgue, une collection de journées baignées de lumière.', coffretIds: ['wedding_apr', ...pick(p => p.region.includes('Provence'), 3).filter(id => id !== 'wedding_apr')], createdAt: '2026-01-01T00:00:00.000Z' },
      { id: 'tour-chateaux', title: 'Sur la route des châteaux', description: 'Des jardins de Loire au Périgord, les belles demeures racontent des histoires d’aujourd’hui.', coffretIds: pick(p => ['chateau', 'manoir', 'domaine'].includes(p.type), 5), createdAt: '2026-01-01T00:00:00.000Z' },
      { id: 'tour-ocean', title: 'L’océan pour horizon', description: 'Le sel sur la peau, le vent dans les voiles et des promesses tournées vers le large.', coffretIds: ['wedding_may', 'wedding_aug', ...pick(p => p.type === 'plage', 2)], createdAt: '2026-01-01T00:00:00.000Z' },
    ],
  }
}
function LeOuLa(season: Season) { return season === 'Printemps' ? 'Le' : 'L’' }

export function filterCoffrets(data: MagazineData, filters: Filters): Coffret[] {
  const query = normalize(filters.query.trim())
  return data.coffrets.filter(c => {
    const p = data.places[c.place]
    return (!query || normalize(`${c.title} ${c.subtitle} ${c.people.map(x => x.name).join(' ')} ${p.city} ${p.name} ${p.region} ${edition(c.editionNumber)}`).includes(query))
      && (!filters.region || p.region === filters.region)
      && (!filters.season || c.season === filters.season)
      && (!filters.status || c.editorialStatus === filters.status)
      && (!filters.month || c.month === Number(filters.month) - 1)
      && (!filters.favoritesOnly || data.favorites.includes(c.id))
  })
}
export function distanceKm(a: Place, b: Place) {
  const r = Math.PI / 180
  const h = Math.sin((b.lat - a.lat) * r / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin((b.lng - a.lng) * r / 2) ** 2
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)))
}
export function downloadJSON(value: unknown, name: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }))
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export function validateMagazine(value: unknown): value is MagazineData {
  if (!value || typeof value !== 'object') return false
  const d = value as MagazineData
  if (d.schemaVersion !== 2 || d.year !== YEAR || !Array.isArray(d.coffrets) || d.coffrets.length !== 365 || !d.places || !d.professionals || !Array.isArray(d.tours) || !Array.isArray(d.media) || !Array.isArray(d.favorites)) return false
  const ids = new Set(d.coffrets.map(c => c.id))
  const dates = new Set(d.coffrets.map(c => c.date))
  if (ids.size !== 365 || dates.size !== 365) return false
  return d.coffrets.every(c => typeof c.id === 'string' && typeof c.title === 'string' && !!d.places[c.place] && !!c.sections && !!c.hours && ['available', 'claimed', 'verified'].includes(c.editorialStatus) && Array.from({ length: 24 }, (_, h) => c.hours[h]).every(h => h && Array.isArray(h.scenes) && h.scenes.length > 0 && h.scenes.every(s => Array.isArray(s.blocks))) && c.professionals.every(id => !!d.professionals[id])) && d.tours.every(t => typeof t.title === 'string' && Array.isArray(t.coffretIds) && t.coffretIds.every(id => ids.has(id)))
}
