import { Link } from 'react-router-dom';
import { Eye, ExternalLink, Sparkles } from 'lucide-react';
import type { Post } from '../../lib/types';
import { getAuthorDisplayName, getEdUrl, resolveLLMFromPost } from '../../lib/utils';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {

  return (
    <Link
      to={`/post/${post.post_id}`}
      className="group block bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-sky-400 dark:hover:border-sky-500 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
            {post.title}
          </h3>
        </div>
        {post.highlight_score >= 9 && (
          <span className="ml-3 flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-600 dark:bg-amber-700 text-white">
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
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 font-medium transition-colors"
          title="View on Ed Discussion"
        >
          <ExternalLink className="w-3 h-3" />
          Ed Post
        </a>
        <span className="text-gray-400">•</span>
        <span className="px-3 py-1 bg-sky-600 dark:bg-sky-700 text-white rounded-lg font-bold text-xs shadow-sm">
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
        <div className="text-center p-3 bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/20 rounded-xl border border-sky-100 dark:border-sky-800/30">
          <div className="font-bold text-lg text-sky-700 dark:text-sky-300">
            {post.code_snippets.length}
          </div>
          <div className="text-gray-600 dark:text-gray-400 font-medium">Code</div>
        </div>
      </div>

      {/* Click for more info bar */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-center">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Click for More Information
        </span>
      </div>
    </Link>
  );
}
