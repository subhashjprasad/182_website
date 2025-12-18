/**
 * Search and filtering hooks using Fuse.js
 */
import { useMemo } from 'react';
import Fuse from 'fuse.js';
import type { Post } from '../lib/types';

export interface SearchMatch {
  key?: string;
  value?: string;
  indices?: readonly [number, number][];
}

export interface PostWithMatches extends Post {
  _matches?: readonly SearchMatch[];
  _score?: number;
}

/**
 * Full-text search using Fuse.js
 */
export function useSearchPosts(posts: Post[], query: string): PostWithMatches[] {
  const fuse = useMemo(
    () => new Fuse(posts, {
      keys: [
        { name: 'title', weight: 2.5 },
        { name: 'summary', weight: 2 },
        { name: 'author.name', weight: 1.5 },
        { name: 'llm_info.primary_llm', weight: 1.5 },
        { name: 'tags', weight: 1 },
        { name: 'task_types', weight: 0.8 },
        { name: 'insights.strengths', weight: 0.6 },
        { name: 'insights.weaknesses', weight: 0.6 },
        { name: 'content_markdown', weight: 0.3 },
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
    }),
    [posts]
  );

  return useMemo(() => {
    if (!query.trim()) {
      return posts;
    }

    const results = fuse.search(query);

    return results.map(result => ({
      ...result.item,
      _matches: result.matches,
      _score: result.score,
    }));
  }, [posts, query, fuse]);
}

/**
 * Get unique values for filter options
 */
export function useFilterOptions(posts: Post[]) {
  return useMemo(() => {
    const llms = new Set<string>();
    const llmVariants = new Set<string>();
    const taskTypes = new Set<string>();
    const homeworks = new Set<string>();
    const tags = new Set<string>();

    posts.forEach(post => {
      if (post.llm_info.primary_llm) {
        llms.add(post.llm_info.primary_llm);
      }

      if (post.llm_info.variant) {
        llmVariants.add(post.llm_info.variant);
      }

      post.task_types?.forEach(task => taskTypes.add(task));

      // Normalize homework names to "HW0", "HW1", etc.
      post.homework_coverage?.forEach(hw => {
        const match = hw.match(/\d+/);
        if (match) {
          const num = parseInt(match[0]);
          homeworks.add(`HW${num}`);
        }
      });

      post.tags?.forEach(tag => tags.add(tag));
    });

    return {
      llms: Array.from(llms).sort(),
      llmVariants: Array.from(llmVariants).sort(),
      taskTypes: Array.from(taskTypes).sort(),
      homeworks: Array.from(homeworks).sort((a, b) => {
        // Sort hw1, hw2, ..., hw10 numerically
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA - numB;
      }),
      tags: Array.from(tags).sort(),
    };
  }, [posts]);
}
