import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Sparkles, BookOpen } from 'lucide-react';

export function Layout() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/directory';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fdfdff_0%,#f5f8ff_40%,#eef2ff_100%)]">
      {/* Header */}
      <header className="bg-[#0b254b] shadow-sm sticky top-0 z-50 border-b border-[#0a1f3d]">
        <div className="w-full px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Title */}
            <Link to="/" className="hover:opacity-90 transition-all">
              <h1 className="text-2xl font-extrabold text-[#f4c430]">
                CS182 Special Participation B
              </h1>
              <p className="text-sm text-white/80 font-medium">
                Exploring LLM Coding Capabilities
              </p>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-2">
              <Link
                to="/"
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
                  isActive('/')
                    ? 'bg-[#f4c430] text-[#0b254b] shadow-sm'
                    : 'text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Directory</span>
              </Link>
              <Link
                to="/insights"
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
                  isActive('/insights')
                    ? 'bg-[#f4c430] text-[#0b254b] shadow-sm'
                    : 'text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Insights</span>
              </Link>
              <Link
                to="/lectures"
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
                  isActive('/lectures')
                    ? 'bg-[#f4c430] text-[#0b254b] shadow-sm'
                    : 'text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Playlist</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-6 sm:px-8 lg:px-12 py-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#0b254b] text-white mt-20 border-t border-[#0a1f3d]">
        <div className="w-full px-6 sm:px-8 lg:px-12 py-10">
          <div className="text-center space-y-2">
            <p className="font-semibold text-lg">
              CS182/CS282A Deep Learning - UC Berkeley
            </p>
            <p className="text-white/80">
              Data collected and analyzed from Ed Discussion Special Participation B posts
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
