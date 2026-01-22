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
    if (change > 0) return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
    if (change < 0) return <TrendingDown className="w-3.5 h-3.5 text-red-500" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className={`metric-card ${color} ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 truncate">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 truncate">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-[11px] text-slate-400 truncate">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div className={`flex-shrink-0 p-2 rounded-lg ${iconBgClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(change !== null && change !== undefined) && (
        <div className="mt-3 flex items-center gap-1.5">
          {getTrendIcon()}
          <span className={`text-xs font-medium ${
            change > 0 ? 'text-emerald-600' : change < 0 ? 'text-red-600' : 'text-slate-500'
          }`}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
          {changeLabel && (
            <span className="text-xs text-slate-400">{changeLabel}</span>
          )}
        </div>
      )}

      {/* Decorative gradient bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses[color]} opacity-80`} />
    </div>
  );
}
