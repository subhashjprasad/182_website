import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePostsData } from '../hooks/usePostsData';
import { lectureSchedule } from '../lib/lectureData';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Post } from '../lib/types';
import { getAuthorDisplayName } from '../lib/utils';

interface ResourcesPaginationProps {
  posts: Post[];
  homeworkKey: string;
}

function ResourcesPagination({ posts, homeworkKey }: ResourcesPaginationProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const postsPerPage = 3;
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIdx = currentPage * postsPerPage;
  const visiblePosts = posts.slice(startIdx, startIdx + postsPerPage);

  if (posts.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
        No specific resources found.{' '}
        <Link
          to="/"
          className="text-sky-600 dark:text-sky-400 hover:underline"
        >
          Search Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Resource Links */}
      <div className="space-y-2">
        {visiblePosts.map((post, idx) => (
          <div key={post.post_id} className="flex items-start gap-2">
            <span className="text-gray-400 dark:text-gray-500 text-sm mt-0.5 flex-shrink-0">
              {startIdx + idx + 1}
            </span>
            <Link
              to={`/post/${post.post_id}`}
              className="text-sky-700 dark:text-sky-400 hover:underline text-sm font-medium leading-tight"
            >
              {post.title}
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {currentPage + 1}/{totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <Link
            to={`/?homework=${homeworkKey}`}
            className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-medium"
          >
            Explore →
          </Link>
        </div>
      )}
    </div>
  );
}

export function LecturesPage() {
  const { data: posts, isLoading, error } = usePostsData();

  // Group posts by homework
  const postsByHomework = useMemo(() => {
    if (!posts) return new Map<string, Post[]>();

    const grouped = new Map<string, Post[]>();

    posts.forEach(post => {
      post.homework_coverage.forEach((hw: string) => {
        const hwKey = hw.toLowerCase();
        if (!grouped.has(hwKey)) {
          grouped.set(hwKey, []);
        }
        grouped.get(hwKey)!.push(post);
      });
    });

    return grouped;
  }, [posts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-slate-600 border-r-gray-600"></div>
          <p className="mt-6 text-lg font-semibold bg-gradient-to-r from-gray-700 to-slate-700 bg-clip-text text-transparent">Loading lectures...</p>
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
            Error Loading Content
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-sky-600 dark:text-sky-400 mb-2">
            Playlist
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Curate your learning path. Save relevant resources for each lecture topic.
          </p>
        </div>
        <Link
          to="/"
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold transition-all shadow-md"
        >
          Explore
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 border-gray-300 dark:border-gray-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b-2 border-gray-300 dark:border-gray-600">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-12 border-r border-gray-300 dark:border-gray-600">
                  W
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-32 border-r border-gray-300 dark:border-gray-600">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-1/4 border-r border-gray-300 dark:border-gray-600">
                  Lecture Topic
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                  Resources (Special Participation)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-32">
                  Homework
                </th>
              </tr>
            </thead>
            <tbody>
              {lectureSchedule.map((lecture) => {
                const homeworkPosts = postsByHomework.get(lecture.homework) || [];

                return (
                  <tr
                    key={lecture.week}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors border-b border-gray-300 dark:border-gray-600"
                  >
                    {/* Week */}
                    <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
                      {lecture.week}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">
                      {lecture.dates}
                    </td>

                    {/* Lecture Topics */}
                    <td className="px-4 py-4 border-r border-gray-300 dark:border-gray-600">
                      <div className="space-y-1">
                        {lecture.topics.map((topic, idx) => (
                          <div key={idx} className="text-sm text-gray-900 dark:text-white font-medium">
                            {topic}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Resources */}
                    <td className="px-4 py-4 border-r border-gray-300 dark:border-gray-600">
                      <ResourcesPagination
                        posts={homeworkPosts}
                        homeworkKey={lecture.homework}
                      />
                    </td>

                    {/* Homework */}
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-md border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white text-xs font-bold uppercase">
                        {lecture.homework}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
