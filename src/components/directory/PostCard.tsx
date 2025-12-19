import { Link } from 'react-router-dom';
import { ExternalLink, Sparkles } from 'lucide-react';
import type { Post } from '../../lib/types';
import { getAuthorDisplayName, getEdUrl, resolveLLMFromPost } from '../../lib/utils';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {

  return (
    <Link
      to={`/post/${post.post_id}`}
      className="group block bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-slate-200 hover:border-[#4a6cf7]/40 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-slate-900 line-clamp-2">
            {post.title}
          </h3>
        </div>
        {post.highlight_score >= 9 && (
          <span className="ml-3 flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 text-white">
            <Sparkles className="w-3 h-3" />
            Featured
          </span>
        )}
      </div>

      {/* Author and LLM Info */}
      <div className="flex items-center flex-wrap gap-2 mb-4 text-sm">
        <span className="text-slate-800 font-semibold">
          {getAuthorDisplayName(post)}
        </span>
        <span className="text-slate-400">•</span>
        <a
          href={getEdUrl(post)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-[#4a6cf7] hover:text-[#3b5bdb] font-medium transition-colors"
          title="View on Ed Discussion"
        >
          <ExternalLink className="w-3 h-3" />
          Ed Post
        </a>
        <span className="text-slate-400">•</span>
        <span className="px-3 py-1 bg-white text-[#4a6cf7] border border-slate-200 rounded-lg font-bold text-xs shadow-sm">
          {resolveLLMFromPost(post)}
        </span>
        {post.llm_info.variant && (
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs font-medium">
            {post.llm_info.variant}
          </span>
        )}
      </div>

      {/* Summary */}
      <p className="text-slate-700 text-sm line-clamp-3 mb-4">
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
                className="px-2 py-0.5 bg-white text-slate-800 border border-slate-200 rounded text-xs"
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
        <div className="text-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="font-bold text-lg text-[#4a6cf7]">
            {post.highlight_score}/10
          </div>
          <div className="text-slate-600 font-medium">Quality</div>
        </div>
        <div className="text-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="font-bold text-lg text-[#4a6cf7]">
            {post.insights.one_shot_success_rate || 'N/A'}
            {post.insights.one_shot_success_rate && '%'}
          </div>
          <div className="text-slate-600 font-medium">Success</div>
        </div>
        <div className="text-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="font-bold text-lg text-[#4a6cf7]">
            {post.code_snippets.length}
          </div>
          <div className="text-slate-600 font-medium">Code</div>
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





