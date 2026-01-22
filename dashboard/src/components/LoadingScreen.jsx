export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900">
      <div className="text-center">
        {/* Logo */}
        <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 mx-auto mb-6 animate-pulse">
          <span className="text-4xl font-bold text-blue-200">C</span>
        </div>

        {/* Loading spinner */}
        <div className="w-12 h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />

        <h1 className="text-xl font-semibold text-white mb-2">Cardamyst</h1>
        <p className="text-blue-200 text-sm">Loading dashboard...</p>
      </div>
    </div>
  );
}
