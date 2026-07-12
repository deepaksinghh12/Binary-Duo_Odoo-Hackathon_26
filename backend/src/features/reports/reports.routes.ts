import { Router, Request, Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';
import { authenticate } from '../../middleware/authenticate';
import { reportRateLimiter } from '../../middleware/rateLimiter';
import { exportCSV, exportXLSX, exportPDF } from '../../utils/exportHelpers';
import { BadRequestError } from '../../shared/errors';

const router = Router();
const reportsService = new ReportsService();

// Apply report-specific rate limiter (30 req/15min) to all report routes
router.use(authenticate, reportRateLimiter);

// ── Data endpoints ──────────────────────────────────────────────────────────

router.get('/environmental', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await reportsService.getEnvironmentalReport(req.query);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
});

router.get('/social', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await reportsService.getSocialReport(req.query);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
});

router.get('/governance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await reportsService.getGovernanceReport(req.query);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
});

router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await reportsService.getESGSummaryReport(req.query);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
});

router.post('/custom', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await reportsService.generateCustomReport(req.body);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
});

// ── Export endpoints ─────────────────────────────────────────────────────────
// GET /api/reports/:type/export?format=csv|xlsx|pdf&department_id=...&start_date=...&end_date=...

router.get('/:type/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.params;
    const format = (req.query.format as string || 'csv').toLowerCase();
    const filters = req.query;

    if (!['csv', 'xlsx', 'pdf'].includes(format)) {
      throw new BadRequestError('Invalid export format. Use csv, xlsx, or pdf.');
    }

    // Fetch the right dataset
    let rawData: any;
    let sheetName = 'Report';
    let filename = `ecosphere-${type}-report`;

    switch (type) {
      case 'environmental':
        rawData = await reportsService.getEnvironmentalReport(filters);
        sheetName = 'Environmental';
        break;
      case 'social':
        rawData = await reportsService.getSocialReport(filters);
        sheetName = 'Social';
        break;
      case 'governance':
        rawData = await reportsService.getGovernanceReport(filters);
        sheetName = 'Governance';
        break;
      case 'summary':
        rawData = await reportsService.getESGSummaryReport(filters);
        sheetName = 'ESG Summary';
        break;
      default:
        throw new BadRequestError(`Unknown report type: ${type}. Use environmental, social, governance, or summary.`);
    }

    // Flatten the data to a row array for export
    const rows = flattenReportData(rawData, type);
    filename += `-${new Date().toISOString().slice(0, 10)}`;

    if (format === 'csv') {
      return exportCSV(res, filename, rows);
    } else if (format === 'xlsx') {
      return await exportXLSX(res, filename, sheetName, rows);
    } else {
      return exportPDF(res, filename, rows);
    }
  } catch (error) {
    next(error);
  }
});

// ── POST /api/reports/custom/export — export custom report results ─────────────
router.post('/custom/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const format = (req.query.format as string || 'csv').toLowerCase();
    if (!['csv', 'xlsx', 'pdf'].includes(format)) {
      throw new BadRequestError('Invalid export format. Use csv, xlsx, or pdf.');
    }

    const rawData = await reportsService.generateCustomReport(req.body);
    const rows = flattenReportData(rawData, 'custom');
    const filename = `ecosphere-custom-report-${new Date().toISOString().slice(0, 10)}`;

    if (format === 'csv') return exportCSV(res, filename, rows);
    if (format === 'xlsx') return await exportXLSX(res, filename, 'Custom Report', rows);
    return exportPDF(res, filename, rows);
  } catch (error) {
    next(error);
  }
});

/**
 * Flatten nested report objects into a flat array of rows for CSV/XLSX.
 * Each report type produces different shapes, so we normalise here.
 */
function flattenReportData(data: any, type: string): Record<string, unknown>[] {
  if (!data) return [];

  switch (type) {
    case 'environmental': {
      const transactions: any[] = data.transactions || [];
      return transactions.map((t) => ({
        id: t.id,
        department_id: t.department_id,
        activity_type: t.activity_type,
        quantity: t.quantity,
        co2e_calculated: t.co2e_calculated,
        source_type: t.source_type,
        transaction_date: t.transaction_date,
      }));
    }
    case 'social': {
      const participations: any[] = data.participation_data || [];
      return participations.map((p) => ({
        id: p.id,
        employee_id: p.employee_id,
        csr_activity_id: p.csr_activity_id,
        approval_status: p.approval_status,
        points_earned: p.points_earned,
        completion_date: p.completion_date,
      }));
    }
    case 'governance': {
      const issues: any[] = data.issues || [];
      return issues.map((i) => ({
        id: i.id,
        description: i.description,
        severity: i.severity,
        status: i.status,
        owner_id: i.owner_id,
        due_date: i.due_date,
        created_at: i.created_at,
      }));
    }
    case 'summary':
    case 'custom': {
      // Return a summary table combining all modules
      const rows: Record<string, unknown>[] = [];
      if (data.environmental) {
        rows.push({ module: 'Environmental', total_co2e: data.environmental.total_co2e, count: data.environmental.transaction_count });
      }
      if (data.social) {
        rows.push({ module: 'Social', total_participation: data.social.total_participation, approved_count: data.social.approved_count });
      }
      if (data.governance) {
        rows.push({ module: 'Governance', total_issues: data.governance.total_issues, resolved_count: data.governance.resolved_count, overdue_count: data.governance.overdue_count });
      }
      return rows;
    }
    default:
      return Array.isArray(data) ? data : [data];
  }
}

export default router;
