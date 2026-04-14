"use client";

import { create } from "zustand";

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type TimetableDay = (typeof DAYS)[number];

export const HOURS = [1, 2, 3, 4, 5, 6, 7] as const;

export type TimetableCoordinatorOption = {
  id: string;
  name: string;
};

export type TimetableSubjectOption = {
  id: string;
  name: string;
  coordinators: TimetableCoordinatorOption[];
};

export type SubjectEntry = {
  subjectId: string;
  subjectName: string;
  coordinatorId: string;
  coordinatorName: string;
  roomNumber: string;
  batchNumber: string;
};

export type TimetableSlot = {
  day: TimetableDay;
  startHour: number;
  endHour: number;
  subjects: SubjectEntry[];
};

export type SelectedCell = {
  day: TimetableDay;
  startHour: number;
};

export type TimetableFormState = {
  endHour: number | null;
  subjects: Array<{
    subjectId: string;
    coordinatorId: string;
    roomNumber: string;
    batchNumber: string;
  }>;
};

function areSubjectEntriesEqual(
  a: TimetableFormState["subjects"][number],
  b: TimetableFormState["subjects"][number],
) {
  return (
    a.subjectId === b.subjectId &&
    a.coordinatorId === b.coordinatorId &&
    a.roomNumber === b.roomNumber &&
    a.batchNumber === b.batchNumber
  );
}

export function areTimetableFormStatesEqual(
  a: TimetableFormState,
  b: TimetableFormState,
) {
  if (a.endHour !== b.endHour) {
    return false;
  }

  if (a.subjects.length !== b.subjects.length) {
    return false;
  }

  return a.subjects.every((entry, index) =>
    areSubjectEntriesEqual(entry, b.subjects[index]),
  );
}

type UpdateSlotResult = {
  ok: boolean;
  message?: string;
  slot?: TimetableSlot;
};

type TimetableState = {
  subjectOptions: TimetableSubjectOption[];
  selectedCell: SelectedCell | null;
  timetable: Record<string, TimetableSlot>;
  occupiedHours: Record<string, number>;
  formState: TimetableFormState;
  setSubjectOptions: (subjectOptions: TimetableSubjectOption[]) => void;
  hydrateSlots: (slots: TimetableSlot[]) => void;
  selectCell: (day: TimetableDay, hour: number) => void;
  clearSelection: () => void;
  setFormState: (formState: TimetableFormState) => void;
  updateSlot: () => UpdateSlotResult;
  applySlot: (slot: TimetableSlot) => void;
  resetForm: () => void;
};

const slotKey = (day: TimetableDay, hour: number) => `${day}-${hour}`;
const occupiedKey = (day: TimetableDay, hour: number) => `${day}-${hour}`;

const createSubjectEntry = (
  subjectOptions: TimetableSubjectOption[],
): TimetableFormState["subjects"][number] => ({
  subjectId: subjectOptions[0]?.id ?? "",
  coordinatorId: subjectOptions[0]?.coordinators[0]?.id ?? "",
  roomNumber: "",
  batchNumber: "",
});

export function getEndHourOptions(startHour: number): number[] {
  if (startHour < 1 || startHour > 7) {
    return [];
  }
  if (startHour <= 4) {
    return Array.from(
      { length: 4 - startHour + 1 },
      (_, idx) => startHour + idx,
    );
  }
  return Array.from({ length: 7 - startHour + 1 }, (_, idx) => startHour + idx);
}

function buildOccupiedHours(
  timetable: Record<string, TimetableSlot>,
): Record<string, number> {
  const occupied: Record<string, number> = {};

  for (const slot of Object.values(timetable)) {
    for (let hour = slot.startHour; hour <= slot.endHour; hour += 1) {
      occupied[occupiedKey(slot.day, hour)] = slot.startHour;
    }
  }

  return occupied;
}

function canCrossLunch(startHour: number, endHour: number) {
  return startHour <= 4 && endHour >= 5;
}

function createFormForCell(
  day: TimetableDay,
  startHour: number,
  timetable: Record<string, TimetableSlot>,
  subjectOptions: TimetableSubjectOption[],
): TimetableFormState {
  const existingSlot = timetable[slotKey(day, startHour)];

  if (existingSlot) {
    return {
      endHour: existingSlot.endHour,
      subjects: existingSlot.subjects.map((entry) => ({
        subjectId: entry.subjectId,
        coordinatorId: entry.coordinatorId,
        roomNumber: entry.roomNumber,
        batchNumber: entry.batchNumber,
      })),
    };
  }

  const options = getEndHourOptions(startHour);
  return {
    endHour: options[0] ?? null,
    subjects: [createSubjectEntry(subjectOptions)],
  };
}

export const useTimetableStore = create<TimetableState>((set, get) => ({
  subjectOptions: [],
  selectedCell: null,
  timetable: {},
  occupiedHours: {},
  formState: {
    endHour: null,
    subjects: [createSubjectEntry([])],
  },

  setSubjectOptions: (subjectOptions) => {
    set((state) => ({
      subjectOptions,
      formState: state.selectedCell
        ? state.formState
        : { endHour: null, subjects: [createSubjectEntry(subjectOptions)] },
    }));
  },

  hydrateSlots: (slots) => {
    const nextTimetable = slots.reduce<Record<string, TimetableSlot>>(
      (acc, slot) => {
        acc[slotKey(slot.day, slot.startHour)] = slot;
        return acc;
      },
      {},
    );
    const subjectOptions = get().subjectOptions;
    set({
      timetable: nextTimetable,
      occupiedHours: buildOccupiedHours(nextTimetable),
      selectedCell: null,
      formState: {
        endHour: null,
        subjects: [createSubjectEntry(subjectOptions)],
      },
    });
  },

  selectCell: (day, hour) => {
    if (!HOURS.includes(hour as (typeof HOURS)[number])) {
      return;
    }

    set((state) => ({
      selectedCell: { day, startHour: hour },
      formState: createFormForCell(
        day,
        hour,
        state.timetable,
        state.subjectOptions,
      ),
    }));
  },

  clearSelection: () => {
    const subjectOptions = get().subjectOptions;
    set({
      selectedCell: null,
      formState: {
        endHour: null,
        subjects: [createSubjectEntry(subjectOptions)],
      },
    });
  },

  setFormState: (formState) => {
    set((state) => {
      const nextFormState: TimetableFormState = {
        endHour: formState.endHour,
        subjects:
          formState.subjects.length > 0
            ? formState.subjects.map((subject) => ({ ...subject }))
            : [createSubjectEntry(state.subjectOptions)],
      };

      if (areTimetableFormStatesEqual(state.formState, nextFormState)) {
        return state;
      }

      return {
        formState: nextFormState,
      };
    });
  },

  updateSlot: () => {
    const { selectedCell, formState, timetable, subjectOptions } = get();

    if (!selectedCell) {
      return { ok: false, message: "Select a slot first." };
    }

    const { day, startHour } = selectedCell;
    const { endHour, subjects } = formState;

    if (!endHour) {
      return { ok: false, message: "Select an end hour." };
    }

    if (endHour < startHour) {
      return { ok: false, message: "End hour must be at or after start hour." };
    }

    if (endHour > 7) {
      return { ok: false, message: "End hour cannot exceed H7." };
    }

    if (canCrossLunch(startHour, endHour)) {
      return { ok: false, message: "Slot cannot cross lunch break." };
    }

    if (subjects.length === 0) {
      return { ok: false, message: "Add at least one subject." };
    }

    const hasIncompleteSubject = subjects.some(
      (entry) =>
        !entry.subjectId ||
        !entry.coordinatorId ||
        !entry.roomNumber.trim() ||
        !entry.batchNumber.trim(),
    );

    if (hasIncompleteSubject) {
      return {
        ok: false,
        message: "Complete all subject fields before saving.",
      };
    }

    const nextTimetable = { ...timetable };
    delete nextTimetable[slotKey(day, startHour)];
    const occupiedWithoutCurrent = buildOccupiedHours(nextTimetable);

    for (let hour = startHour; hour <= endHour; hour += 1) {
      if (occupiedWithoutCurrent[occupiedKey(day, hour)]) {
        return {
          ok: false,
          message: "This range overlaps an existing slot.",
        };
      }
    }

    const optionById = new Map(
      subjectOptions.map((option) => [option.id, option]),
    );
    const normalizedSubjects = subjects.map((entry) => {
      const subjectOption = optionById.get(entry.subjectId);
      const coordinator = subjectOption?.coordinators.find(
        (item) => item.id === entry.coordinatorId,
      );
      return {
        subjectId: entry.subjectId,
        subjectName: subjectOption?.name ?? "",
        coordinatorId: entry.coordinatorId,
        coordinatorName: coordinator?.name ?? "",
        roomNumber: entry.roomNumber.trim(),
        batchNumber: entry.batchNumber.trim(),
      };
    });

    const nextSlot: TimetableSlot = {
      day,
      startHour,
      endHour,
      subjects: normalizedSubjects,
    };
    return { ok: true, slot: nextSlot };
  },

  applySlot: (slot) => {
    const { timetable, selectedCell } = get();
    const nextTimetable = { ...timetable };

    if (selectedCell) {
      delete nextTimetable[slotKey(selectedCell.day, selectedCell.startHour)];
    }

    nextTimetable[slotKey(slot.day, slot.startHour)] = {
      ...slot,
      subjects: slot.subjects.map((subject) => ({ ...subject })),
    };

    set({
      timetable: nextTimetable,
      occupiedHours: buildOccupiedHours(nextTimetable),
    });
  },

  resetForm: () => {
    const { selectedCell, timetable, subjectOptions } = get();
    if (!selectedCell) {
      set({
        formState: {
          endHour: null,
          subjects: [createSubjectEntry(subjectOptions)],
        },
      });
      return;
    }

    set({
      formState: createFormForCell(
        selectedCell.day,
        selectedCell.startHour,
        timetable,
        subjectOptions,
      ),
    });
  },
}));

export { occupiedKey, slotKey };
export { createSubjectEntry };
