import { describe, expect, it } from "vitest";
import { LeaveCancellation } from "@/domain/entities/leave-cancellation";
import { DomainError } from "@/domain/errors/domain-error";

describe("LeaveCancellation", () => {
  it("should throw when reason is too short", () => {
    expect(
      () =>
        new LeaveCancellation({
          companyId: "8ce975ca-9e69-4f66-97b5-8751de47f84f",
          leaveRequestId: "830bc81f-c1ac-4448-9f48-658f5f42d8d4",
          initiatedByUserId: "bb390507-24b8-4aa7-b744-0cd8b6f66cfa",
          initiatedByRole: "employee",
          reason: "short",
          restoreDays: true,
          lessThan30DaysWarning: false,
          reinforcedJustification: null
        })
    ).toThrowError(DomainError);
  });

  it("should require reinforced justification for employer cancellation under 30 days", () => {
    expect(
      () =>
        new LeaveCancellation({
          companyId: "8ce975ca-9e69-4f66-97b5-8751de47f84f",
          leaveRequestId: "830bc81f-c1ac-4448-9f48-658f5f42d8d4",
          initiatedByUserId: "bb390507-24b8-4aa7-b744-0cd8b6f66cfa",
          initiatedByRole: "manager",
          reason: "Cancellation due to critical production outage.",
          restoreDays: true,
          lessThan30DaysWarning: true,
          reinforcedJustification: "too short"
        })
    ).toThrowError(DomainError);
  });

  it("should create cancellation when rules are satisfied", () => {
    const cancellation = new LeaveCancellation({
      companyId: "8ce975ca-9e69-4f66-97b5-8751de47f84f",
      leaveRequestId: "830bc81f-c1ac-4448-9f48-658f5f42d8d4",
      initiatedByUserId: "bb390507-24b8-4aa7-b744-0cd8b6f66cfa",
      initiatedByRole: "hr",
      reason: "Cancellation due to temporary site shutdown and statutory staffing priority.",
      restoreDays: true,
      lessThan30DaysWarning: true,
      reinforcedJustification: "Exceptional production constraints and legal staffing obligations require this cancellation."
    });

    expect(cancellation.props.restoreDays).toBe(true);
  });
});
