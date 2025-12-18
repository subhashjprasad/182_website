import { useUIStore } from '../../store/useUIStore';
import type { FilterState } from '../../lib/types';
import type { SortOption } from '../../lib/filterPosts';

interface SearchFiltersProps {
  filterOptions: {
    llms: string[];
    llmVariants: string[];
    assistants: string[];
    taskTypes: string[];
    homeworks: string[];
    tags: string[];
  };
  onSearch: (query: string) => void;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onSortChange: (sort: SortOption) => void;
}

export function SearchFilters({
  filterOptions,
  onSearch,
  onFilterChange,
  onSortChange,
}: SearchFiltersProps) {
  const { searchQuery, filters, sortBy, resetFilters } = useUIStore();

  const handleCheckboxChange = (
    field: keyof FilterState,
    value: string,
    checked: boolean
  ) => {
    const currentArray = filters[field] as string[];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(v => v !== value);

    onFilterChange({ [field]: newArray });
  };

  const activeFilterCount =
    filters.llms.length +
    filters.llmVariants.length +
    filters.assistants.length +
    filters.taskTypes.length +
    filters.homeworks.length +
    (filters.minHighlightScore > 0 ? 1 : 0) +
    (filters.minCodeQuality > 0 ? 1 : 0) +
    (filters.minSuccessRate > 0 ? 1 : 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 space-y-6">
      {/* Search */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Search
        </label>
        <input
          id="search"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search posts, authors, LLMs, tags..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Sort */}
      <div>
        <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sort By
        </label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="relevance">Relevance</option>
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="highlight-desc">Highest Quality</option>
          <option value="name-asc">Author (A-Z)</option>
          <option value="llm-asc">LLM (A-Z)</option>
        </select>
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      {/* Filters Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
              ({activeFilterCount} active)
            </span>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* LLM Filter */}
      <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-lg border border-sky-200 dark:border-sky-800/30">
        <h4 className="text-sm font-semibold text-sky-700 dark:text-sky-300 mb-3">
          LLM
        </h4>
        <div className="space-y-2">
          {filterOptions.llms.map((llm) => (
            <label key={llm} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.llms.includes(llm)}
                onChange={(e) => handleCheckboxChange('llms', llm, e.target.checked)}
                className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{llm}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Assistant/Tool Filter */}
      <div className="p-4 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800/30">
        <h4 className="text-sm font-semibold text-cyan-700 dark:text-cyan-300 mb-3">
          Assistant / Tool
        </h4>
        <div className="space-y-2">
          {filterOptions.assistants.map((tool) => (
            <label key={tool} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.assistants.includes(tool)}
                onChange={(e) => handleCheckboxChange('assistants', tool, e.target.checked)}
                className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{tool}</span>
            </label>
          ))}
          {filterOptions.assistants.length === 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">No assistant/tool tags found.</p>
          )}
        </div>
      </div>

      {/* Task Type Filter */}
      <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800/30">
        <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3">
          Task Types
        </h4>
        <div className="space-y-2">
          {filterOptions.taskTypes.map((task) => (
            <label key={task} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.taskTypes.includes(task)}
                onChange={(e) => handleCheckboxChange('taskTypes', task, e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                {task.replace(/-/g, ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Homework Filter */}
      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
        <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-3">
          Homework
        </h4>
        <div className="space-y-2">
          {filterOptions.homeworks.map((hw) => (
            <label key={hw} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.homeworks.includes(hw)}
                onChange={(e) => handleCheckboxChange('homeworks', hw, e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 uppercase">
                {hw}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Quality Filters */}
      <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-800/30">
        <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-3">
          Minimum Quality Score
        </h4>
        <select
          value={filters.minHighlightScore}
          onChange={(e) => onFilterChange({ minHighlightScore: Number(e.target.value) })}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        >
          <option value="0">All Posts</option>
          <option value="5">5+ (Good)</option>
          <option value="7">7+ (High Quality)</option>
          <option value="8">8+ (Excellent)</option>
        </select>
      </div>
    </div>
  );
}
