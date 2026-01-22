import { Activity, FileText } from 'lucide-react';

export default function TabNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'coverage', label: 'Coverage Tracker', icon: Activity },
    { id: 'contracts', label: 'Contract Status', icon: FileText },
  ];

  return (
    <div className="flex border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
              isActive
                ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.id === 'coverage' ? 'Coverage' : 'Contracts'}</span>
          </button>
        );
      })}
    </div>
  );
}
