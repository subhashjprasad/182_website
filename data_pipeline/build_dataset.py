#!/usr/bin/env python3
"""
Build the complete dataset for the Special Participation B website.

This script orchestrates the entire data pipeline:
1. Fetch posts from Ed
2. Extract and structure content
3. AI analysis of each post
4. Generate cross-post insights
5. Compute post similarities
6. Write final JSON outputs
"""

import json
import sys
from pathlib import Path
from typing import List, Dict, Any

from config import OUTPUT_DIR, CACHE_DIR
from utils import save_cache, load_cache, write_json
from fetch_posts import fetch_all_participation_posts, structure_post_data
from extract_content import enrich_post
from ai_analysis import analyze_posts_batch
from generate_insights import generate_insights_from_posts, compute_similarities_for_posts


def main():
    """Run the complete data pipeline."""

    print("\n" + "=" * 70)
    print("Special Participation B - Data Pipeline")
    print("=" * 70)

    # Step 1: Fetch posts from Ed
    print("\nSTEP 1: Fetching posts from Ed API...")
    print("-" * 70)

    raw_posts_cache = CACHE_DIR / 'raw_posts.json'

    if raw_posts_cache.exists():
        print("  INFO: Using cached raw posts")
        raw_posts = load_cache('raw_posts.json')
    else:
        print("  Fetching from Ed API...")
        raw_threads = fetch_all_participation_posts()
        raw_posts = [structure_post_data(post) for post in raw_threads]
        save_cache('raw_posts.json', raw_posts)
        print(f"  SUCCESS: Fetched {len(raw_posts)} posts")

    if not raw_posts:
        print("  WARNING: No posts found. Make sure:")
        print("    1. ED_API_TOKEN is set in .env")
        print("    2. Posts exist with 'Participation B' in the title")
        sys.exit(1)

    print(f"\n  Total posts fetched: {len(raw_posts)}")

    # Step 2: Extract and enrich content
    print("\nSTEP 2: Extracting and enriching content...")
    print("-" * 70)

    structured_posts_cache = CACHE_DIR / 'structured_posts.json'

    if structured_posts_cache.exists():
        print("  INFO: Using cached structured posts")
        structured_posts = load_cache('structured_posts.json')
    else:
        structured_posts = []
        for i, post in enumerate(raw_posts, 1):
            print(f"  [{i}/{len(raw_posts)}] Processing: {post.get('title', 'Untitled')[:50]}...")
            enriched = enrich_post(post)
            structured_posts.append(enriched)

        save_cache('structured_posts.json', structured_posts)
        print(f"  SUCCESS: Processed {len(structured_posts)} posts")

    # Step 3: AI analysis of each post
    print("\nSTEP 3: AI-powered analysis...")
    print("-" * 70)

    analyzed_posts_cache = CACHE_DIR / 'analyzed_posts.json'

    if analyzed_posts_cache.exists():
        print("  INFO: Using cached analyzed posts")
        analyzed_posts = load_cache('analyzed_posts.json')
    else:
        print("  Starting AI analysis (this may take a while)...")
        print("  Using Gemini - FREE for typical datasets!")
        print(f"  Analyzing all {len(structured_posts)} posts...")
        print()

        analyzed_posts = analyze_posts_batch(structured_posts, verbose=True)
        save_cache('analyzed_posts.json', analyzed_posts)

    print(f"\n  SUCCESS: Analyzed {len(analyzed_posts)} posts")

    # Step 4: Generate cross-post insights
    print("\nSTEP 4: Generating cross-post insights...")
    print("-" * 70)

    insights = generate_insights_from_posts(analyzed_posts)

    print(f"\n  Insights summary:")
    print(f"    - LLM profiles: {len(insights['llm_profiles'])}")
    print(f"    - Task difficulty scores: {len(insights['task_difficulty'])}")
    print(f"    - Insight nuggets: {len(insights['nuggets'])}")

    # Step 5: Compute post similarities
    print("\nSTEP 5: Computing post similarities...")
    print("-" * 70)

    similarities_cache = CACHE_DIR / 'similarities.json'

    if similarities_cache.exists():
        print("  INFO: Using cached similarities")
        similarities = load_cache('similarities.json')
    else:
        print("  Computing similarities (uses embeddings API, costs ~$0.01)...")
        print("  Proceeding...")
        similarities = compute_similarities_for_posts(analyzed_posts)
        save_cache('similarities.json', similarities)

    # Add related posts to each post
    for post in analyzed_posts:
        post['related_posts'] = similarities.get(post['post_id'], [])

    # Step 6: Write final outputs
    print("\nSTEP 6: Writing final outputs...")
    print("-" * 70)

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Write posts.json
    posts_output = OUTPUT_DIR / 'posts.json'
    write_json(str(posts_output), analyzed_posts)
    print(f"  SUCCESS: Wrote {posts_output} ({len(analyzed_posts)} posts)")

    # Write insights.json
    insights_output = OUTPUT_DIR / 'insights.json'
    write_json(str(insights_output), insights)
    print(f"  SUCCESS: Wrote {insights_output}")

    # Write llm_profiles.json (for easier frontend access)
    llm_profiles_output = OUTPUT_DIR / 'llm_profiles.json'
    write_json(str(llm_profiles_output), insights['llm_profiles'])
    print(f"  SUCCESS: Wrote {llm_profiles_output}")

    # Generate statistics
    print("\n" + "=" * 70)
    print("PIPELINE COMPLETE - Statistics")
    print("=" * 70)

    total_posts = len(analyzed_posts)
    total_code_snippets = sum(len(p.get('code_snippets', [])) for p in analyzed_posts)
    total_tags = sum(len(p.get('tags', [])) for p in analyzed_posts)
    avg_highlight_score = sum(p.get('highlight_score', 0) for p in analyzed_posts) / total_posts if total_posts else 0
    high_quality_posts = len([p for p in analyzed_posts if p.get('highlight_score', 0) >= 7])

    llm_counts = {}
    for post in analyzed_posts:
        llm = post.get('llm_info', {}).get('primary_llm', 'Unknown')
        llm_counts[llm] = llm_counts.get(llm, 0) + 1

    print(f"\nDataset Statistics:")
    print(f"  Total posts: {total_posts}")
    print(f"  Total code snippets: {total_code_snippets}")
    print(f"  Total tags: {total_tags}")
    print(f"  Average highlight score: {avg_highlight_score:.2f}/10")
    print(f"  High-quality posts (7+): {high_quality_posts}")

    print(f"\nLLMs covered:")
    for llm, count in sorted(llm_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {llm}: {count} posts")

    print(f"\nTask types covered:")
    task_counts = {}
    for post in analyzed_posts:
        for task in post.get('task_types', []):
            task_counts[task] = task_counts.get(task, 0) + 1

    for task, count in sorted(task_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  {task}: {count} posts")

    print("\n" + "=" * 70)
    print("SUCCESS: All done! Data ready for frontend.")
    print("=" * 70)
    print(f"\nOutput files:")
    print(f"  - {posts_output}")
    print(f"  - {insights_output}")
    print(f"  - {llm_profiles_output}")
    print()


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nWARNING: Pipeline interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nERROR: Pipeline failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
