import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { formatFullNumber, formatPercent } from '../utils/dataProcessor';

export default function SegmentBreakdown({ data }) {
  if (!data || data.length === 0) {
    return null;
  }

  // Filter to main segments (not sub-segments)
  const mainSegments = data.filter(d =>
    !d.segment.startsWith('└') && d.segment !== 'TOTAL'
  );

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  const pieData = mainSegments.map((segment, index) => ({
    name: segment.segment,
    value: segment.totalLives,
    covered: segment.coveredLives,
    percent: segment.coveragePercent * 100,
    color: colors[index % colors.length]
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-200 text-xs">
          <p className="font-semibold text-slate-700">{data.name}</p>
          <p className="text-slate-500">Total: {formatFullNumber(data.value)}</p>
          <p className="text-slate-500">Covered: {formatFullNumber(data.covered)}</p>
          <p className="font-medium text-blue-600">{formatPercent(data.percent)}</p>
        </div>
      );
    }
    return null;
  };

  // Shorten segment names for display
  const shortenName = (name) => {
    if (name === 'Commercial (incl. Federal)') return 'Commercial';
    if (name.startsWith('└')) return name;
    return name;
  };

  return (
    <div className="card h-full">
      <div className="card-header py-3 px-4">
        <h3 className="text-base font-semibold text-slate-800">Coverage by Segment</h3>
      </div>
      <div className="card-body p-4">
        <div className="flex flex-col lg:flex-row items-center gap-4">
          {/* Pie Chart */}
          <div className="w-full lg:w-2/5 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend & Details */}
          <div className="w-full lg:w-3/5 space-y-1.5">
            {data.map((segment, index) => {
              const isSubSegment = segment.segment.startsWith('└');
              const isTotal = segment.segment === 'TOTAL';
              const color = isTotal ? '#1e293b' : isSubSegment ? '#64748b' : colors[mainSegments.findIndex(s => s.segment === segment.segment) % colors.length];

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between py-1.5 px-2 rounded ${
                    isTotal ? 'bg-slate-100 mt-2' : isSubSegment ? 'bg-slate-50/50 ml-3' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {!isSubSegment && !isTotal && (
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                    )}
                    <div className="min-w-0">
                      <p className={`text-xs font-medium truncate ${isTotal ? 'text-slate-900' : 'text-slate-700'}`}>
                        {shortenName(segment.segment)}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {formatFullNumber(segment.totalLives)} lives
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className={`text-xs font-bold ${
                      segment.coveragePercent > 0 ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      {formatPercent(segment.coveragePercent * 100)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {formatFullNumber(segment.coveredLives)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
