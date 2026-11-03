export type Authority = 'Shareholder (Denera)' | 'Project company' | 'Joint'
export type Health = 'Green' | 'Yellow' | 'Red'
export type Classification = 'Reported' | 'Verified' | 'Forecast' | 'Advisory'
export type Wave = 'W1' | 'W2' | 'W3'
export type Confidence = 'High' | 'Medium' | 'Low'
export type PersonaId = 'ceo' | 'coo' | 'pmo' | 'cll' | 'bn' | 'pcu'

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

export type Level = 'High' | 'Medium' | 'Low'
export type RiskStatus = 'Not started' | 'In progress' | 'Mitigated' | 'Closed'
export interface Risk {
  id: string
  risk: string
  p: Level
  i: Level
  owner: string | null
  status: RiskStatus
  pkg: string
}

/** A remark on a computed rating or record. Ratings themselves are never edited. */
export interface Comment {
  id: string
  by: string
  role: PersonaId
  at: string
  text: string
}

/** A recommended action from ATLAS waiting for a named person to accept it. */
export interface Proposal {
  text: string
  authority: Authority
  from: string
}
