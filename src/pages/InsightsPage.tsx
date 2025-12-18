import { useLLMProfiles, useInsightsData } from '../hooks/usePostsData';

export function InsightsPage() {
  const { data: llmProfiles, isLoading: loadingProfiles, error: profilesError } = useLLMProfiles();
  const { data: insights, isLoading: loadingInsights, error: insightsError } = useInsightsData();

  const isLoading = loadingProfiles || loadingInsights;
  const error = profilesError || insightsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading Insights
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Failed to fetch insights data. Please make sure the data pipeline has completed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          LLM Insights & Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comparative analysis of LLM performance on coding tasks
        </p>
      </div>

      {/* LLM Comparison Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            LLM Comparison
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  LLM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Submissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Avg Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Top Strength
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Top Weakness
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {llmProfiles?.filter(profile => profile.llm_name !== 'Unknown').map((profile) => (
                <tr key={profile.llm_name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {profile.llm_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {profile.submission_count}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {profile.average_success_rate != null ? `${profile.average_success_rate.toFixed(1)}%` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                      {profile.task_strengths[0] || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                      {profile.task_weaknesses[0] || 'N/A'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LLM Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {llmProfiles?.filter(profile => profile.llm_name !== 'Unknown').map((profile) => (
          <div
            key={profile.llm_name}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {profile.llm_name}
            </h3>
            <div className="flex items-baseline space-x-2 mb-4">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {profile.average_success_rate != null ? `${profile.average_success_rate.toFixed(1)}%` : 'N/A'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                avg success rate
              </div>
            </div>

            <div className="space-y-3">
              {/* Strengths */}
              {profile.task_strengths.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">
                    Strengths
                  </h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
                    {profile.task_strengths.slice(0, 3).map((strength, idx) => (
                      <li key={idx} className="truncate">• {strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {profile.task_weaknesses.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-1">
                    Weaknesses
                  </h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
                    {profile.task_weaknesses.slice(0, 3).map((weakness, idx) => (
                      <li key={idx} className="truncate">• {weakness}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Unique Capabilities */}
              {profile.unique_capabilities && profile.unique_capabilities.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">
                    Unique Capabilities
                  </h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
                    {profile.unique_capabilities.slice(0, 2).map((capability, idx) => (
                      <li key={idx} className="truncate">• {capability}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
              {profile.submission_count} {profile.submission_count === 1 ? 'submission' : 'submissions'}
            </div>
          </div>
        ))}
      </div>

      {/* Task Difficulty */}
      {insights && Object.keys(insights.task_difficulty).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Task Difficulty Ranking
          </h2>
          <div className="space-y-3">
            {Object.entries(insights.task_difficulty)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 15)
              .map(([task, difficulty]) => (
                <div key={task} className="flex items-center">
                  <div className="flex-1 flex items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize min-w-[200px]">
                      {task.replace(/-/g, ' ')}
                    </span>
                    <div className="flex-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${(difficulty / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white w-12 text-right">
                    {difficulty.toFixed(1)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Insight Nuggets */}
      {insights?.nuggets && insights.nuggets.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Key Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.nuggets.slice(0, 10).map((nugget, idx) => (
              <div
                key={idx}
                className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase">
                    {nugget.category}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{nugget.text}</p>
                {nugget.source_posts && nugget.source_posts.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    From {nugget.source_posts.length} {nugget.source_posts.length === 1 ? 'post' : 'posts'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
