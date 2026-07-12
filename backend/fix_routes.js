const fs = require('fs');
const path = require('path');

const featuresDir = path.join(__dirname, 'src', 'features');
const filesToFix = [
  'emissionFactors/emissionFactors.routes.ts',
  'environmentalGoals/environmentalGoals.routes.ts',
  'productEsgProfiles/productEsgProfiles.routes.ts',
  'settings/settings.routes.ts',
  'carbonTransactions/carbonTransactions.routes.ts'
];

for (const file of filesToFix) {
  const filePath = path.join(featuresDir, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Change req: AuthenticatedRequest to req: Request
  content = content.replace(/\(req: AuthenticatedRequest,/g, '(req: Request,');
  
  // Cast params
  content = content.replace(/req\.params\.id/g, '(req.params.id as string)');
  content = content.replace(/req\.params\.key/g, '(req.params.key as string)');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed', file);
}
