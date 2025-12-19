import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePost, usePostsData } from '../hooks/usePostsData';
import { getRelatedPosts } from '../lib/filterPosts';
import { getAuthorDisplayName, getEdUrl, resolveLLMFromPost } from '../lib/utils';

type TabType = 'overview' | 'analysis' | 'code' | 'attachments';

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const { data: post, isLoading, error } = usePost(postId);
  const { data: allPosts } = usePostsData();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const relatedPosts = post && allPosts ? getRelatedPosts(post, allPosts) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Post Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The post you're looking for doesn't exist.
          </p>
          <Link to="/" className="text-blue-600 hover:underline">
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {post.title}
        </h1>

        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <span className="font-medium text-gray-900 dark:text-white">
            {getAuthorDisplayName(post)}
          </span>
          <span>•</span>
          <a
            href={getEdUrl(post)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
            title="View on Ed Discussion"
          >
            View on Ed
          </a>
          {post.author.linkedin && (
            <>
              <span>•</span>
              <a
                href={post.author.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                LinkedIn
              </a>
            </>
          )}
          <span>•</span>
          <span>{new Date(post.date).toLocaleDateString()}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
            {resolveLLMFromPost(post)}
          </span>
          {post.llm_info.variant && (
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
              {post.llm_info.variant}
            </span>
          )}
          {post.highlight_score >= 7 && (
            <span className="px-3 py-1 bg-amber-600 dark:bg-amber-700 text-white rounded-full font-medium">
              ⭐ Featured
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'analysis', label: 'Full Analysis' },
              { id: 'code', label: `Code (${post.code_snippets.length})` },
              { id: 'attachments', label: `Attachments (${post.attachments.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* AI Summary */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  AI Summary
                </h2>
                <p className="text-gray-700 dark:text-gray-300">{post.summary}</p>
              </div>

              {/* Original Post Content */}
              {post.content_markdown && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Original Post Content
                  </h2>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg max-h-[600px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
                      {post.content_markdown}
                    </pre>
                  </div>
                </div>
              )}

              {/* Key Metrics */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Key Metrics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {post.highlight_score}/10
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Quality Score
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {post.insights.one_shot_success_rate || 'N/A'}
                      {post.insights.one_shot_success_rate && '%'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Success Rate
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {post.insights.iterations_required || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Avg Iterations
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {post.code_snippets.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Code Snippets
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Coverage */}
              {post.task_types.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Task Coverage
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {post.task_types.map((task, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
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
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Homework Coverage
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {post.homework_coverage.map((hw, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm uppercase font-medium"
                      >
                        {hw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Tags
                </h2>
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
                      .map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* Strengths */}
              {post.insights.strengths.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-green-700 dark:text-green-400 mb-3">
                    ✓ Strengths
                  </h2>
                  <ul className="space-y-2">
                    {post.insights.strengths.map((strength, idx) => (
                      <li
                        key={idx}
                        className="flex items-start space-x-2 text-gray-700 dark:text-gray-300"
                      >
                        <span className="text-green-600 dark:text-green-400 mt-1">
                          •
                        </span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {post.insights.weaknesses.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-orange-700 dark:text-orange-400 mb-3">
                    ⚠ Weaknesses
                  </h2>
                  <ul className="space-y-2">
                    {post.insights.weaknesses.map((weakness, idx) => (
                      <li
                        key={idx}
                        className="flex items-start space-x-2 text-gray-700 dark:text-gray-300"
                      >
                        <span className="text-orange-600 dark:text-orange-400 mt-1">
                          •
                        </span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hallucinations */}
              {post.insights.hallucinations.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-3">
                    ✗ Hallucinations
                  </h2>
                  <div className="space-y-3">
                    {post.insights.hallucinations.map((hall, idx) => (
                      <div
                        key={idx}
                        className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800"
                      >
                        <p className="text-gray-900 dark:text-white font-medium mb-2">
                          {hall.description}
                        </p>
                        {hall.example && (
                          <code className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded block">
                            {hall.example}
                          </code>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Effective Strategies */}
              {post.insights.effective_strategies.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-3">
                    💡 Effective Strategies
                  </h2>
                  <ul className="space-y-2">
                    {post.insights.effective_strategies.map((strategy, idx) => (
                      <li
                        key={idx}
                        className="flex items-start space-x-2 text-gray-700 dark:text-gray-300"
                      >
                        <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                        <span>{strategy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Code Quality */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Code Quality Assessment
                </h2>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {post.code_quality.correctness_rating}/10
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Correctness
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {post.code_quality.code_style_rating}/10
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Code Style
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {post.code_quality.pythonic_rating}/10
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Pythonic
                    </div>
                  </div>
                </div>
                {post.code_quality.notes.length > 0 && (
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {post.code_quality.notes.map((note, idx) => (
                      <li key={idx}>• {note}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-6">
              {post.code_snippets.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  No code snippets available
                </p>
              ) : (
                post.code_snippets.map((snippet, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Snippet {idx + 1}
                        {snippet.language && (
                          <span className="ml-2 text-sm font-normal text-gray-500">
                            ({snippet.language})
                          </span>
                        )}
                      </h3>
                      <button
                        onClick={() => navigator.clipboard.writeText(snippet.code)}
                        className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    {snippet.context && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {snippet.context}
                      </p>
                    )}
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <code>{snippet.code}</code>
                    </pre>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="space-y-4">
              {post.attachments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No attachments available</p>
              ) : (
                post.attachments.map((attachment, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {attachment.filename}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {attachment.type}
                      </div>
                    </div>
                    {attachment.ed_url && (
                      <a
                        href={attachment.ed_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                      >
                        View
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Related Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.post_id}
                to={`/post/${relatedPost.post_id}`}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {relatedPost.title}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{relatedPost.author.name}</span>
                  <span>•</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {relatedPost.llm_info.primary_llm}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
