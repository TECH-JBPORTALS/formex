"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  useInternshipListByProgram,
  useInternshipListByStudent,
  useInternshipsIndex,
  useInternshipsShow,
} from "@/lib/api/generated/internship/internship";

export function useInternshipsList(enabled = true) {
  const queryClient = useQueryClient();
  const { data, ...internshipsQuery } = useInternshipsIndex(
    {
      query: {
        enabled,
        select(data) {
          return data.status === 200 ? data.data.data : [];
        },
      },
    },
    queryClient,
  );

  return {
    internships: data ?? [],
    internshipsQuery,
  };
}

export function useInternship(internshipId: string) {
  const queryClient = useQueryClient();
  const { data, ...internshipQuery } = useInternshipsShow(
    internshipId,
    {
      query: {
        enabled: !!internshipId,
        select(data) {
          return data.status === 200 ? data.data.data : null;
        },
      },
    },
    queryClient,
  );

  return {
    internship: data,
    internshipQuery,
  };
}

export function useInternshipsByProgram(programId: string, enabled = true) {
  const queryClient = useQueryClient();
  const { data, ...internshipsQuery } = useInternshipListByProgram(
    programId,
    {
      query: {
        enabled: enabled && !!programId,
        select(data) {
          return data.status === 200 ? data.data.data : [];
        },
      },
    },
    queryClient,
  );

  return {
    internships: data ?? [],
    internshipsQuery,
  };
}

export function useInternshipsByStudent(studentId: string, enabled = true) {
  const queryClient = useQueryClient();
  const { data, ...internshipsQuery } = useInternshipListByStudent(
    studentId,
    {
      query: {
        enabled: enabled && !!studentId,
        select(data) {
          return data.status === 200 ? data.data.data : [];
        },
      },
    },
    queryClient,
  );

  return {
    internships: data ?? [],
    internshipsQuery,
  };
}
