import { useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePostsData } from '../hooks/usePostsData';
import { useSearchPosts, useFilterOptions } from '../hooks/useSearchPosts';
import { filterPosts, sortPosts } from '../lib/filterPosts';
import { useUIStore } from '../store/useUIStore';
import { SearchFilters } from '../components/directory/SearchFilters';
import { PostCard } from '../components/directory/PostCard';

export function DirectoryPage() {
  const { data: posts, isLoading, error } = usePostsData();
  const [searchParams] = useSearchParams();
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    sortBy,
    setSortBy,
  } = useUIStore();

  // Handle URL params for filtering (e.g., from lectures page)
  useEffect(() => {
    const homeworkParam = searchParams.get('homework');
    if (homeworkParam) {
      // Normalize homework to uppercase format (hw0 -> HW0)
      const normalizedHW = homeworkParam.toUpperCase();

      // Reset filters and set only the homework filter from URL
      setFilters({
        llms: [],
        llmVariants: [],
        assistants: [],
        taskTypes: [],
        homeworks: [normalizedHW],
        minHighlightScore: 0,
        minCodeQuality: 0,
        minSuccessRate: 0,
      });
    }
  }, [searchParams, setFilters]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-sky-600 border-r-sky-600"></div>
          <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200 dark:border-red-800">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-500 mb-2">
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
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {searchQuery ? 'Search Results' : filters.homeworks.length > 0 ? `${filters.homeworks.map(hw => hw.toUpperCase()).join(', ')} Submissions` : 'All Submissions'}
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
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
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
              className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold transition-all"
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
    </div>
  );
}
