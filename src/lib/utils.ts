/**
 * Utility functions for the application
 */

import type { Post } from './types';

/** Course ID for CS182 on Ed */
const ED_COURSE_ID = 84647;

/**
 * Canonicalize an LLM name to handle aliases/typos.
 */
const LLM_CANONICAL_MAP: Array<{ needles: string[]; name: string }> = [
  { needles: ['codex', 'gpt-4', 'gpt4', 'chatgpt', 'gpt'], name: 'ChatGPT' },
  { needles: ['claude', 'haiku'], name: 'Claude' },
  { needles: ['deepseek'], name: 'Deepseek' },
  { needles: ['gemini'], name: 'Gemini' },
  { needles: ['grok'], name: 'Grok' },
  { needles: ['kimi'], name: 'Kimi' },
  { needles: ['llama', 'llama3', 'llama 3'], name: 'Llama' },
  { needles: ['mistral'], name: 'Mistral' },
  { needles: ['qwen'], name: 'Qwen' },
];

export function canonicalizeLLMName(name: string): string {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return 'Other';
  for (const { needles, name: canonical } of LLM_CANONICAL_MAP) {
    if (needles.some(n => normalized.includes(n))) {
      return canonical;
    }
  }
  return 'Other';
}

/**
 * Resolve assistant/tool names (e.g., Perplexity, Windsurf, Copilot, Cursor).
 */
export function canonicalizeAssistant(name: string): string {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return 'Other';
  if (normalized.includes('perplexity')) return 'Perplexity';
  if (normalized.includes('windsurf')) return 'Windsurf';
  if (normalized.includes('cursor')) return 'Cursor';
  if (normalized.includes('copilot')) return 'GitHub Copilot';
  return 'Other';
}

export function resolveAssistantFromPost(post: Post): string {
  const fromField = canonicalizeAssistant(post.llm_info.assistant_tool || '');
  if (fromField !== 'Other') return fromField;

  const tags = post.tags?.map(t => t.toLowerCase()).filter(t => t !== 'other' && t !== 'unknown') ?? [];
  const needles: Array<{ needle: string; name: string }> = [
    { needle: 'perplexity', name: 'Perplexity' },
    { needle: 'windsurf', name: 'Windsurf' },
    { needle: 'cursor', name: 'Cursor' },
    { needle: 'copilot', name: 'GitHub Copilot' },
  ];

  for (const { needle, name } of needles) {
    if (tags.some(tag => tag.includes(needle))) {
      return name;
    }
  }

  return 'Other';
}

/**
 * Resolve the display LLM for a post, falling back to tags if primary_llm is unknown.
 */
export function resolveLLMFromPost(post: Post): string {
  const primary = canonicalizeLLMName(post.llm_info.primary_llm || '');
  if (primary !== 'Other') return primary;

  const tags = post.tags?.map(t => t.toLowerCase()) ?? [];
  for (const { needles, name } of LLM_CANONICAL_MAP) {
    const matches = tags.some(tag => needles.some(needle => tag.includes(needle)));
    if (matches) return name;
  }

  return primary;
}

/**
 * Generate the Ed discussion URL for a post
 */
export function getEdUrl(post: Post | { ed_thread_id: string }): string {
  return `https://edstem.org/us/courses/${ED_COURSE_ID}/discussion/${post.ed_thread_id}`;
}

/**
 * Get the author name directly.
 */
export function getAuthorDisplayName(post: Post): string {
  if (post.author.name && post.author.name !== 'Unknown') {
    return post.author.name;
  }

  // Return a pseudonym based on user ID
  const userId = post.author.ed_user_id;
  if (userId) {
    return `Student ${userId.slice(-4)}`; // Use last 4 digits
  }

  return 'Anonymous';
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Format a date string in a human-readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
