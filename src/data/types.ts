export type Authority = 'Shareholder (Denera)' | 'Project company' | 'Joint'
export type Health = 'Green' | 'Yellow' | 'Red'
export type Classification = 'Reported' | 'Verified' | 'Forecast' | 'Advisory'
export type Wave = 'W1' | 'W2' | 'W3'
export type Confidence = 'High' | 'Medium' | 'Low'
export type PersonaId = 'ceo' | 'pmo' | 'cll' | 'bn' | 'pcu'

export interface Persona {
  id: PersonaId
  name: string
  short: string
  role: string
  landing: string
  initials: string
  actsAs: string
}

export interface EvidenceDoc {
  id: string
  title: string
  system: string
  location: string
  extract: string
  refreshed: string
  classification?: string
}

export interface Action {
  id: string
  title: string
  owner: string
  authority: Authority
  due: string
  dueIso: string | null
  dueNote?: string
  status: 'Not started' | 'In progress' | 'Done'
  linked: string
  source: string
}
