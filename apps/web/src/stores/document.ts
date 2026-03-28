import { create } from "zustand";

type DocumentState = {
  institutionName: string;
  institutionCode: string;
  vision: string;
  mission: string;

  setInstitutionName: (v: string) => void;
  setVision: (v: string) => void;
  setMission: (v: string) => void;
};

export const useDocumentStore = create<DocumentState>((set) => ({
  institutionName: "",
  institutionCode: "",
  vision: "",
  mission: "",

  setInstitutionName: (v) => set({ institutionName: v }),
  setVision: (v) => set({ vision: v }),
  setMission: (v) => set({ mission: v }),
}));
