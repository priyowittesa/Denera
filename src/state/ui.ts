import { create } from 'zustand'

interface UiState {
  evidence: string | null
  registerOpen: boolean
  definitionsOpen: boolean
  auditOpen: boolean
  navOpen: boolean
  setNavOpen: (v: boolean) => void
  openEvidence: (id: string) => void
  closeEvidence: () => void
  setRegisterOpen: (v: boolean) => void
  setDefinitionsOpen: (v: boolean) => void
  setAuditOpen: (v: boolean) => void
}

export const useUi = create<UiState>((set) => ({
  evidence: null,
  registerOpen: false,
  definitionsOpen: false,
  auditOpen: false,
  navOpen: false,
  setNavOpen: (v) => set({ navOpen: v }),
  openEvidence: (id) => set({ evidence: id }),
  closeEvidence: () => set({ evidence: null }),
  setRegisterOpen: (v) => set({ registerOpen: v }),
  setDefinitionsOpen: (v) => set({ definitionsOpen: v }),
  setAuditOpen: (v) => set({ auditOpen: v }),
}))
