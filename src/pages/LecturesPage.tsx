import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePostsData } from '../hooks/usePostsData';
import { lectureSchedule } from '../lib/lectureData';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Post } from '../lib/types';

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
      <div className="text-sm text-slate-600 italic">
        No specific resources found.{' '}
        <Link
          to="/"
          className="text-slate-800 hover:underline"
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
              className="text-[#0b254b] underline decoration-2 underline-offset-2 hover:text-[#081a36] text-sm font-semibold leading-tight"
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
            className="text-xs text-[#0b254b] underline decoration-2 underline-offset-2 hover:text-[#081a36] font-semibold"
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
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-slate-500 border-r-slate-400"></div>
          <p className="mt-6 text-lg font-semibold text-slate-700">Loading lectures...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-red-100">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Error Loading Content
          </h2>
          <p className="text-slate-600">
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
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Playlist
          </h1>
          <p className="text-slate-600">
            Curate your learning path. Save relevant resources for each lecture topic.
          </p>
        </div>
        <Link
          to="/"
          className="px-5 py-2.5 bg-white text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md"
        >
          Explore
        </Link>
      </div>

      {/* Table */}
      <div className="bg-slate-50 rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider w-12 border-r border-slate-200">
                  W
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider w-32 border-r border-slate-200">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider w-1/4 border-r border-slate-200">
                  Lecture Topic
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-200">
                  Resources (Special Participation)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider w-32">
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
                    className="hover:bg-white transition-colors border-b border-slate-200 bg-white/80"
                  >
                    {/* Week */}
                    <td className="px-4 py-4 text-sm font-medium text-slate-900 border-r border-slate-200">
                      {lecture.week}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 text-sm text-slate-700 border-r border-slate-200">
                      {lecture.dates}
                    </td>

                    {/* Lecture Topics */}
                    <td className="px-4 py-4 border-r border-slate-200">
                      <div className="space-y-1">
                        {lecture.topics.map((topic, idx) => (
                          <div key={idx} className="text-sm text-slate-900 font-medium">
                            {topic}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Resources */}
                    <td className="px-4 py-4 border-r border-slate-200">
                      <ResourcesPagination
                        posts={homeworkPosts}
                        homeworkKey={lecture.homework}
                      />
                    </td>

                    {/* Homework */}
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-md border border-slate-300 text-slate-900 text-xs font-bold uppercase">
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
