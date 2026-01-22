import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';

export default function CoverageChart({ data, title }) {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        </div>
        <div className="card-body flex items-center justify-center h-64">
          <p className="text-slate-400">No chart data available</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-700 mb-2">{label}</p>
          {payload.map((entry, index) => (
            entry.value !== null && (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-600">{entry.name}:</span>
                <span className="font-medium text-slate-800">
                  {entry.value !== null ? entry.value.toFixed(1) + '%' : '—'}
                </span>
              </div>
            )
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <div className="flex items-center space-x-4 text-xs">
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-500">Forecast</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-500">Actual</span>
          </span>
        </div>
      </div>
      <div className="card-body">
        <div className="h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={(value) => value.toFixed(1) + '%'}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="commForecast"
                name="Forecast"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorForecast)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="commActual"
                name="Actual"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorActual)"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
