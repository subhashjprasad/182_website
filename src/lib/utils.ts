/**
 * Utility functions for the application
 */

import type { Post } from './types';

/** Course ID for CS182 on Ed */
const ED_COURSE_ID = 84647;

/**
 * Generate the Ed discussion URL for a post
 */
export function getEdUrl(post: Post | { ed_thread_id: string }): string {
  return `https://edstem.org/us/courses/${ED_COURSE_ID}/discussion/${post.ed_thread_id}`;
}

/**
 * Get a displayable author name
 * If name is "Unknown", return a pseudonym based on user ID
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
