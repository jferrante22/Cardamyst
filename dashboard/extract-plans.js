import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';

// Read the Excel file
const filePath = '/home/user/Cardamyst/Cardamyst_Coverage_Tracker Jan 2026.xlsx';
const fileBuffer = readFileSync(filePath);
const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

// Check available sheet names
console.log('Available sheets:', workbook.SheetNames);

// Get the "Plan Detail" sheet
const sheetName = 'Plan Detail';
if (!workbook.SheetNames.includes(sheetName)) {
  console.error(`Sheet "${sheetName}" not found!`);
  process.exit(1);
}

const worksheet = workbook.Sheets[sheetName];

// Convert sheet to JSON to analyze structure
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// Display first few rows to understand structure
console.log('\nFirst 10 rows of the sheet:');
data.slice(0, 10).forEach((row, index) => {
  console.log(`Row ${index}:`, row);
});

// Find the header row (the one with "Plan Name" column)
let headerRowIndex = -1;
for (let i = 0; i < data.length; i++) {
  const row = data[i];
  if (row && row.some(cell => cell && typeof cell === 'string' && cell === 'Plan Name')) {
    headerRowIndex = i;
    break;
  }
}

if (headerRowIndex === -1) {
  console.error('Could not find header row with "Plan Name" column');
  process.exit(1);
}

const headerRow = data[headerRowIndex];
console.log(`\nHeader row found at index ${headerRowIndex}:`, headerRow);

// Find plan name column index
const planNameColIndex = headerRow.findIndex(col => col === 'Plan Name');
console.log(`Plan Name column index: ${planNameColIndex}`);

// Extract all plan names (skip header row, start from data rows)
const planNames = data.slice(headerRowIndex + 1)
  .map(row => row[planNameColIndex])
  .filter(name => name && name.toString().trim() !== '');

// Display all plan names
console.log('\n========================================');
console.log('ALL PLAN NAMES:');
console.log('========================================');
planNames.forEach((name, index) => {
  console.log(`${index + 1}. ${name}`);
});

console.log('\n========================================');
console.log(`TOTAL NUMBER OF PLANS: ${planNames.length}`);
console.log('========================================');
