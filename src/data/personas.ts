import type { Persona, PersonaId } from './types'

export const PERSONAS: Record<PersonaId, Persona> = {
  ceo: { id: 'ceo', name: 'Denera CEO', short: 'CEO', role: 'Shareholder executive', landing: '/portfolio', initials: 'CE', actsAs: 'Shareholder (Denera) decisions. Joint and Project company actions show as Request routes.' },
  pmo: { id: 'pmo', name: 'PMO Director', short: 'PMO', role: 'Chair, steering committee', landing: '/cockpit', initials: 'PD', actsAs: 'Prioritises recovery actions, confirms meeting items as chair, assigns owners.' },
  cll: { id: 'cll', name: 'Commercial and Legal Lead', short: 'Legal', role: 'Contracts and notices', landing: '/notices', initials: 'CL', actsAs: 'Confirms deadlines, reviews AI notice drafts, prepares notices.' },
  bn: { id: 'bn', name: 'Board nominee (Denera)', short: 'Nominee', role: 'Project company board', landing: '/decisions', initials: 'BN', actsAs: 'Votes on Joint items at the project company board.' },
  pcu: { id: 'pcu', name: 'Project Director', short: 'Project co.', role: 'Project company user', landing: '/cockpit', initials: 'PJ', actsAs: 'Project company actions. Sees PSEL Cakrawala Raya only.' },
}

export const PERSONA_ORDER: PersonaId[] = ['ceo', 'pmo', 'cll', 'bn', 'pcu']
