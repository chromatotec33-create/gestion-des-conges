import type { Employee } from "@/domain/entities/employee";
import type { UUID } from "@/types/common";

export interface EmployeeRepository {
  findById(companyId: UUID, employeeId: UUID): Promise<Employee | null>;
  findManager(companyId: UUID, employeeId: UUID): Promise<Employee | null>;
  findDirectReports(companyId: UUID, managerEmployeeId: UUID): Promise<Employee[]>;
}
