/**
 * Data fetching hooks using React Query
 */
import { useQuery } from '@tanstack/react-query';
import type { Post, Insights, LLMProfile } from '../lib/types';

/**
 * Fetch all posts from the data pipeline output
 */
export function usePostsData() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await fetch('/data/posts.json');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      return response.json() as Promise<Post[]>;
    },
    staleTime: Infinity, // Static data from pipeline, never refetch
    gcTime: Infinity, // Keep in cache indefinitely
  });
}

/**
 * Fetch a single post by ID
 */
export function usePost(postId: string | undefined) {
  const { data: posts, ...queryState } = usePostsData();

  const post = posts?.find(p => p.post_id === postId);

  return {
    data: post,
    ...queryState,
  };
}

/**
 * Fetch insights data (LLM profiles, task difficulty, nuggets)
 */
export function useInsightsData() {
  return useQuery({
    queryKey: ['insights'],
    queryFn: async () => {
      const response = await fetch('/data/insights.json');
      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }
      return response.json() as Promise<Insights>;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/**
 * Fetch LLM profiles directly
 */
export function useLLMProfiles() {
  return useQuery({
    queryKey: ['llm-profiles'],
    queryFn: async () => {
      const response = await fetch('/data/llm_profiles.json');
      if (!response.ok) {
        throw new Error('Failed to fetch LLM profiles');
      }
      return response.json() as Promise<LLMProfile[]>;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
