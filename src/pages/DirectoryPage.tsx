import { useMemo, useEffect } from 'react';
import { usePostsData } from '../hooks/usePostsData';
import { useSearchPosts, useFilterOptions } from '../hooks/useSearchPosts';
import { filterPosts, sortPosts } from '../lib/filterPosts';
import { useUIStore } from '../store/useUIStore';
import { SearchFilters } from '../components/directory/SearchFilters';
import { PostCard } from '../components/directory/PostCard';
import { QuickView } from '../components/post/QuickView';

export function DirectoryPage() {
  const { data: posts, isLoading, error } = usePostsData();
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    openQuickView,
    quickViewPostId,
    closeQuickView,
  } = useUIStore();

  // Get filter options from all posts
  const filterOptions = useFilterOptions(posts || []);

  // Apply search
  const searchedPosts = useSearchPosts(posts || [], searchQuery);

  // Apply filters
  const filteredPosts = useMemo(
    () => filterPosts(searchedPosts, filters),
    [searchedPosts, filters]
  );

  // Apply sorting
  const sortedPosts = useMemo(
    () => sortPosts(filteredPosts, sortBy, !!searchQuery),
    [filteredPosts, sortBy, searchQuery]
  );

  // Quick View state and navigation
  const currentPostIndex = sortedPosts.findIndex(p => p.post_id === quickViewPostId);
  const currentPost = currentPostIndex >= 0 ? sortedPosts[currentPostIndex] : null;

  const handleNext = () => {
    if (currentPostIndex < sortedPosts.length - 1) {
      openQuickView(sortedPosts[currentPostIndex + 1].post_id);
    }
  };

  const handlePrevious = () => {
    if (currentPostIndex > 0) {
      openQuickView(sortedPosts[currentPostIndex - 1].post_id);
    }
  };

  // Keyboard navigation for arrow keys when Quick View is open
  useEffect(() => {
    if (!quickViewPostId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickViewPostId, currentPostIndex, sortedPosts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-sky-600 border-r-blue-600"></div>
          <p className="mt-6 text-lg font-semibold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200 dark:border-red-800">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Error Loading Posts
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Failed to fetch posts. Please make sure the data pipeline has completed.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 font-mono bg-gray-100 dark:bg-gray-900 p-3 rounded-lg">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar - Search & Filters */}
      <aside className="lg:col-span-1">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
          <SearchFilters
            filterOptions={filterOptions}
            onSearch={setSearchQuery}
            onFilterChange={setFilters}
            onSortChange={setSortBy}
          />
        </div>
      </aside>

      {/* Main Content - Post Grid */}
      <main className="lg:col-span-3">
        {/* Results Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
            {searchQuery ? 'Search Results' : 'All Submissions'}
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400 font-medium">
            <span className="text-sky-600 dark:text-sky-400 font-bold">{sortedPosts.length}</span> {sortedPosts.length === 1 ? 'submission' : 'submissions'}
            {searchQuery && ` matching "${searchQuery}"`}
            {(filters.llms.length > 0 ||
              filters.taskTypes.length > 0 ||
              filters.homeworks.length > 0 ||
              filters.minHighlightScore > 0) &&
              ' with active filters'}
          </p>
        </div>

        {/* Empty State */}
        {sortedPosts.length === 0 && (
          <div className="text-center py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-700 shadow-lg">
            <div className="text-7xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent mb-3">
              No posts found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({
                  llms: [],
                  llmVariants: [],
                  taskTypes: [],
                  homeworks: [],
                  minHighlightScore: 0,
                  minCodeQuality: 0,
                  minSuccessRate: 0,
                });
              }}
              className="px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-500/30 hover:shadow-xl hover:scale-105"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Post Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {sortedPosts.map((post) => (
            <PostCard
              key={post.post_id}
              post={post}
              onQuickView={() => openQuickView(post.post_id)}
            />
          ))}
        </div>

        {/* Load More / Pagination (could add later) */}
        {sortedPosts.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Showing all {sortedPosts.length} results
          </div>
        )}
      </main>

      {/* Quick View Panel */}
      <QuickView
        post={currentPost}
        onClose={closeQuickView}
        onNext={handleNext}
        onPrevious={handlePrevious}
        hasNext={currentPostIndex >= 0 && currentPostIndex < sortedPosts.length - 1}
        hasPrevious={currentPostIndex > 0}
      />
    </div>
  );
}
