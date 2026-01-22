import { FileCheck, Clock, Send, MessageSquare } from 'lucide-react';

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
                  <th className="!py-2 !text-[10px] text-right">Data</th>
                  <th className="!py-2 !text-[10px] text-right">Price Prot.</th>
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
                          <p className="text-xs font-medium text-slate-800">{contract.payer}</p>
                          {contract.notes && (
                            <p className="text-[10px] text-slate-400 truncate max-w-[150px]" title={contract.notes}>
                              {contract.notes}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="!py-2 text-[11px] text-slate-600 whitespace-nowrap">{contract.contractPeriod}</td>
                      <td className="!py-2 text-[11px] text-right">{formatPercent(contract.baseRebate)}</td>
                      <td className="!py-2 text-[11px] text-right">{formatPercent(contract.adminFee)}</td>
                      <td className="!py-2 text-[11px] text-right">{formatPercent(contract.dataFee)}</td>
                      <td className="!py-2 text-[11px] text-right">{formatPercent(contract.priceProtection)}</td>
                      <td className="!py-2 text-[11px] text-right font-semibold text-slate-800">
                        {formatPercent(contract.totalFees)}
                      </td>
                      <td className="!py-2">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${getStatusColor(contract.status)}`}>
                          <StatusIcon className="w-2.5 h-2.5" />
                          <span className="hidden sm:inline">{contract.status}</span>
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
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="!py-2 !text-[10px]">Payer</th>
                  <th className="!py-2 !text-[10px]">Segment</th>
                  <th className="!py-2 !text-[10px] text-right">Base</th>
                  <th className="!py-2 !text-[10px] text-right">Admin</th>
                  <th className="!py-2 !text-[10px] text-right">Data</th>
                  <th className="!py-2 !text-[10px] text-right">Price Prot.</th>
                  <th className="!py-2 !text-[10px] text-right">Total</th>
                  <th className="!py-2 !text-[10px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.rateComparison.map((rate, idx) => (
                  <tr key={idx}>
                    <td className="!py-2 text-xs font-medium text-slate-800">{rate.payer}</td>
                    <td className="!py-2 text-[11px] text-slate-600">{rate.segment}</td>
                    <td className="!py-2 text-[11px] text-right">{formatPercent(rate.baseRebate)}</td>
                    <td className="!py-2 text-[11px] text-right">{formatPercent(rate.adminFee)}</td>
                    <td className="!py-2 text-[11px] text-right">{formatPercent(rate.dataFee)}</td>
                    <td className="!py-2 text-[11px] text-right">{formatPercent(rate.priceProtection)}</td>
                    <td className="!py-2 text-[11px] text-right font-semibold text-slate-800">
                      {formatPercent(rate.totalConcessions)}
                    </td>
                    <td className="!py-2">
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${getStatusColor(rate.status)}`}>
                        {rate.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <p className="text-center text-xs text-slate-400 mt-4">
          Last updated: {lastUpdated}
        </p>
      )}
    </div>
  );
}
