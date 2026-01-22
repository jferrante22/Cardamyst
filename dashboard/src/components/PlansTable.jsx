import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Building2, Shield } from 'lucide-react';
import { formatFullNumber } from '../utils/dataProcessor';

export default function PlansTable({ plans, topPlans }) {
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'pharmacyLives', direction: 'desc' });

  const displayPlans = showAll ? plans : topPlans;

  const filteredPlans = displayPlans.filter(plan =>
    plan.planName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.segment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.planType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPlans = [...filteredPlans].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    const aStr = String(aVal || '').toLowerCase();
    const bStr = String(bVal || '').toLowerCase();
    return sortConfig.direction === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronDown className="w-4 h-4 text-slate-300" />;
    }
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="w-4 h-4 text-blue-500" />
      : <ChevronDown className="w-4 h-4 text-blue-500" />;
  };

  const getCoverageStatusBadge = (status) => {
    if (!status) return null;

    if (status.includes('T3') || status.includes('T4')) {
      return (
        <span className="badge badge-success">
          {status}
        </span>
      );
    }
    if (status.includes('NC') || status.includes('Not Covered')) {
      return (
        <span className="badge badge-warning">
          {status}
        </span>
      );
    }
    return (
      <span className="badge badge-neutral">
        {status}
      </span>
    );
  };

  const getPlanTypeIcon = (type) => {
    if (type === 'Fed Prog' || type === 'Federal') {
      return <Shield className="w-4 h-4 text-blue-500" />;
    }
    return <Building2 className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              {showAll ? 'All Plans with Coverage' : 'Top Plans Driving Coverage'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {sortedPlans.length} plans • {formatFullNumber(
                sortedPlans.reduce((sum, p) => sum + (p.pharmacyLives || p.coveredLives || 0), 0)
              )} total covered lives
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-48"
              />
            </div>

            {/* Toggle */}
            {plans.length > topPlans.length && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="btn-secondary text-sm whitespace-nowrap"
              >
                {showAll ? 'Show Top Plans' : `View All (${plans.length})`}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th
                className="cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('planName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Plan Name</span>
                  <SortIcon columnKey="planName" />
                </div>
              </th>
              <th
                className="cursor-pointer hover:bg-slate-100 hidden sm:table-cell"
                onClick={() => handleSort('planType')}
              >
                <div className="flex items-center space-x-1">
                  <span>Type</span>
                  <SortIcon columnKey="planType" />
                </div>
              </th>
              <th
                className="cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('pharmacyLives')}
              >
                <div className="flex items-center space-x-1">
                  <span>Covered Lives</span>
                  <SortIcon columnKey="pharmacyLives" />
                </div>
              </th>
              <th
                className="cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('coverageStatus')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <SortIcon columnKey="coverageStatus" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPlans.map((plan, index) => (
              <tr key={index}>
                <td>
                  <div className="flex items-center space-x-3">
                    {getPlanTypeIcon(plan.planType)}
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate max-w-[200px] sm:max-w-none">
                        {plan.planName}
                      </p>
                      {showAll && plan.payerName && plan.payerName !== plan.planName && (
                        <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-none">
                          {plan.payerName}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="hidden sm:table-cell">
                  <span className="text-slate-600">{plan.planType}</span>
                </td>
                <td>
                  <span className="font-semibold text-slate-800">
                    {formatFullNumber(plan.pharmacyLives || plan.coveredLives)}
                  </span>
                </td>
                <td>
                  {getCoverageStatusBadge(plan.coverageStatus)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedPlans.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-slate-400">No plans found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
