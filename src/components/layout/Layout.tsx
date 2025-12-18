import { Outlet, Link, useLocation } from 'react-router-dom';
import { useBookmarksStore } from '../../store/useBookmarksStore';
import { LayoutGrid, Sparkles, Bookmark } from 'lucide-react';

export function Layout() {
  const location = useLocation();
  const savedCount = useBookmarksStore(state => state.getSavedCount());

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/directory';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="w-full px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Title */}
            <Link to="/" className="flex items-center space-x-4 hover:opacity-90 transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                <span className="text-white font-extrabold text-2xl">🤖</span>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
                  CS182 Special Participation B
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Exploring LLM Coding Capabilities
                </p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-2">
              <Link
                to="/"
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
                  isActive('/')
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Directory</span>
              </Link>
              <Link
                to="/insights"
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
                  isActive('/insights')
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Insights</span>
              </Link>

              {/* Saved Count Badge */}
              {savedCount > 0 && (
                <div className="ml-3 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-sm font-bold shadow-lg flex items-center space-x-2">
                  <Bookmark className="w-4 h-4" />
                  <span>{savedCount}</span>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-6 sm:px-8 lg:px-12 py-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 mt-20">
        <div className="w-full px-6 sm:px-8 lg:px-12 py-10">
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400 font-semibold text-lg">
              CS182/CS282A Deep Learning - UC Berkeley
            </p>
            <p className="mt-2 text-slate-500 dark:text-slate-500">
              Data collected and analyzed from Ed Discussion Special Participation B posts
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
