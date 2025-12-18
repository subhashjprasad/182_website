"""
Generate cross-post insights from analyzed posts.

This module performs corpus-level analysis:
- LLM performance profiles
- Task difficulty rankings
- Comparative analysis
- Insight nuggets extraction
- Post similarity detection
"""

import json
from collections import defaultdict, Counter
from typing import Dict, Any, List
import statistics
from openai import OpenAI

from config import OPENAI_API_KEY


class InsightsGenerator:
    """Generate insights from a collection of analyzed posts."""

    def __init__(self, posts: List[Dict[str, Any]]):
        """
        Initialize with analyzed posts.

        Args:
            posts: List of posts with AI analysis completed
        """
        self.posts = posts
        self.openai_client = None

        if OPENAI_API_KEY:
            self.openai_client = OpenAI(api_key=OPENAI_API_KEY)

    def generate_all_insights(self) -> Dict[str, Any]:
        """
        Generate all insights.

        Returns:
            Dict with insights data
        """
        print("\nGenerating cross-post insights...")

        llm_profiles = self.generate_llm_profiles()
        task_difficulty = self.analyze_task_difficulty()
        nuggets = self.extract_insight_nuggets()
        comparative = self.generate_comparative_analysis()

        insights = {
            'llm_profiles': llm_profiles,
            'task_difficulty': task_difficulty,
            'nuggets': nuggets,
            'comparative_analysis': comparative
        }

        print(f"  Success: Generated {len(llm_profiles)} LLM profiles")
        print(f"  Success: Analyzed {len(task_difficulty)} task types")
        print(f"  Success: Extracted {len(nuggets)} insight nuggets")

        return insights

    def generate_llm_profiles(self) -> List[Dict[str, Any]]:
        """Generate performance profile for each LLM."""
        # Group posts by LLM
        llm_posts = defaultdict(list)
        for post in self.posts:
            llm_name = post.get('llm_info', {}).get('primary_llm', 'Unknown')
            llm_posts[llm_name].append(post)

        profiles = []

        for llm_name, posts in llm_posts.items():
            if not posts:
                continue

            # Calculate average success rate
            success_rates = [
                p.get('insights', {}).get('one_shot_success_rate', 50)
                for p in posts
                if p.get('insights', {}).get('one_shot_success_rate') is not None
            ]
            avg_success = statistics.mean(success_rates) if success_rates else None

            # Aggregate strengths and weaknesses
            all_strengths = []
            all_weaknesses = []
            all_failures = []

            for post in posts:
                insights = post.get('insights', {})
                all_strengths.extend(insights.get('strengths', []))
                all_weaknesses.extend(insights.get('weaknesses', []))
                all_failures.extend(insights.get('common_mistakes', []))

            # Find task-specific performance
            task_performance = defaultdict(list)
            for post in posts:
                task_types = post.get('task_types', [])
                success_rate = post.get('insights', {}).get('one_shot_success_rate')
                if success_rate is not None:
                    for task in task_types:
                        task_performance[task].append(success_rate)

            # Identify strengths (high success rate tasks)
            task_strengths = []
            task_weaknesses = []
            for task, rates in task_performance.items():
                avg_rate = statistics.mean(rates)
                if avg_rate >= 70:
                    task_strengths.append(task)
                elif avg_rate <= 40:
                    task_weaknesses.append(task)

            # Extract unique capabilities from strengths
            strength_counter = Counter(all_strengths)
            unique_capabilities = [s for s, count in strength_counter.most_common(5)]

            # Extract common failure modes
            failure_counter = Counter(all_failures + all_weaknesses)
            common_failures = [f for f, count in failure_counter.most_common(5)]

            profile = {
                'llm_name': llm_name,
                'submission_count': len(posts),
                'average_success_rate': round(avg_success, 1) if avg_success else None,
                'task_strengths': task_strengths[:5],
                'task_weaknesses': task_weaknesses[:5],
                'common_failure_modes': common_failures,
                'unique_capabilities': unique_capabilities
            }

            profiles.append(profile)

        # Sort by submission count
        profiles.sort(key=lambda p: p['submission_count'], reverse=True)

        return profiles

    def analyze_task_difficulty(self) -> Dict[str, float]:
        """Analyze difficulty of each task type based on success rates."""
        task_success_rates = defaultdict(list)

        for post in self.posts:
            task_types = post.get('task_types', [])
            success_rate = post.get('insights', {}).get('one_shot_success_rate')

            if success_rate is not None:
                for task in task_types:
                    task_success_rates[task].append(success_rate)

        # Convert to difficulty scores (inverse of success rate)
        task_difficulty = {}
        for task, rates in task_success_rates.items():
            avg_success = statistics.mean(rates)
            difficulty = 100 - avg_success
            task_difficulty[task] = round(difficulty, 1)

        return task_difficulty

    def extract_insight_nuggets(self) -> List[Dict[str, Any]]:
        """Extract quotable, actionable insights from posts."""
        nuggets = []

        # Strategy 1: Extract from high-quality posts
        high_quality_posts = [
            p for p in self.posts
            if p.get('highlight_score', 0) >= 7
        ]

        for post in high_quality_posts[:10]:
            insights = post.get('insights', {})

            # Extract from strengths
            for strength in insights.get('strengths', [])[:2]:
                if len(strength) > 20:
                    nuggets.append({
                        'text': f"{post['llm_info']['primary_llm']}: {strength}",
                        'category': 'strength',
                        'source_posts': [post['post_id']],
                        'confidence': 'high'
                    })

            # Extract from weaknesses
            for weakness in insights.get('weaknesses', [])[:2]:
                if len(weakness) > 20:
                    nuggets.append({
                        'text': f"{post['llm_info']['primary_llm']} struggles with: {weakness}",
                        'category': 'weakness',
                        'source_posts': [post['post_id']],
                        'confidence': 'high'
                    })

            # Extract from effective strategies
            for strategy in insights.get('effective_strategies', [])[:2]:
                if len(strategy) > 20:
                    nuggets.append({
                        'text': f"Effective strategy: {strategy}",
                        'category': 'strategy',
                        'source_posts': [post['post_id']],
                        'confidence': 'medium'
                    })

        # Strategy 2: Aggregate common patterns
        llm_weakness_map = defaultdict(list)
        for post in self.posts:
            llm_name = post.get('llm_info', {}).get('primary_llm', 'Unknown')
            weaknesses = post.get('insights', {}).get('weaknesses', [])
            llm_weakness_map[llm_name].extend(weaknesses)

        for llm_name, weaknesses in llm_weakness_map.items():
            weakness_counter = Counter(weaknesses)
            for weakness, count in weakness_counter.most_common(3):
                if count >= 2:
                    nuggets.append({
                        'text': f"{llm_name} commonly struggles with: {weakness}",
                        'category': 'common-weakness',
                        'source_posts': [],
                        'confidence': 'high' if count >= 3 else 'medium'
                    })

        return nuggets[:50]

    def generate_comparative_analysis(self) -> Dict[str, Any]:
        """Generate comparative analysis between LLMs."""
        llm_comparison = {}

        # Group posts by LLM
        llm_posts = defaultdict(list)
        for post in self.posts:
            llm_name = post.get('llm_info', {}).get('primary_llm', 'Unknown')
            llm_posts[llm_name].append(post)

        # Calculate aggregate metrics for each LLM
        for llm_name, posts in llm_posts.items():
            if not posts:
                continue

            avg_highlight = statistics.mean([p.get('highlight_score', 0) for p in posts])

            # Filter out None values for correctness ratings
            correctness_ratings = [
                p.get('code_quality', {}).get('correctness_rating')
                for p in posts
                if p.get('code_quality', {}).get('correctness_rating') is not None
            ]
            avg_correctness = statistics.mean(correctness_ratings) if correctness_ratings else 5

            success_rates = [
                p.get('insights', {}).get('one_shot_success_rate')
                for p in posts
                if p.get('insights', {}).get('one_shot_success_rate') is not None
            ]
            avg_success = statistics.mean(success_rates) if success_rates else None

            llm_comparison[llm_name] = {
                'post_count': len(posts),
                'avg_highlight_score': round(avg_highlight, 2),
                'avg_code_correctness': round(avg_correctness, 2),
                'avg_success_rate': round(avg_success, 1) if avg_success else None
            }

        return {
            'by_llm': llm_comparison,
            'total_llms': len(llm_comparison),
            'total_posts': len(self.posts)
        }

    def compute_post_similarities(self) -> Dict[str, List[str]]:
        """Compute similar posts for each post using embeddings."""
        if not self.openai_client:
            print("  Warning: Skipping similarity detection (no OpenAI key)")
            return {}

        print("\nComputing post similarities using embeddings...")

        # Generate embeddings for all posts
        embeddings = []
        post_ids = []

        for post in self.posts[:50]:
            # Create text representation for embedding
            text = f"{post['title']} {post.get('summary', '')} "
            text += " ".join(post.get('task_types', []))

            try:
                response = self.openai_client.embeddings.create(
                    model="text-embedding-3-small",
                    input=text[:8000]
                )
                embeddings.append(response.data[0].embedding)
                post_ids.append(post['post_id'])
            except Exception as e:
                print(f"  Warning: Failed to generate embedding: {e}")
                continue

        # Compute cosine similarity
        import numpy as np

        similarities = {}

        for i, post_id in enumerate(post_ids):
            # Compute similarity with all other posts
            emb_i = np.array(embeddings[i])
            sims = []

            for j, other_id in enumerate(post_ids):
                if i == j:
                    continue

                emb_j = np.array(embeddings[j])
                # Cosine similarity
                sim = np.dot(emb_i, emb_j) / (np.linalg.norm(emb_i) * np.linalg.norm(emb_j))
                sims.append((other_id, sim))

            # Sort by similarity and take top 5
            sims.sort(key=lambda x: x[1], reverse=True)
            similarities[post_id] = [s[0] for s in sims[:5]]

        print(f"  Success: Computed similarities for {len(similarities)} posts")

        return similarities


def generate_insights_from_posts(posts: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate insights from a collection of analyzed posts.

    Args:
        posts: List of analyzed posts

    Returns:
        Insights dict
    """
    generator = InsightsGenerator(posts)
    return generator.generate_all_insights()


def compute_similarities_for_posts(posts: List[Dict[str, Any]]) -> Dict[str, List[str]]:
    """
    Compute similar posts using embeddings.

    Args:
        posts: List of posts

    Returns:
        Dict mapping post_id -> list of similar post_ids
    """
    generator = InsightsGenerator(posts)
    return generator.compute_post_similarities()


if __name__ == '__main__':
    """Test insights generation with sample data."""

    sample_posts = [
        {
            'post_id': 'post_1',
            'title': 'ChatGPT 4 on HW3',
            'llm_info': {'primary_llm': 'ChatGPT'},
            'task_types': ['neural-network-architecture', 'optimizer-implementation'],
            'highlight_score': 8,
            'insights': {
                'strengths': ['Good at boilerplate', 'Clear explanations'],
                'weaknesses': ['Tensor dimension errors'],
                'common_mistakes': ['Off-by-one indexing'],
                'effective_strategies': ['Ask for step-by-step reasoning'],
                'one_shot_success_rate': 60
            },
            'code_quality': {
                'correctness_rating': 8,
                'code_style_rating': 7,
                'pythonic_rating': 6
            }
        },
        {
            'post_id': 'post_2',
            'title': 'Claude 3.5 Sonnet on HW4',
            'llm_info': {'primary_llm': 'Claude'},
            'task_types': ['debugging', 'training-loop'],
            'highlight_score': 7,
            'insights': {
                'strengths': ['Excellent debugging', 'Clear error messages'],
                'weaknesses': ['Verbose outputs'],
                'common_mistakes': ['Over-complicated solutions'],
                'effective_strategies': ['Provide error messages'],
                'one_shot_success_rate': 75
            },
            'code_quality': {
                'correctness_rating': 9,
                'code_style_rating': 8,
                'pythonic_rating': 8
            }
        }
    ]

    print("Testing Insights Generator...")
    print("=" * 60)

    insights = generate_insights_from_posts(sample_posts)

    print("\nGenerated Insights:")
    print(json.dumps(insights, indent=2))
