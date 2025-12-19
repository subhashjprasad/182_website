/**
 * Search and filtering hooks using Fuse.js
 */
import { useMemo } from 'react';
import Fuse from 'fuse.js';
import type { Post } from '../lib/types';
import { resolveLLMFromPost, resolveAssistantFromPost } from '../lib/utils';

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
  const EXCLUDED_TASKS = new Set([
    'backpropagation',
    'loss-function',
    'prompt-engineering',
    'training-loop',
  ]);

  const sortWithOtherLast = (items: string[]) =>
    items.sort((a, b) => {
      const aIsOther = a === 'Other';
      const bIsOther = b === 'Other';
      if (aIsOther && !bIsOther) return 1;
      if (bIsOther && !aIsOther) return -1;
      return a.localeCompare(b);
    });

  return useMemo(() => {
    const llms = new Set<string>();
    const llmVariants = new Set<string>();
    const assistants = new Set<string>();
    const taskTypes = new Set<string>();
    const homeworks = new Set<string>();
    const tags = new Set<string>();

    posts.forEach(post => {
      const resolvedLLM = resolveLLMFromPost(post);
      if (resolvedLLM) {
        llms.add(resolvedLLM);
      }

      const resolvedAssistant = resolveAssistantFromPost(post);
      if (resolvedAssistant && resolvedAssistant !== 'Other') {
        assistants.add(resolvedAssistant);
      }

      if (post.llm_info.variant) {
        llmVariants.add(post.llm_info.variant);
      }

      post.task_types
        ?.filter(task => !EXCLUDED_TASKS.has(task.toLowerCase()))
        .forEach(task => taskTypes.add(task));

      // Normalize homework names to "HW0", "HW1", etc.
      post.homework_coverage?.forEach(hw => {
        const match = hw.match(/\d+/);
        if (match) {
          const num = parseInt(match[0]);
          homeworks.add(`HW${num}`);
        }
      });

      post.tags
        ?.filter(tag => {
          const t = tag.toLowerCase();
          return t !== 'unknown' && t !== 'other';
        })
        .forEach(tag => tags.add(tag));
    });

    return {
      llms: sortWithOtherLast(Array.from(llms)),
      llmVariants: Array.from(llmVariants).sort(),
      assistants: Array.from(assistants).sort(),
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
