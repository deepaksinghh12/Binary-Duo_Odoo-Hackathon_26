import db from '../../database/knex';
import { complianceIssuesRepository } from './complianceIssues.repository';
import {
  createComplianceIssueSchema,
  updateComplianceIssueSchema,
  complianceIssueFiltersSchema,
} from './complianceIssues.validation';
import { NotFoundError } from '../../shared/errors';
import type { ComplianceIssue, ComplianceIssueFilters } from './complianceIssues.types';

export const complianceIssuesService = {
  async listIssues(rawFilters: unknown) {
    const filters = complianceIssueFiltersSchema.parse(rawFilters) as ComplianceIssueFilters;
    const { data, total } = await complianceIssuesRepository.findAll(filters);

    return {
      issues: data,
      pagination: {
        page: filters.page!,
        limit: filters.limit!,
        total,
        pages: Math.ceil(total / filters.limit!),
      },
    };
  },

  async getIssue(id: string): Promise<ComplianceIssue> {
    const issue = await complianceIssuesRepository.findById(id);
    if (!issue) throw new NotFoundError('Compliance Issue');
    return issue;
  },

  /**
   * All open issues whose due_date has passed.
   * Consumed by: dashboard overdue flag, notifications cron job.
   */
  async getOverdueIssues(): Promise<ComplianceIssue[]> {
    return complianceIssuesRepository.findOverdue();
  },

  async createIssue(input: unknown): Promise<ComplianceIssue> {
    const payload = createComplianceIssueSchema.parse(input);

    // Verify the audit exists
    const audit = await db('audits').where({ id: payload.audit_id }).whereNull('deleted_at').first();
    if (!audit) throw new NotFoundError('Audit');

    // Verify the owner exists
    const owner = await db('users').where({ id: payload.owner_id, is_active: true }).first();
    if (!owner) throw new NotFoundError('Owner (user)');

    const issue = await complianceIssuesRepository.create({
      ...payload,
      due_date: payload.due_date, // ISO string, stored as date
    });

    // Log activity
    await db('activity_log').insert({
      type: 'compliance_issue',
      message: `New compliance issue created: ${payload.description.substring(0, 80)}`,
      entity_type: 'compliance_issue',
      entity_id: issue.id,
      department_id: audit.department_id || null,
    });

    // Create notification for the owner
    await db('notifications').insert({
      user_id: payload.owner_id,
      type: 'compliance_issue',
      message: `You have been assigned a compliance issue (${payload.severity} severity) due on ${payload.due_date}. Description: ${payload.description.substring(0, 100)}`,
      read: false,
    });

    return issue;
  },

  async updateIssue(id: string, input: unknown): Promise<ComplianceIssue> {
    await this.getIssue(id); // ensure exists
    const payload = updateComplianceIssueSchema.parse(input);
    const updated = await complianceIssuesRepository.update(id, payload);
    if (!updated) throw new NotFoundError('Compliance Issue');
    return updated;
  },

  async deleteIssue(id: string): Promise<void> {
    await this.getIssue(id); // ensure exists
    const deleted = await complianceIssuesRepository.softDelete(id);
    if (!deleted) throw new NotFoundError('Compliance Issue');
  },
};
