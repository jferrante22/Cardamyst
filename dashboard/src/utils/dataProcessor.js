import * as XLSX from 'xlsx';

/**
 * Parse the Cardamyst Coverage Tracker Excel file
 * @param {ArrayBuffer} buffer - The Excel file buffer
 * @returns {Object} Parsed dashboard data
 */
export function parseExcelData(buffer) {
  const workbook = XLSX.read(buffer, { type: 'array' });

  const data = {
    reportDate: '',
    coverageSnapshot: [],
    topPlans: [],
    monthlyTracking: {
      commercial: { months: [], forecast: [], actual: [], variance: [], coveredLives: [], federalLives: [] },
      medicare: { months: [], actual: [], coveredLives: [] },
      medicaid: { months: [], actual: [], coveredLives: [] },
      total: { months: [], actual: [], coveredLives: [] }
    },
    planDetails: [],
    definitions: {
      segments: [],
      coverageStatus: []
    },
    chartData: []
  };

  // Parse Executive Summary
  const execSheet = workbook.Sheets['Executive Summary'];
  if (execSheet) {
    const execData = XLSX.utils.sheet_to_json(execSheet, { header: 1, defval: '' });

    // Find report date (row 2)
    for (let i = 0; i < execData.length; i++) {
      if (execData[i][0] === 'Report Date:') {
        data.reportDate = execData[i][1] || '';
        break;
      }
    }

    // Find coverage snapshot section
    let snapshotStart = -1;
    let topPlansStart = -1;

    for (let i = 0; i < execData.length; i++) {
      if (execData[i][0] === 'CURRENT COVERAGE SNAPSHOT') {
        snapshotStart = i + 2; // Skip header row
      }
      if (execData[i][0] === 'TOP PLANS DRIVING COVERAGE') {
        topPlansStart = i + 2;
      }
    }

    // Parse coverage snapshot
    if (snapshotStart > 0) {
      for (let i = snapshotStart; i < execData.length; i++) {
        const row = execData[i];
        if (!row[0] || row[0] === 'TOP PLANS DRIVING COVERAGE') break;

        const segment = String(row[0] || '').trim();
        if (segment && segment !== 'Segment') {
          data.coverageSnapshot.push({
            segment: segment,
            totalLives: parseNumber(row[1]),
            coveredLives: parseNumber(row[2]),
            coveragePercent: parseNumber(row[3]),
            notes: row[4] || ''
          });
        }
      }
    }

    // Parse top plans
    if (topPlansStart > 0) {
      for (let i = topPlansStart; i < execData.length; i++) {
        const row = execData[i];
        if (!row[0] || row[0] === '') break;

        const planName = String(row[0] || '').trim();
        if (planName && planName !== 'Plan Name') {
          data.topPlans.push({
            planName: planName,
            planType: row[1] || '',
            coveredLives: parseNumber(row[2]),
            coverageStatus: row[3] || ''
          });
        }
      }
    }
  }

  // Parse Monthly Tracking
  const monthlySheet = workbook.Sheets['Monthly Tracking'];
  if (monthlySheet) {
    const monthlyData = XLSX.utils.sheet_to_json(monthlySheet, { header: 1, defval: '' });

    let section = '';
    for (let i = 0; i < monthlyData.length; i++) {
      const row = monthlyData[i];
      const firstCell = String(row[0] || '').trim();

      if (firstCell === 'COMMERCIAL (incl. Federal)') {
        section = 'commercial';
      } else if (firstCell === 'MEDICARE') {
        section = 'medicare';
      } else if (firstCell === 'MEDICAID') {
        section = 'medicaid';
      } else if (firstCell === 'TOTAL (ALL SEGMENTS)') {
        section = 'total';
      }

      if (firstCell === 'Month') {
        const months = row.slice(1).filter(m => m).map(m => formatMonth(m));
        if (section === 'commercial') data.monthlyTracking.commercial.months = months;
        if (section === 'medicare') data.monthlyTracking.medicare.months = months;
        if (section === 'medicaid') data.monthlyTracking.medicaid.months = months;
        if (section === 'total') data.monthlyTracking.total.months = months;
      }

      if (firstCell === 'Forecast %' && section === 'commercial') {
        data.monthlyTracking.commercial.forecast = row.slice(1).filter((_, idx) => idx < data.monthlyTracking.commercial.months.length).map(v => parseNumber(v) * 100);
      }

      if (firstCell === 'Actual %') {
        const values = row.slice(1).filter((_, idx) => {
          const tracking = data.monthlyTracking[section];
          return tracking && idx < tracking.months.length;
        }).map(v => v ? parseNumber(v) * 100 : null);

        if (data.monthlyTracking[section]) {
          data.monthlyTracking[section].actual = values;
        }
      }

      if (firstCell === 'Variance (pp)' && section === 'commercial') {
        data.monthlyTracking.commercial.variance = row.slice(1).filter((_, idx) => idx < data.monthlyTracking.commercial.months.length).map(v => v ? parseNumber(v) * 100 : null);
      }

      if (firstCell === 'Covered Lives') {
        const values = row.slice(1).filter((_, idx) => {
          const tracking = data.monthlyTracking[section];
          return tracking && idx < tracking.months.length;
        }).map(v => v ? parseNumber(v) : null);

        if (data.monthlyTracking[section]) {
          data.monthlyTracking[section].coveredLives = values;
        }
      }

      if (firstCell === '└ Federal Lives' && section === 'commercial') {
        data.monthlyTracking.commercial.federalLives = row.slice(1).filter((_, idx) => idx < data.monthlyTracking.commercial.months.length).map(v => v ? parseNumber(v) : null);
      }
    }
  }

  // Parse Charts data
  const chartsSheet = workbook.Sheets['Charts'];
  if (chartsSheet) {
    const chartsData = XLSX.utils.sheet_to_json(chartsSheet, { header: 1, defval: '' });

    for (let i = 0; i < chartsData.length; i++) {
      const row = chartsData[i];
      if (row[0] && row[0] !== 'Month' && typeof row[1] !== 'undefined') {
        data.chartData.push({
          month: formatMonth(row[0]),
          commForecast: parseNumber(row[1]) * 100,
          commActual: row[2] ? parseNumber(row[2]) * 100 : null,
          medicare: row[3] ? parseNumber(row[3]) * 100 : null,
          medicaid: row[4] ? parseNumber(row[4]) * 100 : null,
          total: row[5] ? parseNumber(row[5]) * 100 : null
        });
      }
    }
  }

  // Parse Plan Detail
  const planSheet = workbook.Sheets['Plan Detail'];
  if (planSheet) {
    const planData = XLSX.utils.sheet_to_json(planSheet, { header: 1, defval: '' });

    for (let i = 0; i < planData.length; i++) {
      const row = planData[i];
      const segment = String(row[0] || '').trim();

      if (segment &&
          segment !== 'Segment' &&
          !segment.startsWith('Total:') &&
          segment !== 'Plans with Cardamyst Coverage') {
        data.planDetails.push({
          segment: segment,
          planName: row[1] || '',
          planType: row[2] || '',
          payerName: row[3] || '',
          pharmacyLives: parseNumber(row[4]),
          coverageStatus: row[5] || ''
        });
      }
    }
  }

  // Parse Definitions
  const defSheet = workbook.Sheets['Definitions'];
  if (defSheet) {
    const defData = XLSX.utils.sheet_to_json(defSheet, { header: 1, defval: '' });

    let section = '';
    for (let i = 0; i < defData.length; i++) {
      const row = defData[i];
      const firstCell = String(row[0] || '').trim();

      if (firstCell === 'Segment' || firstCell === 'Coverage Status Mapping') {
        section = firstCell === 'Segment' ? 'segments' : 'status';
        continue;
      }

      if (firstCell === 'Status') {
        section = 'status';
        continue;
      }

      if (section === 'segments' && firstCell && firstCell !== 'Segment Definitions') {
        data.definitions.segments.push({
          segment: firstCell,
          planTypes: row[1] || '',
          notes: row[2] || ''
        });
      }

      if (section === 'status' && firstCell) {
        data.definitions.coverageStatus.push({
          status: firstCell,
          countedAsCovered: row[1] || '',
          rationale: row[2] || ''
        });
      }
    }
  }

  return data;
}

/**
 * Parse a number from various formats
 */
function parseNumber(value) {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const cleaned = String(value).replace(/[,%$]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Format month from Excel date or string
 */
function formatMonth(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') {
    // Excel date serial number
    const date = new Date((value - 25569) * 86400 * 1000);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]}-${String(date.getFullYear()).slice(2)}`;
  }
  return String(value);
}

/**
 * Format large numbers for display
 */
export function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined) return '—';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toFixed(decimals);
}

/**
 * Format percentage
 */
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined) return '—';
  return value.toFixed(decimals) + '%';
}

/**
 * Format full number with commas
 */
export function formatFullNumber(num) {
  if (num === null || num === undefined) return '—';
  return Math.round(num).toLocaleString();
}

/**
 * Parse the Cardamyst Contract Tracker Excel file
 * @param {ArrayBuffer} buffer - The Excel file buffer
 * @returns {Object} Parsed contract data
 */
export function parseContractData(buffer) {
  const workbook = XLSX.read(buffer, { type: 'array' });

  const data = {
    lastUpdated: '',
    contracts: [],
    offerHistory: [],
    rateComparison: [],
    summary: {
      total: 0,
      signed: 0,
      submitted: 0,
      countered: 0
    }
  };

  // Parse Contract Status
  const statusSheet = workbook.Sheets['Contract Status'];
  if (statusSheet) {
    const statusData = XLSX.utils.sheet_to_json(statusSheet, { header: 1, defval: '' });

    for (let i = 0; i < statusData.length; i++) {
      const row = statusData[i];
      const firstCell = String(row[0] || '').trim();

      if (firstCell.startsWith('Last Updated:')) {
        data.lastUpdated = firstCell.replace('Last Updated:', '').trim();
      }

      // Skip header rows
      if (firstCell === 'Payer' || !firstCell || firstCell.includes('Cardamyst') || firstCell.includes('Last Updated')) {
        continue;
      }

      // Parse contract rows
      if (row[1] && row[2]) {
        const status = String(row[8] || '').trim();
        data.contracts.push({
          payer: firstCell,
          segment: String(row[1] || '').trim(),
          contractPeriod: String(row[2] || '').trim(),
          baseRebate: parsePercentValue(row[3]),
          adminFee: parsePercentValue(row[4]),
          dataFee: parsePercentValue(row[5]),
          priceProtection: parsePercentValue(row[6]),
          totalFees: parsePercentValue(row[7]),
          status: status,
          lastActionDate: row[9] || null,
          nextAction: row[10] || null,
          notes: String(row[11] || '').trim()
        });

        // Update summary counts
        data.summary.total++;
        if (status.toLowerCase() === 'signed') data.summary.signed++;
        else if (status.toLowerCase() === 'submitted') data.summary.submitted++;
        else if (status.toLowerCase().includes('counter')) data.summary.countered++;
      }
    }
  }

  // Parse Offer History
  const historySheet = workbook.Sheets['Offer History'];
  if (historySheet) {
    const historyData = XLSX.utils.sheet_to_json(historySheet, { header: 1, defval: '' });

    for (let i = 0; i < historyData.length; i++) {
      const row = historyData[i];
      const firstCell = String(row[0] || '').trim();

      if (!firstCell || firstCell === 'Payer' || firstCell.includes('Contract Offer')) {
        continue;
      }

      if (row[1] && row[2]) {
        data.offerHistory.push({
          payer: firstCell,
          segment: String(row[1] || '').trim(),
          version: String(row[2] || '').trim(),
          baseRebate: parsePercentValue(row[3]),
          adminFee: parsePercentValue(row[4]),
          dataFee: parsePercentValue(row[5]),
          priceProtection: parsePercentValue(row[6]),
          total: parsePercentValue(row[7]),
          offerType: String(row[8] || '').trim(),
          responseDate: row[9] || null,
          counterTerms: String(row[10] || '').trim(),
          notes: String(row[11] || '').trim()
        });
      }
    }
  }

  // Parse Rate Comparison
  const rateSheet = workbook.Sheets['Rate Comparison'];
  if (rateSheet) {
    const rateData = XLSX.utils.sheet_to_json(rateSheet, { header: 1, defval: '' });

    for (let i = 0; i < rateData.length; i++) {
      const row = rateData[i];
      const firstCell = String(row[0] || '').trim();

      if (!firstCell || firstCell === 'Payer' || firstCell.includes('Rebate & Fee')) {
        continue;
      }

      if (row[1]) {
        data.rateComparison.push({
          payer: firstCell,
          segment: String(row[1] || '').trim(),
          baseRebate: parsePercentValue(row[2]),
          adminFee: parsePercentValue(row[3]),
          dataFee: parsePercentValue(row[4]),
          priceProtection: parsePercentValue(row[5]),
          totalConcessions: parsePercentValue(row[6]),
          status: String(row[7] || '').trim()
        });
      }
    }
  }

  return data;
}

/**
 * Parse percentage values (handles both "5%" and 0.05 formats)
 */
function parsePercentValue(value) {
  if (value === null || value === undefined || value === '' || value === 'NaN') return null;
  if (typeof value === 'number') {
    // If it's already a decimal (like 0.05), convert to percentage
    return value < 1 ? value * 100 : value;
  }
  const str = String(value).replace('%', '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}
