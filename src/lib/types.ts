export type EditorialStatus = 'available' | 'claimed' | 'verified'
export type Season = 'Hiver' | 'Printemps' | 'Été' | 'Automne'
export type Projection = 'grid' | 'map' | 'timeline' | 'magazine' | 'relations'
export type Workspace = 'explore' | 'coffrets' | 'tours' | 'editor' | 'media' | 'places' | 'professionals'

export interface ContentBlock {
  id: string
  type: string
  content: string
  position: { x: number; y: number }
  size: { w: number; h: number }
  metadata: { source: string; verificationStatus: string; mediaType?: string }
  source: string
  relations: string[]
}
export interface Scene {
  id: string
  title: string
  surtitre: string
  subtitle: string
  chapo: string
  blocks: ContentBlock[]
  media: string[]
  relations: string[]
  status: string
}
export interface Moment {
  id: string
  hour: number
  label: string
  title: string
  hasContent: boolean
  scenes: Scene[]
  status: string
}
export interface Place {
  id: string
  name: string
  city: string
  region: string
  country: string
  lat: number
  lng: number
  type: string
  status: string
}
export interface Professional {
  id: string
  type: string
  name: string
  city: string
  status: string
}
export interface LegacyWedding {
  id: string
  month: number
  day: number
  title: string
  subtitle: string
  surtitre: string
  place: string
  ambiance: string
  color: string
  status: string
  professionals: string[]
  people: { id: string; name: string; role: string; status: string }[]
  hours: Record<number, Moment>
}
export type SectionKey = 'identity' | 'territory' | 'story' | 'venue' | 'secondaryPlaces' | 'professionals' | 'activities' | 'transport' | 'accommodation' | 'gastronomy' | 'music' | 'media' | 'documents' | 'timeline' | 'relations'
export interface EditorialSection { title: string; body: string }
export interface Claim {
  name: string
  organization: string
  email: string
  role: string
  submittedAt: string
}
export interface Coffret extends LegacyWedding {
  editionNumber: number
  year: number
  date: string
  season: Season
  editorialStatus: EditorialStatus
  coverId: string
  story: string
  sections: Record<SectionKey, EditorialSection>
  secondaryPlaceIds: string[]
  relations: { id: string; targetId: string; type: 'place' | 'professional' | 'coffret'; label: string }[]
  claim?: Claim
  verification?: { state: 'requested' | 'reviewed'; proof: string; note: string; updatedAt: string }
  originalEdition?: number
  source: 'demo'
}
export interface Tour {
  id: string
  title: string
  description: string
  coffretIds: string[]
  createdAt: string
}
export interface MediaAsset {
  id: string
  name: string
  src: string
  kind: 'image' | 'video' | 'audio' | 'document'
  credit: string
  caption: string
  coffretIds: string[]
}
export interface MagazineData {
  schemaVersion: 2
  year: number
  coffrets: Coffret[]
  places: Record<string, Place>
  professionals: Record<string, Professional>
  tours: Tour[]
  media: MediaAsset[]
  favorites: string[]
  updatedAt: string
}
export interface LegacySeed { weddings: LegacyWedding[]; places: Record<string, Place>; professionals: Record<string, Professional> }
export interface Filters { query: string; region: string; season: string; status: string; month: string; favoritesOnly: boolean }
export const EMPTY_FILTERS: Filters = { query: '', region: '', season: '', status: '', month: '', favoritesOnly: false }
export const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
export const STATUS_LABELS: Record<EditorialStatus, string> = { available: 'À revendiquer', claimed: 'Revendiqué', verified: 'Vérifié' }
export const SECTION_ORDER: SectionKey[] = ['identity', 'territory', 'story', 'venue', 'secondaryPlaces', 'professionals', 'activities', 'transport', 'accommodation', 'gastronomy', 'music', 'media', 'documents', 'timeline', 'relations']
