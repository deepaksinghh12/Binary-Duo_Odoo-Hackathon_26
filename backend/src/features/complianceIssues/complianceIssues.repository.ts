import db from '../../database/knex';
import type { ComplianceIssue, CreateComplianceIssueDto, UpdateComplianceIssueDto, ComplianceIssueFilters } from './complianceIssues.types';

const TABLE = 'compliance_issues';

export const complianceIssuesRepository = {
  async findAll(
    filters: ComplianceIssueFilters
  ): Promise<{ data: ComplianceIssue[]; total: number }> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 10));
    const offset = (page - 1) * limit;

    const query = db(TABLE)
      .join('audits', `${TABLE}.audit_id`, 'audits.id')
      .join('users as owners', `${TABLE}.owner_id`, 'owners.id')
      .leftJoin('departments', 'audits.department_id', 'departments.id')
      .whereNull(`${TABLE}.deleted_at`)
      .select(
        `${TABLE}.*`,
        'owners.name as owner_name',
        'audits.department_id',
        'departments.name as department_name'
      );

    if (filters.audit_id)     query.where(`${TABLE}.audit_id`, filters.audit_id);
    if (filters.severity)     query.where(`${TABLE}.severity`, filters.severity);
    if (filters.status)       query.where(`${TABLE}.status`, filters.status);
    if (filters.owner_id)     query.where(`${TABLE}.owner_id`, filters.owner_id);
    if (filters.department_id) query.where('audits.department_id', filters.department_id);

    const totalRes = await query.clone().count({ count: '*' }).first();
    const total = Number(totalRes?.count || 0);

    const data = await query
      .limit(limit)
      .offset(offset)
      .orderBy(`${TABLE}.due_date`, 'asc');

    return { data, total };
  },

  async findById(id: string): Promise<ComplianceIssue | undefined> {
    return db(TABLE)
      .join('audits', `${TABLE}.audit_id`, 'audits.id')
      .join('users as owners', `${TABLE}.owner_id`, 'owners.id')
      .leftJoin('departments', 'audits.department_id', 'departments.id')
      .whereNull(`${TABLE}.deleted_at`)
      .where(`${TABLE}.id`, id)
      .select(
        `${TABLE}.*`,
        'owners.name as owner_name',
        'audits.department_id',
        'departments.name as department_name'
      )
      .first();
  },

  /**
   * GET /compliance-issues/overdue
   * status=open AND due_date < now
   */
  async findOverdue(): Promise<ComplianceIssue[]> {
    return db(TABLE)
      .join('audits', `${TABLE}.audit_id`, 'audits.id')
      .join('users as owners', `${TABLE}.owner_id`, 'owners.id')
      .leftJoin('departments', 'audits.department_id', 'departments.id')
      .whereNull(`${TABLE}.deleted_at`)
      .where(`${TABLE}.status`, 'open')
      .where(`${TABLE}.due_date`, '<', db.fn.now())
      .select(
        `${TABLE}.*`,
        'owners.name as owner_name',
        'audits.department_id',
        'departments.name as department_name'
      )
      .orderBy(`${TABLE}.due_date`, 'asc');
  },

  async create(data: CreateComplianceIssueDto): Promise<ComplianceIssue> {
    const [issue] = await db(TABLE).insert(data).returning('*');
    return issue;
  },

  async update(id: string, data: UpdateComplianceIssueDto): Promise<ComplianceIssue | undefined> {
    const [issue] = await db(TABLE)
      .where({ id })
      .whereNull('deleted_at')
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*');
    return issue;
  },

  async softDelete(id: string): Promise<boolean> {
    const count = await db(TABLE)
      .where({ id })
      .whereNull('deleted_at')
      .update({ deleted_at: db.fn.now(), updated_at: db.fn.now() });
    return count > 0;
  },
};
