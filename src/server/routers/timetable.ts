import { z } from "zod";
import { createRouter, publicProcedure } from "../trpc";
import { timetables, timetableSessions } from "@/server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const sessionInput = z.object({
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Use HH:mm format"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Use HH:mm format"),
  subjectName: z.string().min(1),
  location: z.string().min(1),
  instructorId: z.string().uuid().optional(),
  isLab: z.number().min(0).max(1).default(0),
});

export const timetableRouter = createRouter({
  
  create: publicProcedure
    .input(z.object({
      name: z.string().min(3),
      type: z.enum(["CLASS", "LAB", "PERSONNEL", "MASTER"]),
      entityId: z.string().uuid().optional(),
      sessions: z.array(sessionInput)
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.transaction(async (tx) => {
          // 1. Create the parent record
          const result = await tx.insert(timetables).values({
            name: input.name,
            type: input.type,
            entityId: input.entityId,
          }).returning();

          const newTimetable = result[0];

          // Guard Clause for TypeScript
          if (!newTimetable) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create timetable record.",
            });
          }

          // 2. Insert sessions tied to the confirmed newTimetable.id
          if (input.sessions.length > 0) {
            await tx.insert(timetableSessions).values(
              input.sessions.map(s => ({ 
                ...s, 
                timetableId: newTimetable.id 
              }))
            );
          }
          
          return newTimetable;
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: "CONFLICT",
          message: "Schedule conflict: The room or instructor is already booked for this slot.",
        });
      }
    }),

  view: publicProcedure
    .input(z.object({ 
      type: z.enum(["CLASS", "LAB", "PERSONNEL", "MASTER"]),
      entityId: z.string().uuid().optional() 
    }))
    .query(async ({ ctx, input }) => {
      const filters = [eq(timetables.type, input.type)];
      
      // Safety check for entityId to prevent filtering by undefined
      if (input.entityId) {
        filters.push(eq(timetables.entityId, input.entityId));
      }

      return await ctx.db.query.timetables.findMany({
        where: and(...filters),
        with: { sessions: true },
        orderBy: [desc(timetables.createdAt)]
      });
    }),

  updateSession: publicProcedure
    .input(z.object({
      sessionId: z.string().uuid(),
      data: sessionInput.partial()
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.update(timetableSessions)
        .set(input.data)
        .where(eq(timetableSessions.id, input.sessionId))
        .returning();
    }),

  generateReport: publicProcedure
    .input(z.object({ type: z.enum(["CLASS", "LAB", "PERSONNEL", "MASTER"]) }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(timetables)
        .innerJoin(timetableSessions, eq(timetables.id, timetableSessions.timetableId))
        .where(eq(timetables.type, input.type));
    }),
});