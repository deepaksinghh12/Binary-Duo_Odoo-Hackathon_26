import { ConflictError, NotFoundError, BadRequestError } from '../../shared/errors';
import { validate } from '../../utils/validate';
import { departmentsRepository } from './departments.repository';
import { CreateDepartmentInput, UpdateDepartmentInput, DepartmentRecord } from './departments.types';
import { createDepartmentSchema, updateDepartmentSchema } from './departments.validation';

export const departmentsService = {
  /**
   * Fetch all active/non-deleted departments.
   */
  async listDepartments(params: {
    page: number;
    limit: number;
    offset: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    return departmentsRepository.findMany(params);
  },

  /**
   * Create a new department.
   */
  async createDepartment(input: CreateDepartmentInput): Promise<DepartmentRecord> {
    const payload = validate(createDepartmentSchema, input);

    // 1. Check if department code already exists
    const existingCode = await departmentsRepository.findByCode(payload.code);
    if (existingCode) {
      throw new ConflictError(`Department code "${payload.code}" already exists`);
    }

    // 2. Validate parent department if provided
    if (payload.parentDepartmentId) {
      const parentExists = await departmentsRepository.existsAndActive(payload.parentDepartmentId);
      if (!parentExists) {
        throw new NotFoundError('Parent department not found or is inactive');
      }
    }

    // 3. Create the record
    return departmentsRepository.create({
      name: payload.name,
      code: payload.code,
      head_user_id: payload.headUserId ?? null,
      parent_department_id: payload.parentDepartmentId ?? null,
      status: payload.status ?? 'active',
    });
  },

  /**
   * Get single department by ID.
   */
  async getDepartment(id: string): Promise<DepartmentRecord> {
    const department = await departmentsRepository.findById(id);
    if (!department) {
      throw new NotFoundError('Department');
    }
    return department;
  },

  /**
   * Update department details.
   */
  async updateDepartment(id: string, input: UpdateDepartmentInput): Promise<DepartmentRecord> {
    const payload = validate(updateDepartmentSchema, input);

    // 1. Fetch current record
    const current = await departmentsRepository.findById(id);
    if (!current) {
      throw new NotFoundError('Department');
    }

    const updates: Partial<DepartmentRecord> = {};

    // 2. Check code changes for conflicts
    if (payload.code && payload.code !== current.code) {
      const existingCode = await departmentsRepository.findByCode(payload.code);
      if (existingCode) {
        throw new ConflictError(`Department code "${payload.code}" already exists`);
      }
      updates.code = payload.code;
    }

    if (payload.name) updates.name = payload.name;
    if (payload.status) updates.status = payload.status;
    if (payload.headUserId !== undefined) updates.head_user_id = payload.headUserId;

    // 3. Validate parent department changes and guard against circular reference
    if (payload.parentDepartmentId !== undefined) {
      if (payload.parentDepartmentId === id) {
        throw new BadRequestError('A department cannot be its own parent');
      }

      if (payload.parentDepartmentId) {
        const parentExists = await departmentsRepository.existsAndActive(payload.parentDepartmentId);
        if (!parentExists) {
          throw new NotFoundError('Parent department not found or is inactive');
        }

        // Circular loop check: Make sure parentDepartment does not have this department as its ancestor
        let currentParentId: string | null = payload.parentDepartmentId;
        while (currentParentId) {
          const parent = await departmentsRepository.findById(currentParentId);
          if (!parent) break;
          if (parent.parent_department_id === id) {
            throw new BadRequestError('Circular parent-department hierarchy detected');
          }
          currentParentId = parent.parent_department_id;
        }
      }
      updates.parent_department_id = payload.parentDepartmentId;
    }

    const updated = await departmentsRepository.update(id, updates);
    if (!updated) {
      throw new NotFoundError('Department');
    }
    return updated;
  },

  /**
   * Delete a department (soft delete).
   */
  async deleteDepartment(id: string): Promise<void> {
    const current = await departmentsRepository.findById(id);
    if (!current) {
      throw new NotFoundError('Department');
    }
    await departmentsRepository.softDelete(id);
  },
};
