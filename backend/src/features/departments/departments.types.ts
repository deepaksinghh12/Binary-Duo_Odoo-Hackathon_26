export interface CreateDepartmentInput {
  name: string;
  code: string;
  headUserId?: string;
  parentDepartmentId?: string;
  status?: string;
}

export interface UpdateDepartmentInput {
  name?: string;
  code?: string;
  headUserId?: string | null;
  parentDepartmentId?: string | null;
  status?: string;
}

export interface DepartmentRecord {
  id: string;
  name: string;
  code: string;
  head_user_id: string | null;
  parent_department_id: string | null;
  employee_count: number;
  status: string;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}
