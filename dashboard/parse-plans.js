import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';

// Read the Excel file
const filePath = '/home/user/Cardamyst/Cardamyst_Coverage_Tracker Jan 2026.xlsx';
const workbook = XLSX.read(readFileSync(filePath));

// Get the "Plan Detail" sheet
const sheetName = 'Plan Detail';
const sheet = workbook.Sheets[sheetName];

if (!sheet) {
  console.error('Available sheets:', workbook.SheetNames);
  process.exit(1);
}

// Get the range of the sheet
const range = XLSX.utils.decode_range(sheet['!ref']);

// Extract all plan data (headers at row 3, data starts at row 4)
const plans = [];
for (let r = 4; r <= range.e.r; r++) {
  const segment = sheet[XLSX.utils.encode_cell({ r, c: 0 })]?.v;
  const planName = sheet[XLSX.utils.encode_cell({ r, c: 1 })]?.v;
  const planType = sheet[XLSX.utils.encode_cell({ r, c: 2 })]?.v;
  const payerName = sheet[XLSX.utils.encode_cell({ r, c: 3 })]?.v;
  const pharmacyLives = sheet[XLSX.utils.encode_cell({ r, c: 4 })]?.v;
  const coverageStatus = sheet[XLSX.utils.encode_cell({ r, c: 5 })]?.v;

  // Skip empty rows
  if (!segment && !planName) continue;

  plans.push({
    segment,
    planName,
    planType,
    payerName,
    pharmacyLives,
    coverageStatus
  });
}

// Output as a JavaScript array
console.log('export const planDetails = [');
plans.forEach((plan, index) => {
  const comma = index < plans.length - 1 ? ',' : '';
  console.log(`  { segment: '${plan.segment}', planName: '${plan.planName}', planType: '${plan.planType}', payerName: '${plan.payerName}', pharmacyLives: ${plan.pharmacyLives}, coverageStatus: '${plan.coverageStatus}' }${comma}`);
});
console.log('];');
