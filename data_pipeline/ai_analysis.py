"""
AI-powered analysis of Special Participation B posts using GPT-4 or Claude.

This module analyzes each post to extract:
- Executive summary
- Structured categorization (LLM info, task types, homework)
- LLM behavior insights (strengths, weaknesses, hallucinations)
- Code quality assessment
- Tags (15-25 per post)
- Highlight score (0-10)
"""

import json
import os
import time
from typing import Dict, Any, Optional
from openai import OpenAI
from anthropic import Anthropic
from google import genai

from config import (
    OPENAI_API_KEY,
    ANTHROPIC_API_KEY,
    GOOGLE_API_KEY,
    USE_AI_PROVIDER,
    AI_MODEL,
    MAX_RETRIES,
    REQUEST_TIMEOUT,
    TASK_TYPES,
    KNOWN_LLMS
)


class AIAnalyzer:
    """Analyzes posts using GPT-4, Claude, or Gemini."""

    def __init__(self, provider: str = None, model: str = None):
        """
        Initialize the AI analyzer.

        Args:
            provider: 'openai', 'anthropic', or 'google'. Defaults to USE_AI_PROVIDER from config.
            model: Model to use. Defaults to AI_MODEL from config.
        """
        self.provider = provider or USE_AI_PROVIDER
        self.model = model or AI_MODEL

        if self.provider == 'openai':
            if not OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY not set in environment")
            self.client = OpenAI(api_key=OPENAI_API_KEY)
        elif self.provider == 'anthropic':
            if not ANTHROPIC_API_KEY:
                raise ValueError("ANTHROPIC_API_KEY not set in environment")
            self.client = Anthropic(api_key=ANTHROPIC_API_KEY)
        elif self.provider == 'google':
            if not GOOGLE_API_KEY:
                raise ValueError("GOOGLE_API_KEY not set in environment")
            self.client = genai.Client(api_key=GOOGLE_API_KEY)
        else:
            raise ValueError(f"Unknown AI provider: {self.provider}")

    def analyze_post(self, post: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze a single post using AI.

        Args:
            post: Post dict with at least 'content_markdown', 'title', 'code_snippets'

        Returns:
            Dict with analysis results
        """
        # Build the analysis prompt
        prompt = self._build_analysis_prompt(post)

        # Call AI with retries
        for attempt in range(MAX_RETRIES):
            try:
                if self.provider == 'openai':
                    response = self._call_openai(prompt)
                elif self.provider == 'anthropic':
                    response = self._call_anthropic(prompt)
                else:  # google
                    response = self._call_google(prompt)

                # Parse the structured response
                analysis = self._parse_response(response)

                return analysis

            except Exception as e:
                if attempt < MAX_RETRIES - 1:
                    wait_time = (attempt + 1) * 2
                    print(f"  Warning: Analysis failed (attempt {attempt + 1}): {e}")
                    print(f"  Retrying in {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    print(f"  Error: Analysis failed after {MAX_RETRIES} attempts: {e}")
                    # Return minimal analysis on failure
                    return self._get_fallback_analysis(post)

    def _build_analysis_prompt(self, post: Dict[str, Any]) -> str:
        """Build the analysis prompt for GPT-4/Claude."""

        # Extract key information
        title = post.get('title', 'Untitled')
        content = post.get('content_markdown', '')
        code_count = len(post.get('code_snippets', []))
        attachments = post.get('attachments', [])
        links = post.get('external_links', [])

        # Build attachment description
        attachment_desc = []
        for att in attachments:
            attachment_desc.append(f"- {att.get('type', 'file')}: {att.get('filename', 'unknown')}")
        attachment_text = '\n'.join(attachment_desc) if attachment_desc else 'None'

        # Build the prompt
        prompt = f"""You are analyzing a student's submission documenting their interaction with an LLM for coding tasks in a Deep Learning course (CS182/CS282A at UC Berkeley).

POST INFORMATION:
Title: {title}
Content length: {len(content)} characters
Code snippets: {code_count}
External links: {len(links)}

Attachments:
{attachment_text}

POST CONTENT:
{content[:8000]}
{"... (truncated)" if len(content) > 8000 else ""}

ANALYSIS TASK:
Analyze this post thoroughly and provide a structured JSON response with the following fields:

1. **summary** (string): 3-4 sentence executive summary covering:
   - What LLM was tested
   - What coding tasks were attempted
   - Overall success rate and key findings

2. **task_types** (array of strings): List all applicable task types from:
   {json.dumps(TASK_TYPES, indent=2)}
   Only include types that are clearly mentioned or demonstrated.

3. **homework_coverage** (array of strings): Homework assignments mentioned (e.g., ["hw1", "hw3", "hw5"])
   Extract from mentions like "HW3", "homework 2", "assignment 4", etc.

4. **problems_attempted** (array of strings): Specific problems/questions attempted
   Examples: ["hw3-q2", "hw5-problem1", "cnn-implementation"]

5. **insights** (object): LLM behavior analysis with:
   - strengths (array of strings): What the LLM did well
   - weaknesses (array of strings): Where it struggled
   - hallucinations (array of objects): Specific examples
     Each: {{"description": "...", "example": "..." (optional)}}
   - common_mistakes (array of strings): Patterns of errors
   - effective_strategies (array of strings): What prompting techniques worked
   - one_shot_success_rate (number 0-100 or null): Estimated % of tasks that worked on first try
   - iterations_required (number or null): Average iterations to get working solution

6. **code_quality** (object):
   - correctness_rating (number 1-10): How correct was the generated code
   - code_style_rating (number 1-10): Code style and readability
   - pythonic_rating (number 1-10): How pythonic/idiomatic was the code
   - notes (array of strings): Specific observations about code quality

7. **tags** (array of strings): 15-25 relevant tags including:
   - LLM-specific tags (e.g., "gpt-4", "claude-sonnet", "o1-reasoning")
   - Task tags (e.g., "neural-networks", "optimization", "debugging")
   - Quality tags (e.g., "high-quality", "detailed-analysis", "code-examples")
   - Insight tags (e.g., "surprising-failure", "creative-solution", "hallucination-example")
   - Assignment tags (e.g., "hw1", "hw3-q2")

8. **highlight_score** (number 0-10): Overall worthiness score based on:
   - Depth of analysis (0-3 points)
   - Novelty of insights (0-2 points)
   - Quality of documentation (0-2 points)
   - Usefulness for other students (0-2 points)
   - Uniqueness of LLM/task combination (0-1 point)

IMPORTANT:
- Return ONLY valid JSON, no markdown formatting or code blocks
- Be specific and extract actual examples from the content
- If information is not available, use null or empty arrays
- Base ratings on evidence in the post, not assumptions
- Be conservative with highlight_score - most posts should be 5-7

Return the JSON response now:"""

        return prompt

    def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API."""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert analyst of LLM coding interactions in deep learning education. You provide structured, accurate analysis in JSON format."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=2000,
            timeout=REQUEST_TIMEOUT,
            response_format={"type": "json_object"}
        )

        return response.choices[0].message.content

    def _call_anthropic(self, prompt: str) -> str:
        """Call Anthropic Claude API."""
        response = self.client.messages.create(
            model=self.model,
            max_tokens=2000,
            temperature=0.3,
            system="You are an expert analyst of LLM coding interactions in deep learning education. You provide structured, accurate analysis in JSON format.",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response.content[0].text

    def _call_google(self, prompt: str) -> str:
        """Call Google Gemini API."""
        # Add system instruction to the prompt
        full_prompt = """You are an expert analyst of LLM coding interactions in deep learning education. You provide structured, accurate analysis in JSON format.

""" + prompt

        # Use the new genai library
        response = self.client.models.generate_content(
            model=self.model,
            contents=full_prompt
        )

        return response.text

    def _parse_response(self, response: str) -> Dict[str, Any]:
        """Parse the AI response into structured data."""
        # Remove markdown code blocks if present
        response = response.strip()
        if response.startswith('```json'):
            response = response[7:]
        if response.startswith('```'):
            response = response[3:]
        if response.endswith('```'):
            response = response[:-3]
        response = response.strip()

        # Parse JSON
        try:
            data = json.loads(response)
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse AI response as JSON: {e}\nResponse: {response[:500]}")

        # Validate required fields
        required_fields = [
            'summary', 'task_types', 'homework_coverage', 'problems_attempted',
            'insights', 'code_quality', 'tags', 'highlight_score'
        ]

        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field in AI response: {field}")

        # Validate insights structure
        insights = data['insights']
        required_insight_fields = [
            'strengths', 'weaknesses', 'hallucinations', 'common_mistakes',
            'effective_strategies'
        ]
        for field in required_insight_fields:
            if field not in insights:
                insights[field] = []

        # Validate code_quality structure
        code_quality = data['code_quality']
        if 'correctness_rating' not in code_quality:
            code_quality['correctness_rating'] = 5
        if 'code_style_rating' not in code_quality:
            code_quality['code_style_rating'] = 5
        if 'pythonic_rating' not in code_quality:
            code_quality['pythonic_rating'] = 5
        if 'notes' not in code_quality:
            code_quality['notes'] = []

        # Ensure highlight_score is a number
        if not isinstance(data['highlight_score'], (int, float)):
            data['highlight_score'] = 5

        return data

    def _get_fallback_analysis(self, post: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a minimal analysis when AI fails.
        Uses basic heuristics.
        """
        return {
            'summary': f"Analysis of LLM interaction documented in: {post.get('title', 'Untitled')}",
            'task_types': [],
            'homework_coverage': post.get('homework_coverage', []),
            'problems_attempted': [],
            'insights': {
                'strengths': [],
                'weaknesses': [],
                'hallucinations': [],
                'common_mistakes': [],
                'effective_strategies': [],
                'one_shot_success_rate': None,
                'iterations_required': None
            },
            'code_quality': {
                'correctness_rating': 5,
                'code_style_rating': 5,
                'pythonic_rating': 5,
                'notes': ['Analysis unavailable - using fallback']
            },
            'tags': ['unanalyzed'],
            'highlight_score': 3
        }


def analyze_posts_batch(posts: list[Dict[str, Any]],
                       provider: str = None,
                       model: str = None,
                       verbose: bool = True) -> list[Dict[str, Any]]:
    """
    Analyze a batch of posts.

    Args:
        posts: List of post dicts to analyze
        provider: AI provider to use
        model: Model to use
        verbose: Print progress

    Returns:
        List of posts with analysis fields added
    """
    analyzer = AIAnalyzer(provider=provider, model=model)

    analyzed_posts = []

    for i, post in enumerate(posts, 1):
        if verbose:
            print(f"\n[{i}/{len(posts)}] Analyzing: {post.get('title', 'Untitled')[:60]}...")

        analysis = analyzer.analyze_post(post)

        # Merge analysis into post
        analyzed_post = {**post, **analysis}
        analyzed_posts.append(analyzed_post)

        if verbose:
            score = analysis.get('highlight_score', 0)
            tags_count = len(analysis.get('tags', []))
            print(f"  Success: Highlight score: {score}/10, Tags: {tags_count}")

        # Rate limiting - small delay between requests
        if i < len(posts):
            time.sleep(0.5)

    return analyzed_posts


if __name__ == '__main__':
    """Test the analyzer with a sample post."""

    # Sample post for testing
    sample_post = {
        'post_id': 'test_123',
        'title': 'ChatGPT 4 on HW3 Neural Network Implementation',
        'content_markdown': '''
# Testing ChatGPT 4 on HW3

I tested ChatGPT 4 (without o1 reasoning) on the neural network implementation problems from HW3.

## Problems Attempted
- Q2: Implementing the Adam optimizer
- Q3: Building a CNN for CIFAR-10

## Results

### Adam Optimizer (Q2)
The first attempt had a bug in the bias correction. After pointing this out, ChatGPT fixed it correctly.
Success rate: 50% one-shot

### CNN Implementation (Q3)
ChatGPT struggled with the correct dimensions for the convolutional layers. It took 4 iterations to get it right.

## Strengths
- Good at generating boilerplate code
- Excellent documentation and comments
- Understands PyTorch API well

## Weaknesses
- Struggles with tensor dimension calculations
- Sometimes makes off-by-one errors in indexing
- Hallucinated a nonexistent PyTorch function `torch.optimize.adam_correction`

## Code Quality
The final code was correct and well-styled. However, it wasn't very pythonic in some places (used explicit loops instead of vectorization).
        ''',
        'code_snippets': [
            {'language': 'python', 'code': 'def adam_update(...): ...'},
            {'language': 'python', 'code': 'class CNN(nn.Module): ...'}
        ],
        'homework_coverage': ['hw3'],
        'attachments': []
    }

    print("Testing AI Analyzer...")
    print("=" * 60)

    analyzer = AIAnalyzer()
    analysis = analyzer.analyze_post(sample_post)

    print("\nAnalysis Results:")
    print(json.dumps(analysis, indent=2))
