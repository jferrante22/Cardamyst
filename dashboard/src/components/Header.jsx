import { RefreshCw, Download, Calendar } from 'lucide-react';

export default function Header({ reportDate, onRefresh, onExport }) {
  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <span className="text-xl sm:text-2xl font-bold text-blue-200">C</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Cardamyst</h1>
              <p className="text-xs sm:text-sm text-blue-200 hidden sm:block">Formulary Coverage Tracker</p>
            </div>
          </div>

          {/* Report Date & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {reportDate && (
              <div className="hidden sm:flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
                <Calendar className="w-4 h-4 text-blue-200" />
                <span className="text-sm font-medium">{reportDate}</span>
              </div>
            )}

            <button
              onClick={onRefresh}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <button
              onClick={onExport}
              className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Report Date */}
      {reportDate && (
        <div className="sm:hidden bg-blue-950/50 px-4 py-2 flex items-center justify-center space-x-2">
          <Calendar className="w-4 h-4 text-blue-300" />
          <span className="text-sm text-blue-200">{reportDate}</span>
        </div>
      )}
    </header>
  );
}
