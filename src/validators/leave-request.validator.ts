import { z } from "zod";

const uuidSchema = z.string().uuid();

export const leaveRequestDaySchema = z.object({
  leaveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
  dayPart: z.enum(["FULL_DAY", "AM", "PM"]),
  durationDays: z.number().positive().max(1)
});

export const createLeaveRequestSchema = z.object({
  companyId: uuidSchema,
  employeeId: uuidSchema,
  leaveTypeId: uuidSchema,
  reason: z.string().trim().max(2000).optional(),
  createdByUserId: uuidSchema,
  days: z.array(leaveRequestDaySchema).min(1)
});

export const cancelLeaveRequestSchema = z.object({
  companyId: uuidSchema,
  leaveRequestId: uuidSchema,
  initiatedByUserId: uuidSchema,
  initiatedByRole: z.enum(["employee", "manager", "hr", "direction", "super_admin"]),
  reason: z.string().trim().min(10).max(2000),
  restoreDays: z.boolean(),
  reinforcedJustification: z.string().trim().max(2000).optional()
});

export type CreateLeaveRequestPayload = z.infer<typeof createLeaveRequestSchema>;
export type CancelLeaveRequestPayload = z.infer<typeof cancelLeaveRequestSchema>;
