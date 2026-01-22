import { FileCheck, Clock, Send, MessageSquare, AlertCircle } from 'lucide-react';

export default function ContractDashboard({ data }) {
  if (!data) return null;

  const { contracts, summary, lastUpdated } = data;

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'signed') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (s === 'submitted') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (s.includes('counter')) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const getStatusIcon = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'signed') return FileCheck;
    if (s === 'submitted') return Send;
    if (s.includes('counter')) return MessageSquare;
    return Clock;
  };

  const formatPercent = (val) => {
    if (val === null || val === undefined) return '—';
    return val.toFixed(1) + '%';
  };

  // Group contracts by segment
  const bySegment = contracts.reduce((acc, c) => {
    const seg = c.segment || 'Other';
    if (!acc[seg]) acc[seg] = [];
    acc[seg].push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Contract Summary
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="metric-card blue">
            <p className="text-xs font-medium text-slate-500">Total Contracts</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{summary.total}</p>
            <p className="text-[11px] text-slate-400">Active negotiations</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 opacity-80" />
          </div>
          <div className="metric-card green">
            <p className="text-xs font-medium text-slate-500">Signed</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{summary.signed}</p>
            <p className="text-[11px] text-slate-400">Completed deals</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 opacity-80" />
          </div>
          <div className="metric-card blue">
            <p className="text-xs font-medium text-slate-500">Submitted</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">{summary.submitted}</p>
            <p className="text-[11px] text-slate-400">Awaiting response</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-500 opacity-80" />
          </div>
          <div className="metric-card amber">
            <p className="text-xs font-medium text-slate-500">In Negotiation</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{summary.countered}</p>
            <p className="text-[11px] text-slate-400">Counter submitted</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600 opacity-80" />
          </div>
        </div>
      </section>

      {/* Contract Details by Segment */}
      {Object.entries(bySegment).map(([segment, segmentContracts]) => (
        <section key={segment} className="card">
          <div className="card-header py-3 px-4">
            <h3 className="text-base font-semibold text-slate-800">{segment}</h3>
            <p className="text-xs text-slate-500">{segmentContracts.length} contract{segmentContracts.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="!py-2 !text-[10px]">Payer</th>
                  <th className="!py-2 !text-[10px]">Period</th>
                  <th className="!py-2 !text-[10px] text-right">Base</th>
                  <th className="!py-2 !text-[10px] text-right">Admin</th>
                  <th className="!py-2 !text-[10px] text-right">Total</th>
                  <th className="!py-2 !text-[10px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {segmentContracts.map((contract, idx) => {
                  const StatusIcon = getStatusIcon(contract.status);
                  return (
                    <tr key={idx}>
                      <td className="!py-2">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{contract.payer}</p>
                          {contract.notes && (
                            <p className="text-[10px] text-slate-400 truncate max-w-[200px]" title={contract.notes}>
                              {contract.notes}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="!py-2 text-xs text-slate-600">{contract.contractPeriod}</td>
                      <td className="!py-2 text-xs text-right font-medium">{formatPercent(contract.baseRebate)}</td>
                      <td className="!py-2 text-xs text-right">{formatPercent(contract.adminFee)}</td>
                      <td className="!py-2 text-xs text-right font-semibold text-slate-800">
                        {formatPercent(contract.totalFees)}
                      </td>
                      <td className="!py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(contract.status)}`}>
                          <StatusIcon className="w-3 h-3" />
                          {contract.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {/* Rate Comparison Summary */}
      {data.rateComparison && data.rateComparison.length > 0 && (
        <section className="card">
          <div className="card-header py-3 px-4">
            <h3 className="text-base font-semibold text-slate-800">Rate Comparison</h3>
            <p className="text-xs text-slate-500">Total concessions by payer</p>
          </div>
          <div className="card-body p-4">
            <div className="space-y-2">
              {data.rateComparison.map((rate, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{rate.payer}</p>
                      <p className="text-[10px] text-slate-400">{rate.segment}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">{formatPercent(rate.totalConcessions)}</p>
                      <p className="text-[10px] text-slate-400">Total</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(rate.status)}`}>
                      {rate.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <p className="text-center text-xs text-slate-400">
          Last updated: {lastUpdated}
        </p>
      )}
    </div>
  );
}
