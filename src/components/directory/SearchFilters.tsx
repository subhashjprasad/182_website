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
    <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-100 space-y-6">
      {/* Search */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-[#4a6cf7] mb-2">
          Search
        </label>
        <input
          id="search"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search posts, authors, LLMs, tags..."
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4a6cf7]/30 focus:border-transparent bg-white text-[#1f2937]"
        />
      </div>

      {/* Sort */}
      <div>
        <label htmlFor="sort" className="block text-sm font-medium text-[#4a6cf7] mb-2">
          Sort By
        </label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4a6cf7]/30 focus:border-transparent bg-white text-[#1f2937]"
        >
          <option value="relevance">Relevance</option>
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="highlight-desc">Highest Quality</option>
          <option value="name-asc">Author (A-Z)</option>
          <option value="llm-asc">LLM (A-Z)</option>
        </select>
      </div>

      <hr className="border-slate-200" />

      {/* Filters Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 text-xs text-slate-500">
              ({activeFilterCount} active)
            </span>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs text-slate-500 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* LLM Filter */}
      <div className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-800 mb-3">
          LLM
        </h4>
        <div className="space-y-2">
          {filterOptions.llms.map((llm) => (
            <label key={llm} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.llms.includes(llm)}
                onChange={(e) => handleCheckboxChange('llms', llm, e.target.checked)}
                className="rounded border-slate-300 text-slate-700 focus:ring-slate-400"
              />
              <span className="text-sm text-slate-800">{llm}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Assistant/Tool Filter */}
      <div className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-800 mb-3">
          Assistant / Tool
        </h4>
        <div className="space-y-2">
          {filterOptions.assistants.map((tool) => (
            <label key={tool} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.assistants.includes(tool)}
                onChange={(e) => handleCheckboxChange('assistants', tool, e.target.checked)}
                className="rounded border-slate-300 text-slate-700 focus:ring-slate-400"
              />
              <span className="text-sm text-slate-800">{tool}</span>
            </label>
          ))}
          {filterOptions.assistants.length === 0 && (
            <p className="text-xs text-slate-500">No assistant/tool tags found.</p>
          )}
        </div>
      </div>

      {/* Task Type Filter */}
      <div className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-800 mb-3">
          Task Types
        </h4>
        <div className="space-y-2">
          {filterOptions.taskTypes.map((task) => (
            <label key={task} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.taskTypes.includes(task)}
                onChange={(e) => handleCheckboxChange('taskTypes', task, e.target.checked)}
                className="rounded border-slate-300 text-slate-700 focus:ring-[#4a6cf7]/30"
              />
              <span className="text-sm text-slate-800 capitalize">
                {task.replace(/-/g, ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Homework Filter */}
      <div className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-800 mb-3">
          Homework
        </h4>
        <div className="space-y-2">
          {filterOptions.homeworks.map((hw) => (
            <label key={hw} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.homeworks.includes(hw)}
                onChange={(e) => handleCheckboxChange('homeworks', hw, e.target.checked)}
                className="rounded border-slate-300 text-slate-700 focus:ring-[#4a6cf7]/30"
              />
              <span className="text-sm text-slate-800 uppercase">
                {hw}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Quality Filters */}
      <div className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-800 mb-3">
          Minimum Quality Score
        </h4>
        <select
          value={filters.minHighlightScore}
          onChange={(e) => onFilterChange({ minHighlightScore: Number(e.target.value) })}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-[#4a6cf7]/30 focus:border-transparent"
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
