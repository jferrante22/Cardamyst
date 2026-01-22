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
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-700">{data.name}</p>
          <p className="text-sm text-slate-500">
            Total: {formatFullNumber(data.value)} lives
          </p>
          <p className="text-sm text-slate-500">
            Covered: {formatFullNumber(data.covered)} lives
          </p>
          <p className="text-sm font-medium text-blue-600">
            Coverage: {formatPercent(data.percent)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-slate-800">Coverage by Segment</h3>
      </div>
      <div className="card-body">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Pie Chart */}
          <div className="w-full lg:w-1/2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
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
          <div className="w-full lg:w-1/2 space-y-3 mt-4 lg:mt-0">
            {data.map((segment, index) => {
              const isSubSegment = segment.segment.startsWith('└');
              const isTotal = segment.segment === 'TOTAL';
              const color = isTotal ? '#1e293b' : isSubSegment ? '#64748b' : colors[mainSegments.findIndex(s => s.segment === segment.segment) % colors.length];

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isTotal ? 'bg-slate-100 border border-slate-200' : isSubSegment ? 'bg-slate-50 ml-4' : 'bg-white border border-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {!isSubSegment && !isTotal && (
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${isTotal ? 'text-slate-900' : 'text-slate-700'}`}>
                        {segment.segment}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatFullNumber(segment.totalLives)} total lives
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      segment.coveragePercent > 0 ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      {formatPercent(segment.coveragePercent * 100)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatFullNumber(segment.coveredLives)} covered
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
