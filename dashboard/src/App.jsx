import { useState, useEffect } from 'react';
import { Users, Building2, FileSpreadsheet, Activity } from 'lucide-react';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import MetricCard from './components/MetricCard';
import CoverageChart from './components/CoverageChart';
import SegmentBreakdown from './components/SegmentBreakdown';
import PlansTable from './components/PlansTable';
import FileUpload from './components/FileUpload';
import MonthlyMetrics from './components/MonthlyMetrics';
import ContractDashboard from './components/ContractDashboard';
import LoadingScreen from './components/LoadingScreen';
import { parseExcelData, parseContractData, formatNumber, formatPercent, formatFullNumber } from './utils/dataProcessor';

// Default coverage data
const DEFAULT_COVERAGE_DATA = {
  reportDate: 'January 2026 (Partial)',
  coverageSnapshot: [
    { segment: 'Commercial (incl. Federal)', totalLives: 186512403.298392, coveredLives: 6816075.350185, coveragePercent: 0.036545, notes: 'Employer, PBM, HIX, FEHBP, VA, TRICARE' },
    { segment: '└ Federal Programs', totalLives: 15711264, coveredLives: 5749433, coveragePercent: 0.365943, notes: 'TRICARE, VA (subset of Commercial)' },
    { segment: 'Medicare', totalLives: 53706458.103405, coveredLives: 0, coveragePercent: 0, notes: 'Part D, MA, SNP, EGWP, PACE' },
    { segment: 'Medicaid', totalLives: 76473936.785584, coveredLives: 0, coveragePercent: 0, notes: 'State, Managed, CHIP' },
    { segment: 'TOTAL', totalLives: 316692798.187381, coveredLives: 6816075.350185, coveragePercent: 0.021523, notes: 'All Segments Combined' }
  ],
  topPlans: [
    { planName: 'TRICARE Uniform Formulary', planType: 'Fed Prog', coveredLives: 5749433, coverageStatus: '(T3) Non-Preferred' },
    { planName: 'CHI Franciscan', planType: 'Employer', coveredLives: 217484, coverageStatus: '(T3) Non-Preferred' },
    { planName: 'MGM Resorts International', planType: 'Employer', coveredLives: 183545, coverageStatus: '(T3) Non-Preferred' },
    { planName: 'General Electric', planType: 'Employer', coveredLives: 118127, coverageStatus: '(T3) Non-Preferred' },
    { planName: 'Apple', planType: 'Employer', coveredLives: 106071, coverageStatus: '(T3) Non-Preferred' }
  ],
  planDetails: [
    { segment: 'Commercial (Federal)', planName: 'TRICARE Uniform Formulary', planType: 'Fed Prog', payerName: 'Defense Health Agency', pharmacyLives: 5749433, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'CHI Franciscan', planType: 'Employer', payerName: 'CHI Franciscan', pharmacyLives: 217484, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'MGM Resorts International', planType: 'Employer', payerName: 'MGM Resorts International', pharmacyLives: 183545, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'General Electric', planType: 'Employer', payerName: 'General Electric', pharmacyLives: 118127, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'Apple', planType: 'Employer', payerName: 'Apple', pharmacyLives: 106071, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'State of Ohio', planType: 'Employer', payerName: 'State of Ohio', pharmacyLives: 105276, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'State of Michigan', planType: 'Employer', payerName: 'State of Michigan', pharmacyLives: 91117, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'Weis Markets', planType: 'Employer', payerName: 'Weis Markets', pharmacyLives: 41806, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'Smithfield Foods', planType: 'Employer', payerName: 'Smithfield Foods', pharmacyLives: 21372, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'Milwaukee Public Schools', planType: 'Employer', payerName: 'Milwaukee Public Schools', pharmacyLives: 20367, coverageStatus: '(T3) Non-Preferred' }
  ],
  monthlyTracking: {
    commercial: {
      months: ['Jan-26', 'Feb-26', 'Mar-26', 'Apr-26', 'May-26', 'Jun-26', 'Jul-26', 'Aug-26', 'Sep-26', 'Oct-26', 'Nov-26', 'Dec-26'],
      forecast: [0, 0, 0, 6, 11, 29, 44, 52, 58, 58, 58, 58],
      actual: [3.6545, null, null, null, null, null, null, null, null, null, null, null],
      coveredLives: [6816075, null, null, null, null, null, null, null, null, null, null, null],
      federalLives: [5749433, null, null, null, null, null, null, null, null, null, null, null]
    },
    medicare: { months: ['Jan-26'], actual: [0], coveredLives: [0] },
    medicaid: { months: ['Jan-26'], actual: [0], coveredLives: [0] },
    total: { months: ['Jan-26'], actual: [2.1523], coveredLives: [6816075] }
  },
  chartData: [
    { month: 'Jan-26', commForecast: 0, commActual: 3.6545 },
    { month: 'Feb-26', commForecast: 0, commActual: null },
    { month: 'Mar-26', commForecast: 0, commActual: null },
    { month: 'Apr-26', commForecast: 6, commActual: null },
    { month: 'May-26', commForecast: 11, commActual: null },
    { month: 'Jun-26', commForecast: 29, commActual: null },
    { month: 'Jul-26', commForecast: 44, commActual: null },
    { month: 'Aug-26', commForecast: 52, commActual: null },
    { month: 'Sep-26', commForecast: 58, commActual: null }
  ]
};

// Default contract data
const DEFAULT_CONTRACT_DATA = {
  lastUpdated: 'January 20, 2026',
  contracts: [
    { payer: 'CVS Caremark', segment: 'Medicare Part D', contractPeriod: '2027 (eff. 2026)', baseRebate: 5, adminFee: 4, dataFee: 1.5, priceProtection: 4, totalFees: 14.5, status: 'Submitted', notes: '' },
    { payer: 'Express Scripts', segment: 'Medicare Part D', contractPeriod: '2026-2027', baseRebate: 5, adminFee: 5, dataFee: 0, priceProtection: 5, totalFees: 15, status: 'Signed', notes: '' },
    { payer: 'Express Scripts', segment: 'Government', contractPeriod: '2026-2027', baseRebate: 5, adminFee: 5, dataFee: 0, priceProtection: null, totalFees: 10, status: 'Signed', notes: 'Includes Managed Medicaid' },
    { payer: 'Ascent Health', segment: 'Commercial', contractPeriod: '2026-2027', baseRebate: 4, adminFee: 3, dataFee: 2.5, priceProtection: 4, totalFees: 13.5, status: 'Signed', notes: 'Data fee adjusted from 3% to 2.5%' },
    { payer: 'Emisar', segment: 'Commercial', contractPeriod: '2026-2027', baseRebate: 10, adminFee: 5, dataFee: 0, priceProtection: 5, totalFees: 20, status: 'Counter Submitted', notes: 'Initial 5% countered at 50%; resubmitted at 10%' },
    { payer: 'Zinc Health', segment: 'Commercial', contractPeriod: '2026-2027', baseRebate: 4.5, adminFee: 4, dataFee: 1.5, priceProtection: 5, totalFees: 15, status: 'Submitted', notes: '' },
    { payer: 'OptumRx', segment: 'Medicare Part D', contractPeriod: '2026', baseRebate: 5, adminFee: 5, dataFee: 0, priceProtection: 5, totalFees: 15, status: 'Submitted', notes: '' },
    { payer: 'Humana', segment: 'Medicare Part D', contractPeriod: '2027', baseRebate: 15, adminFee: 0, dataFee: 0, priceProtection: 5, totalFees: 20, status: 'Submitted', notes: '' }
  ],
  rateComparison: [
    { payer: 'CVS Caremark', segment: 'Medicare Part D', baseRebate: 5, adminFee: 4, dataFee: 1.5, priceProtection: 4, totalConcessions: 14.5, status: 'Submitted' },
    { payer: 'Express Scripts', segment: 'Medicare Part D', baseRebate: 5, adminFee: 5, dataFee: 0, priceProtection: 5, totalConcessions: 15, status: 'Signed' },
    { payer: 'Express Scripts', segment: 'Government', baseRebate: 5, adminFee: 5, dataFee: 0, priceProtection: 0, totalConcessions: 10, status: 'Signed' },
    { payer: 'Ascent Health', segment: 'Commercial', baseRebate: 4, adminFee: 3, dataFee: 2.5, priceProtection: 4, totalConcessions: 13.5, status: 'Signed' },
    { payer: 'Emisar', segment: 'Commercial', baseRebate: 10, adminFee: 5, dataFee: 0, priceProtection: 5, totalConcessions: 20, status: 'Counter Submitted' },
    { payer: 'Zinc Health', segment: 'Commercial', baseRebate: 4.5, adminFee: 4, dataFee: 1.5, priceProtection: 5, totalConcessions: 15, status: 'Submitted' },
    { payer: 'OptumRx', segment: 'Medicare Part D', baseRebate: 5, adminFee: 5, dataFee: 0, priceProtection: 5, totalConcessions: 15, status: 'Submitted' },
    { payer: 'Humana', segment: 'Medicare Part D', baseRebate: 15, adminFee: 0, dataFee: 0, priceProtection: 5, totalConcessions: 20, status: 'Submitted' }
  ],
  summary: { total: 8, signed: 3, submitted: 4, countered: 1 }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('coverage');
  const [coverageData, setCoverageData] = useState(DEFAULT_COVERAGE_DATA);
  const [contractData, setContractData] = useState(DEFAULT_CONTRACT_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleCoverageFileLoad = async (buffer, name) => {
    const parsedData = parseExcelData(buffer);
    setCoverageData(parsedData);
  };

  const handleContractFileLoad = async (buffer, name) => {
    const parsedData = parseContractData(buffer);
    setContractData(parsedData);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const totalSnapshot = coverageData.coverageSnapshot?.find(s => s.segment === 'TOTAL');
  const commercialSnapshot = coverageData.coverageSnapshot?.find(s => s.segment === 'Commercial (incl. Federal)');
  const federalSnapshot = coverageData.coverageSnapshot?.find(s => s.segment.includes('Federal Programs'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header
        reportDate={activeTab === 'coverage' ? coverageData.reportDate : contractData.lastUpdated}
        onRefresh={handleRefresh}
      />

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'coverage' ? (
          <>
            {/* Coverage Dashboard */}
            <section className="mb-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Key Performance Indicators
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <MetricCard
                  title="Total Coverage"
                  value={formatPercent(totalSnapshot?.coveragePercent * 100 || 0)}
                  subtitle={`${formatFullNumber(totalSnapshot?.coveredLives || 0)} lives`}
                  icon={Activity}
                  color="blue"
                />
                <MetricCard
                  title="Commercial"
                  value={formatPercent(commercialSnapshot?.coveragePercent * 100 || 0)}
                  subtitle={`of ${formatNumber(commercialSnapshot?.totalLives || 0)} lives`}
                  icon={Building2}
                  color="green"
                />
                <MetricCard
                  title="Federal"
                  value={formatPercent(federalSnapshot?.coveragePercent * 100 || 0)}
                  subtitle={`${formatFullNumber(federalSnapshot?.coveredLives || 0)} lives`}
                  icon={Users}
                  color="purple"
                />
                <MetricCard
                  title="Plans"
                  value={coverageData.planDetails?.length || 31}
                  subtitle="Active placements"
                  icon={FileSpreadsheet}
                  color="amber"
                />
              </div>
            </section>

            <section className="mb-6">
              <MonthlyMetrics tracking={coverageData.monthlyTracking} />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <CoverageChart data={coverageData.chartData} title="Coverage Trend" />
              <SegmentBreakdown data={coverageData.coverageSnapshot} />
            </section>

            <section className="mb-6">
              <PlansTable plans={coverageData.planDetails} topPlans={coverageData.topPlans} />
            </section>

            <section className="mb-6">
              <FileUpload
                onFileLoad={handleCoverageFileLoad}
                currentFileName="Coverage Tracker"
                label="Update Coverage Data"
              />
            </section>
          </>
        ) : (
          <>
            {/* Contract Dashboard */}
            <ContractDashboard data={contractData} />

            <section className="mt-6">
              <FileUpload
                onFileLoad={handleContractFileLoad}
                currentFileName="Contract Tracker"
                label="Update Contract Data"
              />
            </section>
          </>
        )}

        <footer className="text-center py-6 border-t border-slate-200 mt-8">
          <p className="text-sm text-slate-400">
            Cardamyst Market Access Dashboard
          </p>
        </footer>
      </main>
    </div>
  );
}
