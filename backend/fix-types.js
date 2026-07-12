const fs = require('fs');

const files = [
  'src/features/rewards/rewards.routes.ts',
  'src/features/notifications/notifications.routes.ts',
  'src/features/leaderboard/leaderboard.service.ts',
  'src/features/notifications/notifications.service.ts',
  'src/features/reports/reports.service.ts',
  'src/features/rewards/rewards.service.ts',
  'src/features/dashboard/dashboard.repository.ts'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix req.params.id to String(req.params.id)
  content = content.replace(/Service\.(get\w+|update\w+|delete\w+)\(req\.params\.id/g, 'Service.$1(String(req.params.id)');
  content = content.replace(/Service\.redeemReward\(req\.params\.id/g, 'Service.redeemReward(String(req.params.id)');
  content = content.replace(/Service\.markAsRead\(req\.params\.id/g, 'Service.markAsRead(String(req.params.id)');
  
  // Fix type annotations
  content = content.replace(/\.then\(\(row\) =>/g, '.then((row: any) =>');
  content = content.replace(/\.then\(\(r\) =>/g, '.then((r: any) =>');
  content = content.replace(/\.map\(\(user: any, index\)/g, '.map((user: any, index: number)');
  content = content.replace(/\.reduce\(\(sum,/g, '.reduce((sum: any,');
  content = content.replace(/, t\) =>/g, ', t: any) =>');
  content = content.replace(/async \(trx\)/g, 'async (trx: any)');
  content = content.replace(/\.map\(\(a\) =>/g, '.map((a: any) =>');
  
  // Fix activity type
  content = content.replace(/type: string;/g, "type: 'carbon_transaction' | 'challenge' | 'compliance' | 'csr' | 'policy';");
  
  fs.writeFileSync(file, content);
  console.log(`Fixed: ${file}`);
});

console.log('Done!');
