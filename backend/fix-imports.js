const fs = require('fs');
const path = require('path');

const fixes = [
  // Fix db import
  {
    from: `import { db } from '../../database/knex';`,
    to: `import db from '../../database/knex';`
  },
  {
    from: `import { db } from '../database/knex';`,
    to: `import db from '../database/knex';`
  },
  // Fix requireRole to authorize
  {
    from: `import { requireRole } from '../../middleware/requireRole';`,
    to: `import { authorize } from '../../middleware/authorize';`
  },
  {
    from: `requireRole(['admin', 'manager'])`,
    to: `authorize('admin', 'manager')`
  },
  {
    from: `requireRole(['admin'])`,
    to: `authorize('admin')`
  },
];

const filesToFix = [
  'src/features/challengeParticipation/challengeParticipation.repository.ts',
  'src/features/challengeParticipation/challengeParticipation.service.ts',
  'src/features/challengeParticipation/challengeParticipation.routes.ts',
  'src/features/departmentScores/departmentScores.service.ts',
  'src/features/departmentScores/departmentScores.routes.ts',
  'src/features/leaderboard/leaderboard.service.ts',
  'src/features/notifications/notifications.service.ts',
  'src/features/reports/reports.service.ts',
  'src/features/rewards/rewards.service.ts',
  'src/features/rewards/rewards.routes.ts',
  'src/shared/badgeChecker.service.ts',
];

filesToFix.forEach(file => {
  const filepath = path.join(__dirname, file);
  if (!fs.existsSync(filepath)) {
    console.log(`Skipping ${file} (not found)`);
    return;
  }
  
  let content = fs.readFileSync(filepath, 'utf8');
  let changed = false;
  
  fixes.forEach(fix => {
    if (content.includes(fix.from)) {
      content = content.replace(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(filepath, content);
    console.log(`Fixed: ${file}`);
  }
});

console.log('Done!');
