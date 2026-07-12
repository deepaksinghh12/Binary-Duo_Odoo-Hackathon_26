import db from '../../database/knex';
import type { Badge, CreateBadgeDto, UpdateBadgeDto } from './badges.types';

const TABLE = 'badges';
const EMPLOYEE_BADGES = 'employee_badges';

export const badgesRepository = {
  async findAll(filters: {
    limit: number;
    offset: number;
    search?: string;
  }): Promise<{ data: Badge[]; total: number }> {
    const query = db(TABLE).whereNull('deleted_at');

    if (filters.search) {
      query.where('name', 'ilike', `%${filters.search}%`);
    }

    const totalRes = await query.clone().count({ count: '*' }).first();
    const total = Number(totalRes?.count || 0);

    const data = await query
      .select('*')
      .limit(filters.limit)
      .offset(filters.offset)
      .orderBy('created_at', 'desc');

    return { data, total };
  },

  async findById(id: string): Promise<Badge | undefined> {
    return db(TABLE).where({ id }).whereNull('deleted_at').first();
  },

  async create(data: CreateBadgeDto): Promise<Badge> {
    const [badge] = await db(TABLE)
      .insert({ ...data, unlock_rule: JSON.stringify(data.unlock_rule) })
      .returning('*');
    return badge;
  },

  async update(id: string, data: UpdateBadgeDto): Promise<Badge | undefined> {
    const updatePayload: any = { ...data, updated_at: db.fn.now() };
    if (data.unlock_rule) {
      updatePayload.unlock_rule = JSON.stringify(data.unlock_rule);
    }
    const [badge] = await db(TABLE)
      .where({ id })
      .whereNull('deleted_at')
      .update(updatePayload)
      .returning('*');
    return badge;
  },

  async softDelete(id: string): Promise<boolean> {
    const count = await db(TABLE)
      .where({ id })
      .whereNull('deleted_at')
      .update({ deleted_at: db.fn.now(), updated_at: db.fn.now() });
    return count > 0;
  },

  /**
   * Return all badges with an extra `unlocked` boolean for a given employee.
   * Used by the badge gallery endpoint.
   */
  async findAllWithEmployeeStatus(
    employeeId: string,
    filters: { limit: number; offset: number }
  ): Promise<{ data: (Badge & { unlocked: boolean; unlocked_at: Date | null })[]; total: number }> {
    const totalRes = await db(TABLE).whereNull('deleted_at').count({ count: '*' }).first();
    const total = Number(totalRes?.count || 0);

    const badges = await db(TABLE)
      .whereNull(`${TABLE}.deleted_at`)
      .leftJoin(EMPLOYEE_BADGES, function () {
        this.on(`${EMPLOYEE_BADGES}.badge_id`, '=', `${TABLE}.id`).andOn(
          db.raw(`${EMPLOYEE_BADGES}.employee_id = ?`, [employeeId])
        );
      })
      .select(
        `${TABLE}.*`,
        db.raw(`CASE WHEN ${EMPLOYEE_BADGES}.badge_id IS NOT NULL THEN true ELSE false END as unlocked`),
        `${EMPLOYEE_BADGES}.unlocked_at`
      )
      .limit(filters.limit)
      .offset(filters.offset)
      .orderBy(`${TABLE}.created_at`, 'desc');

    return { data: badges, total };
  },

  async findEmployeeBadges(employeeId: string): Promise<Badge[]> {
    return db(TABLE)
      .join(EMPLOYEE_BADGES, `${TABLE}.id`, `${EMPLOYEE_BADGES}.badge_id`)
      .where(`${EMPLOYEE_BADGES}.employee_id`, employeeId)
      .whereNull(`${TABLE}.deleted_at`)
      .select(`${TABLE}.*`, `${EMPLOYEE_BADGES}.unlocked_at`);
  },
};
