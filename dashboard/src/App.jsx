import { useState, useEffect } from 'react';
import { Users, TrendingUp, Building2, FileSpreadsheet, Activity } from 'lucide-react';
import Header from './components/Header';
import MetricCard from './components/MetricCard';
import CoverageChart from './components/CoverageChart';
import SegmentBreakdown from './components/SegmentBreakdown';
import PlansTable from './components/PlansTable';
import FileUpload from './components/FileUpload';
import MonthlyMetrics from './components/MonthlyMetrics';
import LoadingScreen from './components/LoadingScreen';
import { parseExcelData, formatNumber, formatPercent, formatFullNumber } from './utils/dataProcessor';

// Default data extracted from the Excel file - allows immediate display
const DEFAULT_DATA = {
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
    { planName: 'Apple', planType: 'Employer', coveredLives: 106071, coverageStatus: '(T3) Non-Preferred' },
    { planName: 'State of Ohio', planType: 'Employer', coveredLives: 105276, coverageStatus: '(T3) Non-Preferred' },
    { planName: 'State of Michigan', planType: 'Employer', coveredLives: 91117, coverageStatus: '(T3) Non-Preferred' },
    { planName: 'Weis Markets', planType: 'Employer', coveredLives: 41806, coverageStatus: '(T3) Non-Preferred' },
    { planName: 'Smithfield Foods', planType: 'Employer', coveredLives: 21372, coverageStatus: '(T3) Non-Preferred' },
    { planName: 'Milwaukee Public Schools', planType: 'Employer', coveredLives: 20367, coverageStatus: '(T3) Non-Preferred' }
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
    { segment: 'Commercial', planName: 'Milwaukee Public Schools', planType: 'Employer', payerName: 'Milwaukee Public Schools', pharmacyLives: 20367, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: "Men's Wearhouse", planType: 'Employer', payerName: "Men's Wearhouse", pharmacyLives: 17009, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'Portland Adventist Medical Center', planType: 'Employer', payerName: 'Portland Adventist Medical Center', pharmacyLives: 16004, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'ILWU-PMA', planType: 'Employer', payerName: 'International Longshore & Warehouse Union', pharmacyLives: 13977, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'Lear', planType: 'Employer', payerName: 'Lear', pharmacyLives: 13631, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'North Mississippi Health Services', planType: 'Employer', payerName: 'North Mississippi Health Services', pharmacyLives: 13074, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'Haier US Appliance Solutions', planType: 'Employer', payerName: 'Haier US Appliance Solutions', pharmacyLives: 12616, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'Navient Corporation', planType: 'Employer', payerName: 'Navient Corporation', pharmacyLives: 12593, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'Syracuse University', planType: 'Employer', payerName: 'Syracuse University', pharmacyLives: 12076, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'Community Health Network ProHealth', planType: 'Employer', payerName: 'Community Health Network ProHealth', pharmacyLives: 9149, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'Oakland County Employees', planType: 'Employer', payerName: 'Oakland County', pharmacyLives: 6216, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: "St. Luke's University Health Network", planType: 'Employer', payerName: "St. Luke's University Health Network", pharmacyLives: 6121, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'Northern Arizona University', planType: 'Employer', payerName: 'Northern Arizona University', pharmacyLives: 5602, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'BiMart', planType: 'Employer', payerName: 'BiMart', pharmacyLives: 5502, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'Rochester Institute Of Technology', planType: 'Employer', payerName: 'Rochester Institute Of Technology', pharmacyLives: 4737, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'City of Toledo', planType: 'Employer', payerName: 'City of Toledo', pharmacyLives: 4488, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'Southeast Georgia Health System', planType: 'Employer', payerName: 'Southeast Georgia Health System', pharmacyLives: 2889, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'St. Elizabeth', planType: 'Employer', payerName: 'St. Elizabeth', pharmacyLives: 2600, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'City of Denton', planType: 'Employer', payerName: 'City of Denton', pharmacyLives: 1452, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'Wellmark Blue Rx Preferred', planType: 'Commercial', payerName: 'Wellmark', pharmacyLives: 1166, coverageStatus: '(T4) Non-Preferred (QL)' },
    { segment: 'Commercial', planName: 'Nacogdoches Medical Center', planType: 'Employer', payerName: 'Nacogdoches Medical Center', pharmacyLives: 575, coverageStatus: '(T3) Non-Preferred' },
    { segment: 'Commercial', planName: 'OptumRx Select', planType: 'PBM', payerName: 'OptumRx', pharmacyLives: 0, coverageStatus: '(T3) Non-Preferred' }
  ],
  monthlyTracking: {
    commercial: {
      months: ['Jan-26', 'Feb-26', 'Mar-26', 'Apr-26', 'May-26', 'Jun-26', 'Jul-26', 'Aug-26', 'Sep-26', 'Oct-26', 'Nov-26', 'Dec-26', 'Jan-27', 'Feb-27', 'Mar-27'],
      forecast: [0, 0, 0, 6, 11, 29, 44, 52, 58, 58, 58, 58, 71, 83, 84],
      actual: [3.6545, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      variance: [3.6545, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      coveredLives: [6816075.350185, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      federalLives: [5749433, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
    },
    medicare: {
      months: ['Jan-26', 'Feb-26', 'Mar-26', 'Apr-26', 'May-26', 'Jun-26', 'Jul-26', 'Aug-26', 'Sep-26', 'Oct-26', 'Nov-26', 'Dec-26', 'Jan-27', 'Feb-27', 'Mar-27'],
      actual: [0, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      coveredLives: [0, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
    },
    medicaid: {
      months: ['Jan-26', 'Feb-26', 'Mar-26', 'Apr-26', 'May-26', 'Jun-26', 'Jul-26', 'Aug-26', 'Sep-26', 'Oct-26', 'Nov-26', 'Dec-26', 'Jan-27', 'Feb-27', 'Mar-27'],
      actual: [0, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      coveredLives: [0, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
    },
    total: {
      months: ['Jan-26', 'Feb-26', 'Mar-26', 'Apr-26', 'May-26', 'Jun-26', 'Jul-26', 'Aug-26', 'Sep-26', 'Oct-26', 'Nov-26', 'Dec-26', 'Jan-27', 'Feb-27', 'Mar-27'],
      actual: [2.1523, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      coveredLives: [6816075.350185, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
    }
  },
  chartData: [
    { month: 'Jan-26', commForecast: 0, commActual: 3.6545, medicare: 0, medicaid: 0, total: 2.1523 },
    { month: 'Feb-26', commForecast: 0, commActual: null, medicare: null, medicaid: null, total: null },
    { month: 'Mar-26', commForecast: 0, commActual: null, medicare: null, medicaid: null, total: null },
    { month: 'Apr-26', commForecast: 6, commActual: null, medicare: null, medicaid: null, total: null },
    { month: 'May-26', commForecast: 11, commActual: null, medicare: null, medicaid: null, total: null },
    { month: 'Jun-26', commForecast: 29, commActual: null, medicare: null, medicaid: null, total: null },
    { month: 'Jul-26', commForecast: 44, commActual: null, medicare: null, medicaid: null, total: null },
    { month: 'Aug-26', commForecast: 52, commActual: null, medicare: null, medicaid: null, total: null },
    { month: 'Sep-26', commForecast: 58, commActual: null, medicare: null, medicaid: null, total: null },
    { month: 'Oct-26', commForecast: 58, commActual: null, medicare: null, medicaid: null, total: null },
    { month: 'Nov-26', commForecast: 58, commActual: null, medicare: null, medicaid: null, total: null },
    { month: 'Dec-26', commForecast: 58, commActual: null, medicare: null, medicaid: null, total: null },
    { month: 'Jan-27', commForecast: 71, commActual: null, medicare: null, medicaid: null, total: null },
    { month: 'Feb-27', commForecast: 83, commActual: null, medicare: null, medicaid: null, total: null },
    { month: 'Mar-27', commForecast: 84, commActual: null, medicare: null, medicaid: null, total: null }
  ]
};

export default function App() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [fileName, setFileName] = useState('Cardamyst_Coverage_Tracker Jan 2026.xlsx');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleFileLoad = async (buffer, name) => {
    const parsedData = parseExcelData(buffer);
    setData(parsedData);
    setFileName(name);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleExport = () => {
    // Create a simple JSON export
    const exportData = JSON.stringify(data, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cardamyst-dashboard-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Calculate key metrics
  const totalSnapshot = data.coverageSnapshot?.find(s => s.segment === 'TOTAL');
  const commercialSnapshot = data.coverageSnapshot?.find(s => s.segment === 'Commercial (incl. Federal)');
  const federalSnapshot = data.coverageSnapshot?.find(s => s.segment.includes('Federal Programs'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header
        reportDate={data.reportDate}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Key Metrics Grid */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Key Performance Indicators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <MetricCard
              title="Total Coverage"
              value={formatPercent(totalSnapshot?.coveragePercent * 100 || 0)}
              subtitle={`${formatFullNumber(totalSnapshot?.coveredLives || 0)} lives covered`}
              icon={Activity}
              color="blue"
              className="animate-fadeIn stagger-1"
            />
            <MetricCard
              title="Commercial Coverage"
              value={formatPercent(commercialSnapshot?.coveragePercent * 100 || 0)}
              subtitle={`of ${formatNumber(commercialSnapshot?.totalLives || 0)} total lives`}
              icon={Building2}
              color="green"
              className="animate-fadeIn stagger-2"
            />
            <MetricCard
              title="Federal Programs"
              value={formatPercent(federalSnapshot?.coveragePercent * 100 || 0)}
              subtitle={`${formatFullNumber(federalSnapshot?.coveredLives || 0)} lives (TRICARE, VA)`}
              icon={Users}
              color="purple"
              className="animate-fadeIn stagger-3"
            />
            <MetricCard
              title="Plans with Coverage"
              value={data.planDetails?.length || 31}
              subtitle="Active formulary placements"
              icon={FileSpreadsheet}
              color="amber"
              className="animate-fadeIn stagger-4"
            />
          </div>
        </section>

        {/* Monthly Metrics */}
        <section className="mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <MonthlyMetrics tracking={data.monthlyTracking} />
        </section>

        {/* Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="animate-fadeIn" style={{ animationDelay: '0.25s' }}>
            <CoverageChart
              data={data.chartData}
              title="Commercial Coverage Trend"
            />
          </div>
          <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <SegmentBreakdown data={data.coverageSnapshot} />
          </div>
        </section>

        {/* Plans Table */}
        <section className="mb-8 animate-fadeIn" style={{ animationDelay: '0.35s' }}>
          <PlansTable plans={data.planDetails} topPlans={data.topPlans} />
        </section>

        {/* File Upload Section */}
        <section className="mb-8 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <FileUpload onFileLoad={handleFileLoad} currentFileName={fileName} />
        </section>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-slate-200 mt-8">
          <p className="text-sm text-slate-400">
            Cardamyst Formulary Coverage Tracker • Market Access Dashboard
          </p>
          <p className="text-xs text-slate-300 mt-1">
            Data as of {data.reportDate || 'Current Period'}
          </p>
        </footer>
      </main>
    </div>
  );
}
