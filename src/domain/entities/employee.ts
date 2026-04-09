import type { UUID } from "@/types/common";

export type EmployeeProps = {
  readonly id: UUID;
  readonly companyId: UUID;
  readonly userId: UUID;
  readonly employeeNumber: string;
  readonly managerEmployeeId: UUID | null;
  readonly hiredAt: Date;
  readonly seniorityReferenceDate: Date | null;
  readonly isActive: boolean;
};

export class Employee {
  constructor(readonly props: EmployeeProps) {}

  get id(): UUID {
    return this.props.id;
  }

  belongsToCompany(companyId: UUID): boolean {
    return this.props.companyId === companyId;
  }

  isManagedBy(managerEmployeeId: UUID): boolean {
    return this.props.managerEmployeeId === managerEmployeeId;
  }
}
