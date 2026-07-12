import { Router, Request, Response, NextFunction } from 'express';
import db from '../../database/knex';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { NotFoundError, BadRequestError, ConflictError } from '../../shared/errors';
import type { AuthenticatedRequest } from '../../shared/types';

const router = Router();

router.use(authenticate);

/**
 * POST /api/policies/:policyId/acknowledge
 * Employee acknowledges a policy. Duplicate acknowledgement returns 409.
 */
router.post('/:policyId/acknowledge', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const employeeId = authReq.user.userId;
    const { policyId } = req.params;

    // Verify policy exists and is active
    const policy = await db('policies')
      .where({ id: policyId })
      .whereNull('deleted_at')
      .first();
    if (!policy) throw new NotFoundError('Policy');
    if (policy.status === 'inactive') throw new BadRequestError('Cannot acknowledge an inactive policy');

    // Prevent duplicate acknowledgements
    const existing = await db('policy_acknowledgements')
      .where({ policy_id: policyId, employee_id: employeeId })
      .first();
    if (existing) throw new ConflictError('You have already acknowledged this policy');

    const [ack] = await db('policy_acknowledgements')
      .insert({ policy_id: policyId, employee_id: employeeId })
      .returning('*');

    // Log activity
    await db('activity_log').insert({
      type: 'policy_acknowledgement',
      message: `Policy acknowledged: ${policy.title}`,
      entity_type: 'policy',
      entity_id: policyId,
      user_id: employeeId,
    });

    res.status(201).json({ success: true, data: ack, message: 'Policy acknowledged successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/policies/:policyId/acknowledgement-stats
 * Admin/manager: completion % per policy, broken down by department.
 */
router.get(
  '/:policyId/acknowledgement-stats',
  authorize('admin', 'manager'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { policyId } = req.params;

      const policy = await db('policies').where({ id: policyId }).whereNull('deleted_at').first();
      if (!policy) throw new NotFoundError('Policy');

      // Total employees per department and acknowledged count
      const deptStats = await db('departments')
        .whereNull('departments.deleted_at')
        .leftJoin('users', function () {
          this.on('users.department_id', '=', 'departments.id').andOn(
            db.raw('users.is_active = true')
          );
        })
        .leftJoin('policy_acknowledgements', function () {
          this.on('policy_acknowledgements.employee_id', '=', 'users.id').andOn(
            db.raw('policy_acknowledgements.policy_id = ?', [policyId])
          );
        })
        .groupBy('departments.id', 'departments.name')
        .select(
          'departments.id as department_id',
          'departments.name as department_name',
          db.raw('COUNT(DISTINCT users.id) as total_employees'),
          db.raw('COUNT(DISTINCT policy_acknowledgements.employee_id) as acknowledged_count')
        )
        .orderBy('departments.name', 'asc');

      const stats = deptStats.map((row: any) => ({
        department_id: row.department_id,
        department_name: row.department_name,
        total_employees: Number(row.total_employees),
        acknowledged_count: Number(row.acknowledged_count),
        completion_percent:
          Number(row.total_employees) > 0
            ? Math.round((Number(row.acknowledged_count) / Number(row.total_employees)) * 100)
            : 0,
      }));

      const totalEmployees = stats.reduce((s, r) => s + r.total_employees, 0);
      const totalAcknowledged = stats.reduce((s, r) => s + r.acknowledged_count, 0);

      res.json({
        success: true,
        data: {
          policy_id: policyId,
          policy_title: policy.title,
          overall_completion_percent:
            totalEmployees > 0 ? Math.round((totalAcknowledged / totalEmployees) * 100) : 0,
          total_employees: totalEmployees,
          total_acknowledged: totalAcknowledged,
          by_department: stats,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/policies/:policyId/my-acknowledgement
 * Employee checks if they've acknowledged a specific policy.
 */
router.get('/:policyId/my-acknowledgement', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const ack = await db('policy_acknowledgements')
      .where({ policy_id: req.params.policyId, employee_id: authReq.user.userId })
      .first();

    res.json({ success: true, data: { acknowledged: !!ack, acknowledged_at: ack?.acknowledged_at || null } });
  } catch (err) {
    next(err);
  }
});

export { router as policyAcknowledgementsRouter };
