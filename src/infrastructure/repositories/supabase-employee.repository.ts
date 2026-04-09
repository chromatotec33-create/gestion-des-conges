import { Employee } from "@/domain/entities/employee";
import { DomainError } from "@/domain/errors/domain-error";
import type { EmployeeRepository } from "@/repositories/interfaces/employee.repository";
import type { UUID } from "@/types/common";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";

type EmployeeRow = {
  id: string;
  company_id: string;
  user_id: string;
  employee_number: string;
  manager_employee_id: string | null;
  hired_at: string;
  seniority_reference_date: string | null;
  is_active: boolean;
};

function mapEmployee(row: EmployeeRow): Employee {
  return new Employee({
    id: row.id,
    companyId: row.company_id,
    userId: row.user_id,
    employeeNumber: row.employee_number,
    managerEmployeeId: row.manager_employee_id,
    hiredAt: new Date(row.hired_at),
    seniorityReferenceDate: row.seniority_reference_date ? new Date(row.seniority_reference_date) : null,
    isActive: row.is_active
  });
}

export class SupabaseEmployeeRepository implements EmployeeRepository {
  async findById(companyId: UUID, employeeId: UUID): Promise<Employee | null> {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("employees")
      .select("id, company_id, user_id, employee_number, manager_employee_id, hired_at, seniority_reference_date, is_active")
      .eq("company_id", companyId)
      .eq("id", employeeId)
      .maybeSingle<EmployeeRow>();

    if (error) {
      throw new DomainError("Failed to fetch employee", "REPOSITORY_EMPLOYEE_FETCH_FAILED", { cause: error.message });
    }

    return data ? mapEmployee(data) : null;
  }

  async findManager(companyId: UUID, employeeId: UUID): Promise<Employee | null> {
    const employee = await this.findById(companyId, employeeId);

    if (!employee?.props.managerEmployeeId) {
      return null;
    }

    return this.findById(companyId, employee.props.managerEmployeeId);
  }

  async findDirectReports(companyId: UUID, managerEmployeeId: UUID): Promise<Employee[]> {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("employees")
      .select("id, company_id, user_id, employee_number, manager_employee_id, hired_at, seniority_reference_date, is_active")
      .eq("company_id", companyId)
      .eq("manager_employee_id", managerEmployeeId)
      .returns<EmployeeRow[]>();

    if (error) {
      throw new DomainError("Failed to fetch manager direct reports", "REPOSITORY_MANAGER_REPORTS_FETCH_FAILED", {
        cause: error.message
      });
    }

    return (data ?? []).map(mapEmployee);
  }
}
