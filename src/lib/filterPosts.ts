/**
 * Post filtering and sorting utilities
 */
import type { Post, FilterState } from './types';
import { resolveLLMFromPost, resolveAssistantFromPost } from './utils';

export type SortOption =
  | 'relevance'
  | 'date-desc'
  | 'date-asc'
  | 'highlight-desc'
  | 'name-asc'
  | 'llm-asc';

/**
 * Normalize homework name to "HW0", "HW1", etc.
 */
function normalizeHomework(hw: string): string {
  const match = hw.match(/\d+/);
  if (match) {
    const num = parseInt(match[0]);
    return `HW${num}`;
  }
  return hw;
}

/**
 * Filter posts based on filter state
 */
export function filterPosts(posts: Post[], filters: FilterState): Post[] {
  return posts.filter(post => {
    const primaryLLM = resolveLLMFromPost(post);
    const assistant = resolveAssistantFromPost(post);

    // LLM filter
    if (filters.llms.length > 0) {
      if (!filters.llms.includes(primaryLLM)) {
        return false;
      }
    }

    // Assistant/tool filter
    if (filters.assistants.length > 0) {
      if (!filters.assistants.includes(assistant)) {
        return false;
      }
    }

    // LLM variant filter
    if (filters.llmVariants.length > 0) {
      const variant = post.llm_info.variant || '';
      if (!filters.llmVariants.includes(variant)) {
        return false;
      }
    }

    // Task type filter (post must have at least one matching task)
    if (filters.taskTypes.length > 0) {
      const EXCLUDED_TASKS = new Set([
        'backpropagation',
        'loss-function',
        'prompt-engineering',
        'training-loop',
      ]);
      const hasMatchingTask = post.task_types?.some(task =>
        !EXCLUDED_TASKS.has(task.toLowerCase()) && filters.taskTypes.includes(task)
      );
      if (!hasMatchingTask) {
        return false;
      }
    }

    // Homework filter (post must have at least one matching homework)
    if (filters.homeworks.length > 0) {
      const normalizedPostHW = post.homework_coverage?.map(normalizeHomework) || [];
      const hasMatchingHW = normalizedPostHW.some(hw =>
        filters.homeworks.includes(hw)
      );
      if (!hasMatchingHW) {
        return false;
      }
    }

    // Highlight score filter
    if (filters.minHighlightScore > 0) {
      if ((post.highlight_score || 0) < filters.minHighlightScore) {
        return false;
      }
    }

    // Code quality filter
    if (filters.minCodeQuality > 0) {
      const avgQuality = (
        (post.code_quality?.correctness_rating || 0) +
        (post.code_quality?.code_style_rating || 0) +
        (post.code_quality?.pythonic_rating || 0)
      ) / 3;

      if (avgQuality < filters.minCodeQuality) {
        return false;
      }
    }

    // Success rate filter
    if (filters.minSuccessRate > 0) {
      const successRate = post.insights?.one_shot_success_rate || 0;
      if (successRate < filters.minSuccessRate) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort posts based on sort option
 */
export function sortPosts(posts: Post[], sortBy: SortOption, hasSearchQuery: boolean = false): Post[] {
  const sorted = [...posts];

  switch (sortBy) {
    case 'relevance':
      // If there's a search query, keep relevance order from Fuse.js
      // Otherwise fall back to highlight score
      if (!hasSearchQuery) {
        sorted.sort((a, b) => (b.highlight_score || 0) - (a.highlight_score || 0));
      }
      break;

    case 'date-desc':
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      break;

    case 'date-asc':
      sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      break;

    case 'highlight-desc':
      sorted.sort((a, b) => (b.highlight_score || 0) - (a.highlight_score || 0));
      break;

    case 'name-asc':
      sorted.sort((a, b) => a.author.name.localeCompare(b.author.name));
      break;

    case 'llm-asc':
      sorted.sort((a, b) => resolveLLMFromPost(a).localeCompare(resolveLLMFromPost(b)));
      break;
  }

  return sorted;
}

/**
 * Get posts that are related to a given post
 */
export function getRelatedPosts(post: Post, allPosts: Post[], limit: number = 5): Post[] {
  // If the post has pre-computed related posts, use those
  if (post.related_posts && post.related_posts.length > 0) {
    return post.related_posts
      .map(postId => allPosts.find(p => p.post_id === postId))
      .filter((p): p is Post => p !== undefined)
      .slice(0, limit);
  }

  // Otherwise, compute basic similarity on the fly
  const otherPosts = allPosts.filter(p => p.post_id !== post.post_id);

  const scored = otherPosts.map(other => {
    let score = 0;

    // Same LLM: +5
    if (other.llm_info.primary_llm === post.llm_info.primary_llm) {
      score += 5;
    }

    // Same author: +3
    if (other.author.ed_user_id === post.author.ed_user_id) {
      score += 3;
    }

    // Overlapping task types: +1 per overlap
    const taskOverlap = post.task_types?.filter(task =>
      other.task_types?.includes(task)
    ).length || 0;
    score += taskOverlap;

    // Same homework: +2
    const hwOverlap = post.homework_coverage?.filter(hw =>
      other.homework_coverage?.includes(hw)
    ).length || 0;
    score += hwOverlap * 2;

    // Tag overlap: +0.5 per tag
    const tagOverlap = post.tags?.filter(tag =>
      other.tags?.includes(tag)
    ).length || 0;
    score += tagOverlap * 0.5;

    return { post: other, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.post);
}
