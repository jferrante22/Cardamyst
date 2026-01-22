import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  icon: Icon,
  color = 'blue',
  className = ''
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    purple: 'from-purple-500 to-purple-600',
    slate: 'from-slate-500 to-slate-600'
  };

  const iconBgClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
    slate: 'bg-slate-100 text-slate-600'
  };

  const getTrendIcon = () => {
    if (change === null || change === undefined) return null;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className={`metric-card ${color} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 truncate">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500 truncate">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div className={`flex-shrink-0 p-3 rounded-xl ${iconBgClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(change !== null && change !== undefined) && (
        <div className="mt-4 flex items-center space-x-2">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${
            change > 0 ? 'text-emerald-600' : change < 0 ? 'text-red-600' : 'text-slate-500'
          }`}>
            {change > 0 ? '+' : ''}{change.toFixed(2)}%
          </span>
          {changeLabel && (
            <span className="text-sm text-slate-400">{changeLabel}</span>
          )}
        </div>
      )}

      {/* Decorative gradient bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses[color]} opacity-80`} />
    </div>
  );
}
