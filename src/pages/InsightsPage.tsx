import { useEffect, useMemo, useState } from 'react';
import { useLLMProfiles, useInsightsData } from '../hooks/usePostsData';
import type { LLMProfile } from '../lib/types';

export function InsightsPage() {
  const { data: llmProfiles, isLoading: loadingProfiles, error: profilesError } = useLLMProfiles();
  const { data: insights, isLoading: loadingInsights, error: insightsError } = useInsightsData();
  const [activeTab, setActiveTab] = useState<'compare' | 'advisor'>('compare');
  const [selectedLLMs, setSelectedLLMs] = useState<string[]>([]);
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [modalProfile, setModalProfile] = useState<LLMProfile | null>(null);

  const canonicalizeLLMName = (name: string) => {
    const normalized = name.trim().toLowerCase();
    if (normalized.includes('haiku')) return 'Claude (Haiku)';
    return name;
  };

  const aggregatedProfiles = useMemo(() => {
    const map = new Map<string, LLMProfile & { _successSum?: number; _successCount?: number }>();

    (llmProfiles ?? []).forEach(profile => {
      if (profile.llm_name === 'Unknown') return;
      const canonical = canonicalizeLLMName(profile.llm_name);

      const submission_count = profile.submission_count || 0;
      const success = profile.average_success_rate;
      const successSum = success != null ? success * submission_count : 0;
      const successCount = success != null ? submission_count : 0;

      const existing = map.get(canonical);
      if (!existing) {
        map.set(canonical, {
          ...profile,
          llm_name: canonical,
          submission_count,
          _successSum: successSum,
          _successCount: successCount,
          task_strengths: [...profile.task_strengths],
          task_weaknesses: [...profile.task_weaknesses],
          common_failure_modes: [...profile.common_failure_modes],
          unique_capabilities: [...profile.unique_capabilities],
        });
      } else {
        const newSubmissionCount = existing.submission_count + submission_count;
        const newSuccessSum = (existing._successSum ?? 0) + successSum;
        const newSuccessCount = (existing._successCount ?? 0) + successCount;

        existing.submission_count = newSubmissionCount;
        existing._successSum = newSuccessSum;
        existing._successCount = newSuccessCount;
        existing.average_success_rate =
          newSuccessCount > 0
            ? Math.round((newSuccessSum / newSuccessCount) * 10) / 10
            : existing.average_success_rate ?? 0;

        const mergeUnique = (a: string[], b: string[]) => Array.from(new Set([...a, ...b]));
        existing.task_strengths = mergeUnique(existing.task_strengths, profile.task_strengths);
        existing.task_weaknesses = mergeUnique(existing.task_weaknesses, profile.task_weaknesses);
        existing.common_failure_modes = mergeUnique(existing.common_failure_modes, profile.common_failure_modes);
        existing.unique_capabilities = mergeUnique(existing.unique_capabilities, profile.unique_capabilities);
      }
    });

    // Tidy merged lists to manageable lengths
    return Array.from(map.values()).map(p => ({
      ...p,
      task_strengths: p.task_strengths.slice(0, 5),
      task_weaknesses: p.task_weaknesses.slice(0, 5),
      common_failure_modes: p.common_failure_modes.slice(0, 5),
      unique_capabilities: p.unique_capabilities.slice(0, 6),
    }));
  }, [llmProfiles]);

  const availableLLMs = useMemo(
    () =>
      aggregatedProfiles
        .map(profile => profile.llm_name)
        .sort((a, b) => a.localeCompare(b)),
    [aggregatedProfiles]
  );

  useEffect(() => {
    if (!hasInitializedSelection && availableLLMs.length > 0) {
      setSelectedLLMs(availableLLMs);
      setHasInitializedSelection(true);
    }
  }, [availableLLMs, hasInitializedSelection]);

  const toggleLLM = (llmName: string) => {
    setSelectedLLMs((prev) =>
      prev.includes(llmName) ? prev.filter(name => name !== llmName) : [...prev, llmName]
    );
  };

  const filteredProfiles = useMemo(
    () =>
      aggregatedProfiles.filter(profile =>
        selectedLLMs.length === 0 ? false : selectedLLMs.includes(profile.llm_name)
      ),
    [aggregatedProfiles, selectedLLMs]
  );

  const availableTasks = useMemo(() => {
    const tasks = new Set<string>();
    (llmProfiles ?? []).forEach(profile => {
      if (profile.llm_name === 'Unknown') return;
      profile.task_strengths.forEach(task => tasks.add(task));
      profile.task_weaknesses.forEach(task => tasks.add(task));
    });
    return Array.from(tasks).sort((a, b) => a.localeCompare(b));
  }, [llmProfiles]);

  const toggleTask = (task: string) => {
    setSelectedTasks(prev => (prev.includes(task) ? prev.filter(t => t !== task) : [...prev, task]));
  };

  const advisorRanking = useMemo(() => {
    if (!llmProfiles || selectedTasks.length === 0) return [];
    const selectedSet = new Set(selectedTasks);

    return llmProfiles
      .filter(profile => profile.llm_name !== 'Unknown')
      .map(profile => {
        const strengthMatches = profile.task_strengths.filter(task => selectedSet.has(task)).length;
        const weaknessMatches = profile.task_weaknesses.filter(task => selectedSet.has(task)).length;
        const baseSuccess = profile.average_success_rate ?? 0;
        // Simple scoring: reward strengths, penalize weaknesses, modestly weight success rate
        const score = strengthMatches * 2 - weaknessMatches + baseSuccess * 0.1;
        return { profile, score, strengthMatches, weaknessMatches, baseSuccess };
      })
      .sort((a, b) => b.score - a.score);
  }, [llmProfiles, selectedTasks]);

  const maxDifficulty = useMemo(() => {
    if (!insights?.task_difficulty) return 1;
    const values = Object.values(insights.task_difficulty);
    const max = values.length ? Math.max(...values) : 1;
    return max > 0 ? max : 1;
  }, [insights]);

  // Close modal on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalProfile(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setActiveTab('compare')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${
            activeTab === 'compare'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-blue-600'
          }`}
        >
          Compare LLMs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('advisor')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${
            activeTab === 'advisor'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-blue-600'
          }`}
        >
          Task Advisor
        </button>
      </div>

      {activeTab === 'compare' && (
      <>
      {/* LLM Selection Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Choose LLMs to compare</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Toggle models on or off to refine the comparisons below.</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-700 dark:text-gray-300">
              {selectedLLMs.length} of {availableLLMs.length} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedLLMs(availableLLMs)}
              disabled={selectedLLMs.length === availableLLMs.length || availableLLMs.length === 0}
              className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => setSelectedLLMs([])}
              disabled={selectedLLMs.length === 0}
              className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableLLMs.map((llm) => {
            const isActive = selectedLLMs.includes(llm);
            return (
              <button
                key={llm}
                type="button"
                onClick={() => toggleLLM(llm)}
                className={`px-3 py-1.5 rounded-full border text-sm transition ${
                  isActive
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {llm}
              </button>
            );
          })}
          {availableLLMs.length === 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">No LLM profiles available.</span>
          )}
        </div>
      </div>

      {/* LLM Comparison Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            LLM Comparison
          </h2>
        </div>
        {filteredProfiles.length === 0 ? (
          <div className="px-6 py-6 text-sm text-gray-600 dark:text-gray-300">
            Select at least one LLM to view the comparison table.
          </div>
        ) : (
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
                {filteredProfiles.map((profile) => (
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
        )}
      </div>

      {/* LLM Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.length === 0 ? (
          <div className="col-span-full text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            Select at least one LLM to see detailed insights.
          </div>
        ) : (
          filteredProfiles.map((profile) => (
            <div
              key={profile.llm_name}
              className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
            >
              <button
                type="button"
                onClick={() => setModalProfile(profile)}
                className="absolute top-3 right-3 w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center"
                aria-label={`View details for ${profile.llm_name}`}
              >
                ⓘ
              </button>
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
          ))
        )}
      </div>
      </>
      )}

      {activeTab === 'advisor' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">Task Advisor</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pick the tasks you’re working on. We’ll rank LLMs by their strengths for those tasks.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ranking score = (2 × strength hits) − (1 × weakness hits) + 0.1 × avg success rate (%). A “hit” is when a selected task
                  appears in that model’s strengths or weaknesses.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setSelectedTasks(availableTasks)}
                  disabled={selectedTasks.length === availableTasks.length || availableTasks.length === 0}
                  className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTasks([])}
                  disabled={selectedTasks.length === 0}
                  className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableTasks.map(task => {
                const isActive = selectedTasks.includes(task);
                return (
                  <button
                    key={task}
                    type="button"
                    onClick={() => toggleTask(task)}
                    className={`px-3 py-1.5 rounded-full border text-sm transition capitalize ${
                      isActive
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {task.replace(/-/g, ' ')}
                  </button>
                );
              })}
              {availableTasks.length === 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">No task tags available.</span>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recommended LLMs</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ranking favors selected-task strengths, penalizes weaknesses, and lightly weights success rate.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Score = (2 × strength hits) − (1 × weakness hits) + 0.1 × average success rate (%). Strength/weakness hits
                count how many of your selected tasks match each model’s strengths/weaknesses.
              </p>
            </div>
            {selectedTasks.length === 0 ? (
              <div className="px-6 py-6 text-sm text-gray-600 dark:text-gray-300">
                Choose at least one task to see recommendations.
              </div>
            ) : advisorRanking.length === 0 ? (
              <div className="px-6 py-6 text-sm text-gray-600 dark:text-gray-300">
                No data available for these tasks.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">LLM</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Strength hits</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Weakness hits</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Avg success</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {advisorRanking.map((entry, idx) => (
                      <tr key={entry.profile.llm_name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{idx + 1}</td>
                        <td className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">{entry.profile.llm_name}</td>
                        <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">{entry.score.toFixed(1)}</td>
                        <td className="px-6 py-3 text-sm text-green-700 dark:text-green-400">{entry.strengthMatches}</td>
                        <td className="px-6 py-3 text-sm text-orange-700 dark:text-orange-400">{entry.weaknessMatches}</td>
                        <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {entry.baseSuccess != null ? `${entry.baseSuccess.toFixed(1)}%` : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Task Difficulty (advisor tab only) */}
          {insights && Object.keys(insights.task_difficulty).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Task Difficulty Ranking
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Bars are scaled relative to the hardest task in this dataset (100% = hardest). Difficulty is computed as
                100 minus the average one-shot success rate for that task across posts—higher = harder for students.
              </p>
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
                            className="bg-red-400 h-2 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, (difficulty / maxDifficulty) * 100))}%` }}
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

      {/* Modal for LLM details */}
      {modalProfile && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => setModalProfile(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalProfile(null)}
              className="absolute top-3 right-3 w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
              aria-label="Close modal"
            >
              ✕
            </button>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pr-12">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{modalProfile.llm_name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Detailed capability breakdown and task strengths/weaknesses.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {modalProfile.average_success_rate != null ? `${modalProfile.average_success_rate.toFixed(1)}%` : 'N/A'}
                  </div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Avg success rate
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">
                    {modalProfile.submission_count}
                  </div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {modalProfile.submission_count === 1 ? 'submission' : 'submissions'}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-green-100 dark:border-green-800/40 bg-green-50 dark:bg-green-900/10">
                <h4 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">Strengths</h4>
                {modalProfile.task_strengths.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">No strengths recorded.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {modalProfile.task_strengths.map((task, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-800/40 dark:text-green-100 capitalize"
                      >
                        {task.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 rounded-lg border border-orange-100 dark:border-orange-800/40 bg-orange-50 dark:bg-orange-900/10">
                <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-2">Weaknesses</h4>
                {modalProfile.task_weaknesses.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">No weaknesses recorded.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {modalProfile.task_weaknesses.map((task, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-800/40 dark:text-orange-100 capitalize"
                      >
                        {task.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {modalProfile.common_failure_modes && modalProfile.common_failure_modes.length > 0 && (
              <div className="p-4 rounded-lg border border-red-100 dark:border-red-800/40 bg-red-50 dark:bg-red-900/10">
                <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">Cautionary notes</h4>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {modalProfile.common_failure_modes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-600 dark:text-red-400">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(() => {
              const normalizedTasks = new Set(
                [...modalProfile.task_strengths, ...modalProfile.task_weaknesses].map(task =>
                  task.toLowerCase().replace(/-/g, ' ').trim()
                )
              );
              const filteredObservations =
                modalProfile.unique_capabilities?.filter(cap => {
                  const capLower = cap.toLowerCase();
                  for (const task of normalizedTasks) {
                    if (task && capLower.includes(task)) return false;
                  }
                  return true;
                }) ?? [];

              if (filteredObservations.length === 0) {
                return null;
              }

              return (
              <div className="p-4 rounded-lg border border-blue-100 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-900/10">
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Other observations</h4>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {filteredObservations.map((cap, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400">•</span>
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>
              );
            })()}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setModalProfile(null)}
                className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
