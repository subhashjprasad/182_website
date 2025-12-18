import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Bookmark, ExternalLink, Eye, Sparkles } from 'lucide-react';
import type { Post } from '../../lib/types';
import { useBookmarksStore } from '../../store/useBookmarksStore';
import { getAuthorDisplayName, getEdUrl, resolveLLMFromPost } from '../../lib/utils';

interface QuickViewProps {
  post: Post | null;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export function QuickView({ post, onClose, onNext, onPrevious, hasNext, hasPrevious }: QuickViewProps) {
  const { isSaved, toggleSave } = useBookmarksStore();
  const [showOriginal, setShowOriginal] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (post) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when quick view is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [post, onClose]);

  if (!post) return null;

  const saved = isSaved(post.post_id);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-2/3 lg:w-1/2 xl:w-2/5 bg-gradient-to-br from-white via-sky-50/30 to-cyan-50/30 dark:from-gray-900 dark:via-sky-950/30 dark:to-purple-950/30 shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-sky-200/50 dark:border-sky-700/50 p-4 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-2">
            {/* Navigation Arrows */}
            <button
              onClick={onPrevious}
              disabled={!hasPrevious}
              className={`p-2 rounded-xl transition-all ${
                hasPrevious
                  ? 'hover:bg-sky-100 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 hover:scale-110'
                  : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }`}
              title="Previous post (←)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className={`p-2 rounded-xl transition-all ${
                hasNext
                  ? 'hover:bg-sky-100 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 hover:scale-110'
                  : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }`}
              title="Next post (→)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSave(post.post_id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 ${
                saved
                  ? 'bg-gradient-to-r from-blue-600 to-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
              {saved ? 'Saved' : 'Save'}
            </button>
            <Link
              to={`/post/${post.post_id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-sky-500/30 hover:scale-105"
            >
              <Eye className="w-4 h-4" />
              Full View
            </Link>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:scale-110"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title and Metadata */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-sky-600 to-blue-700 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent flex-1 pr-4">
                {post.title}
              </h2>
              {post.highlight_score >= 9 && (
                <span className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-bold shadow-lg shadow-yellow-500/30">
                  <Sparkles className="w-3 h-3" />
                  Featured
                </span>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-2 text-sm mb-4">
              <span className="font-bold text-gray-900 dark:text-white">
                {getAuthorDisplayName(post)}
              </span>
              <span className="text-gray-400">•</span>
              <a
                href={getEdUrl(post)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium transition-colors"
                title="View on Ed Discussion"
              >
                <ExternalLink className="w-3 h-3" />
                Ed Post
              </a>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 dark:text-gray-400">{new Date(post.date).toLocaleDateString()}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-sky-500 text-white rounded-lg text-sm font-bold shadow-sm">
                {resolveLLMFromPost(post)}
              </span>
              {post.llm_info.variant && (
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium">
                  {post.llm_info.variant}
                </span>
              )}
            </div>
          </div>

          {/* Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AI Summary
            </h3>
            <p className="text-gray-700 dark:text-gray-300">{post.summary}</p>
          </div>

          {/* Original Content - Collapsible */}
          {post.content_markdown && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Original Post Content
                </h3>
                <span className="text-gray-500 dark:text-gray-400">
                  {showOriginal ? '▼' : '▶'}
                </span>
              </button>
              {showOriginal && (
                <div className="p-3 pt-0 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
                    {post.content_markdown}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Key Metrics */}
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent mb-4">
              Key Metrics
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 p-4 rounded-xl text-center border border-cyan-100 dark:border-blue-800/30">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {post.highlight_score}/10
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-1">Quality</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl text-center border border-green-100 dark:border-green-800/30">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {post.insights.one_shot_success_rate || 'N/A'}
                  {post.insights.one_shot_success_rate && '%'}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-1">Success</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl text-center border border-blue-100 dark:border-blue-800/30">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {post.code_snippets.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-1">Code</div>
              </div>
            </div>
          </div>

          {/* Strengths */}
          {post.insights.strengths.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">
                ✓ Strengths
              </h3>
              <ul className="space-y-1.5">
                {post.insights.strengths.slice(0, 5).map((strength, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
              {post.insights.strengths.length > 5 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  +{post.insights.strengths.length - 5} more in full view
                </p>
              )}
            </div>
          )}

          {/* Weaknesses */}
          {post.insights.weaknesses.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400 mb-2">
                ⚠ Weaknesses
              </h3>
              <ul className="space-y-1.5">
                {post.insights.weaknesses.slice(0, 5).map((weakness, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
              {post.insights.weaknesses.length > 5 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  +{post.insights.weaknesses.length - 5} more in full view
                </p>
              )}
            </div>
          )}

          {/* Task Coverage */}
          {post.task_types.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Task Coverage
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.task_types.map((task, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                  >
                    {task.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Homework Coverage */}
          {post.homework_coverage.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Homework Coverage
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.homework_coverage.map((hw, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs uppercase font-medium"
                  >
                    {hw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Tags
            </h3>
            {post.tags.filter(tag => {
              const t = tag.toLowerCase();
              return t !== 'unknown' && t !== 'other';
            }).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags
                  .filter(tag => {
                    const t = tag.toLowerCase();
                    return t !== 'unknown' && t !== 'other';
                  })
                  .slice(0, 15)
                  .map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-cyan-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                {post.tags.filter(tag => {
                  const t = tag.toLowerCase();
                  return t !== 'unknown' && t !== 'other';
                }).length > 15 && (
                  <span className="px-2.5 py-1 text-gray-500 dark:text-gray-400 text-xs">
                    +{post.tags.filter(tag => {
                      const t = tag.toLowerCase();
                      return t !== 'unknown' && t !== 'other';
                    }).length - 15} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* View Full Details Button */}
          <div className="pt-6 border-t border-sky-200 dark:border-sky-700">
            <Link
              to={`/post/${post.post_id}`}
              className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-sky-500/30 hover:shadow-xl hover:scale-105"
            >
              View Full Details
              <Eye className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
