import { Link } from 'react-router-dom';
import { Eye, Bookmark, ExternalLink, Sparkles } from 'lucide-react';
import type { Post } from '../../lib/types';
import { useBookmarksStore } from '../../store/useBookmarksStore';
import { getAuthorDisplayName, getEdUrl, resolveLLMFromPost } from '../../lib/utils';

interface PostCardProps {
  post: Post;
  onQuickView?: () => void;
}

export function PostCard({ post, onQuickView }: PostCardProps) {
  const { isSaved, toggleSave } = useBookmarksStore();
  const saved = isSaved(post.post_id);

  return (
    <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200/50 dark:border-gray-700/50 hover:scale-[1.02] hover:border-sky-300 dark:hover:border-sky-700">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <Link
            to={`/post/${post.post_id}`}
            className="text-xl font-bold text-gray-900 dark:text-white hover:bg-gradient-to-r hover:from-sky-600 hover:to-blue-600 hover:bg-clip-text hover:text-transparent line-clamp-2 transition-all"
          >
            {post.title}
          </Link>
        </div>
        {post.highlight_score >= 9 && (
          <span className="ml-3 flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/30">
            <Sparkles className="w-3 h-3" />
            Featured
          </span>
        )}
      </div>

      {/* Author and LLM Info */}
      <div className="flex items-center flex-wrap gap-2 mb-4 text-sm">
        <span className="text-gray-700 dark:text-gray-300 font-semibold">
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
        <span className="px-3 py-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg font-bold text-xs shadow-sm">
          {resolveLLMFromPost(post)}
        </span>
        {post.llm_info.variant && (
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs font-medium">
            {post.llm_info.variant}
          </span>
        )}
      </div>

      {/* Summary */}
      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
        {post.summary}
      </p>

      {/* Tags */}
      {post.tags.filter(tag => {
        const t = tag.toLowerCase();
        return t !== 'unknown' && t !== 'other';
      }).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags
            .filter(tag => {
              const t = tag.toLowerCase();
              return t !== 'unknown' && t !== 'other';
            })
            .slice(0, 5)
            .map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          {post.tags.filter(tag => {
            const t = tag.toLowerCase();
            return t !== 'unknown' && t !== 'other';
          }).length > 5 && (
            <span className="text-xs text-gray-400">
              +{post.tags.filter(tag => {
                const t = tag.toLowerCase();
                return t !== 'unknown' && t !== 'other';
              }).length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-5 text-xs">
        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30">
          <div className="font-bold text-lg text-purple-700 dark:text-purple-300">
            {post.highlight_score}/10
          </div>
          <div className="text-gray-600 dark:text-gray-400 font-medium">Quality</div>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
          <div className="font-bold text-lg text-green-700 dark:text-green-300">
            {post.insights.one_shot_success_rate || 'N/A'}
            {post.insights.one_shot_success_rate && '%'}
          </div>
          <div className="text-gray-600 dark:text-gray-400 font-medium">Success</div>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
          <div className="font-bold text-lg text-blue-700 dark:text-blue-300">
            {post.code_snippets.length}
          </div>
          <div className="text-gray-600 dark:text-gray-400 font-medium">Code</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Link
          to={`/post/${post.post_id}`}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-sky-500/30 hover:shadow-xl hover:scale-105"
        >
          <Eye className="w-4 h-4" />
          View Details
        </Link>
        {onQuickView && (
          <button
            onClick={onQuickView}
            className="px-4 py-2.5 border-2 border-sky-200 dark:border-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-xl text-sm font-bold transition-all hover:scale-105"
          >
            Quick View
          </button>
        )}
        <button
          onClick={() => toggleSave(post.post_id)}
          className={`px-3 py-2.5 rounded-xl transition-all hover:scale-110 ${
            saved
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
              : 'border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          title={saved ? 'Unsave' : 'Save'}
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
}
