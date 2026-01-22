import { formatPercent, formatFullNumber } from '../utils/dataProcessor';
import { Users, Building, Heart, Activity } from 'lucide-react';

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
      subtext: federalLives ? `Incl. ${(federalLives / 1000000).toFixed(1)}M Federal` : null
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
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100'
  };

  return (
    <div className="card">
      <div className="card-header py-3 px-4">
        <h3 className="text-base font-semibold text-slate-800">Current Month Performance</h3>
        <p className="text-xs text-slate-500">
          {commercial.months?.[commercialLatest?.index || 0]} Coverage Metrics
        </p>
      </div>
      <div className="card-body p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {segments.map((segment, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${colorClasses[segment.color]}`}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <segment.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{segment.name}</span>
              </div>
              <div className="space-y-1">
                <div>
                  <p className="text-xl font-bold leading-tight">
                    {segment.coverage !== null && segment.coverage !== undefined
                      ? formatPercent(segment.coverage)
                      : '0.00%'}
                  </p>
                  <p className="text-[10px] opacity-70">Coverage Rate</p>
                </div>
                <div>
                  <p className="text-base font-semibold leading-tight">
                    {segment.lives ? formatFullNumber(segment.lives) : '0'}
                  </p>
                  <p className="text-[10px] opacity-70">Covered Lives</p>
                </div>
                {segment.subtext && (
                  <p className="text-[10px] opacity-60 pt-1">{segment.subtext}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Total Row */}
        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-200 rounded">
                <Activity className="w-4 h-4 text-slate-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Total Coverage</p>
                <p className="text-[10px] text-slate-500">All Segments Combined</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xl font-bold text-slate-900">
                  {totalLatest?.value !== null && totalLatest?.value !== undefined
                    ? formatPercent(totalLatest.value)
                    : '0.00%'}
                </p>
                <p className="text-[10px] text-slate-500">Coverage Rate</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-900">
                  {totalLives?.value ? formatFullNumber(totalLives.value) : '0'}
                </p>
                <p className="text-[10px] text-slate-500">Covered Lives</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
