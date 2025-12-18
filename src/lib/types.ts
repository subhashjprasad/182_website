/**
 * Core data types for the Special Participation B website
 */

export interface Author {
  name: string;
  ed_user_id: string;
  linkedin?: string;
  website?: string;
  github?: string;
}

export interface LLMInfo {
  primary_llm: string;
  version?: string;
  variant?: string;
  special_modes?: string[];
  assistant_tool?: string;
}

export interface CodeSnippet {
  language: string;
  code: string;
  context?: string;
}

export interface Attachment {
  type: string;
  filename: string;
  local_path: string;
  ed_url?: string;
}

export interface LLMBehaviorInsights {
  strengths: string[];
  weaknesses: string[];
  hallucinations: Array<{
    description: string;
    example?: string;
  }>;
  common_mistakes: string[];
  effective_strategies: string[];
  one_shot_success_rate?: number;
  iterations_required?: number;
}

export interface CodeQualityAssessment {
  correctness_rating: number;
  code_style_rating: number;
  pythonic_rating: number;
  notes: string[];
}

export interface Post {
  post_id: string;
  ed_thread_id: string;
  title: string;
  author: Author;
  date: string;
  llm_info: LLMInfo;
  content_raw_html: string;
  content_markdown: string;
  summary: string;
  code_snippets: CodeSnippet[];
  attachments: Attachment[];
  external_links: string[];
  
  // AI-generated analysis
  task_types: string[];
  homework_coverage: string[];
  problems_attempted: string[];
  insights: LLMBehaviorInsights;
  code_quality: CodeQualityAssessment;
  tags: string[];
  highlight_score: number;
  
  // Computed fields
  related_posts?: string[]; // post_ids
}

export interface LLMProfile {
  llm_name: string;
  submission_count: number;
  average_success_rate: number;
  task_strengths: string[];
  task_weaknesses: string[];
  common_failure_modes: string[];
  unique_capabilities: string[];
}

export interface InsightNugget {
  text: string;
  category: string;
  source_posts: string[];
  upvotes?: number;
}

export interface Insights {
  llm_profiles: LLMProfile[];
  task_difficulty: Record<string, number>;
  nuggets: InsightNugget[];
}

export interface FilterState {
  llms: string[];
  llmVariants: string[];
  assistants: string[];
  taskTypes: string[];
  homeworks: string[];
  minHighlightScore: number;
  minCodeQuality: number;
  minSuccessRate: number;
}
