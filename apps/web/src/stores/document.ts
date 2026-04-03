"use client";

import { create } from "zustand";

type DocumentState = {
  vision: string;
  mission: string;
  setVision: (vision: string) => void;
  setMission: (mission: string) => void;
};

export const useDocumentStore = create<DocumentState>((set) => ({
  vision: "",
  mission: "",
  setVision: (vision) => {
    set({ vision });
  },
  setMission: (mission) => {
    set({ mission });
  },
}));
