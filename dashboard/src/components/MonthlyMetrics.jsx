import { formatPercent, formatFullNumber } from '../utils/dataProcessor';
import { TrendingUp, Users, Building, Heart, Activity } from 'lucide-react';

export default function MonthlyMetrics({ tracking }) {
  if (!tracking) return null;

  const { commercial, medicare, medicaid, total } = tracking;

  // Get the most recent actual data
  const getLatestActual = (data) => {
    if (!data.actual) return null;
    for (let i = data.actual.length - 1; i >= 0; i--) {
      if (data.actual[i] !== null) return { value: data.actual[i], index: i };
    }
    return null;
  };

  const getLatestCovered = (data) => {
    if (!data.coveredLives) return null;
    for (let i = data.coveredLives.length - 1; i >= 0; i--) {
      if (data.coveredLives[i] !== null) return { value: data.coveredLives[i], index: i };
    }
    return null;
  };

  const commercialLatest = getLatestActual(commercial);
  const commercialLives = getLatestCovered(commercial);
  const federalLives = commercial.federalLives?.[commercialLatest?.index];

  const segments = [
    {
      name: 'Commercial',
      icon: Building,
      color: 'blue',
      coverage: commercialLatest?.value,
      lives: commercialLives?.value,
      subtext: federalLives ? `Including ${formatFullNumber(federalLives)} Federal lives` : null
    },
    {
      name: 'Medicare',
      icon: Heart,
      color: 'purple',
      coverage: getLatestActual(medicare)?.value,
      lives: getLatestCovered(medicare)?.value
    },
    {
      name: 'Medicaid',
      icon: Users,
      color: 'amber',
      coverage: getLatestActual(medicaid)?.value,
      lives: getLatestCovered(medicaid)?.value
    }
  ];

  const totalLatest = getLatestActual(total);
  const totalLives = getLatestCovered(total);

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200'
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-slate-800">Current Month Performance</h3>
        <p className="text-sm text-slate-500 mt-1">
          {commercial.months?.[commercialLatest?.index || 0]} Coverage Metrics
        </p>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {segments.map((segment, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border ${colorClasses[segment.color]}`}
            >
              <div className="flex items-center space-x-2 mb-3">
                <segment.icon className="w-5 h-5" />
                <span className="font-medium">{segment.name}</span>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-2xl font-bold">
                    {segment.coverage !== null && segment.coverage !== undefined
                      ? formatPercent(segment.coverage)
                      : '0.00%'}
                  </p>
                  <p className="text-xs opacity-70">Coverage Rate</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    {segment.lives ? formatFullNumber(segment.lives) : '0'}
                  </p>
                  <p className="text-xs opacity-70">Covered Lives</p>
                </div>
                {segment.subtext && (
                  <p className="text-xs opacity-70 mt-2">{segment.subtext}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Total Row */}
        <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-200 rounded-lg">
                <Activity className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Total Coverage (All Segments)</p>
                <p className="text-sm text-slate-500">Combined market penetration</p>
              </div>
            </div>
            <div className="mt-3 sm:mt-0 flex items-center space-x-6">
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">
                  {totalLatest?.value !== null && totalLatest?.value !== undefined
                    ? formatPercent(totalLatest.value)
                    : '0.00%'}
                </p>
                <p className="text-xs text-slate-500">Coverage Rate</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">
                  {totalLives?.value ? formatFullNumber(totalLives.value) : '0'}
                </p>
                <p className="text-xs text-slate-500">Covered Lives</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
