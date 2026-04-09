import { DomainError } from "@/domain/errors/domain-error";

export class DateRange {
  readonly start: Date;
  readonly end: Date;

  constructor(start: Date, end: Date) {
    if (end < start) {
      throw new DomainError("Date range is invalid", "INVALID_DATE_RANGE", {
        start,
        end
      });
    }

    this.start = start;
    this.end = end;
  }

  includes(date: Date): boolean {
    return date >= this.start && date <= this.end;
  }

  totalDaysInclusive(): number {
    const diff = this.end.getTime() - this.start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  }
}
