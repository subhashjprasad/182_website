#!/usr/bin/env python3
"""
Quick script to update author names from cached raw data.
No need to re-fetch from Ed API.
"""

import json
from pathlib import Path
from fetch_posts import structure_post_data
from utils import load_cache, save_cache, write_json
from config import OUTPUT_DIR, CACHE_DIR


def update_author_names():
    """Update author names in all cached data and final output."""

    print("=" * 60)
    print("Updating author names from cached data")
    print("=" * 60)

    # Load raw threads (which contains users array)
    raw_cache = CACHE_DIR / 'raw_threads.json'

    if not raw_cache.exists():
        print(f"\n✗ Error: {raw_cache} not found")
        print("Run fetch_posts.py first to fetch data from Ed")
        return

    print(f"\nLoading cached raw data from {raw_cache}...")
    raw_posts = load_cache('raw_threads.json')
    print(f"✓ Loaded {len(raw_posts)} posts")

    # Re-structure posts with updated name extraction
    print("\nExtracting author names...")
    structured_posts = []

    for raw_post in raw_posts:
        structured = structure_post_data(raw_post)
        structured_posts.append(structured)

        # Print names being extracted
        author_name = structured['author']['name']
        if author_name != 'Unknown':
            print(f"  ✓ Found name: {author_name}")

    # Save updated structured posts
    save_cache('structured_posts.json', structured_posts)
    print(f"\n✓ Updated {CACHE_DIR / 'structured_posts.json'}")

    # Now update the analyzed posts if they exist
    analyzed_cache = CACHE_DIR / 'analyzed_posts.json'

    if analyzed_cache.exists():
        print(f"\nUpdating analyzed posts...")
        analyzed_posts = load_cache('analyzed_posts.json')

        # Create a mapping of post_id to author name
        name_map = {p['post_id']: p['author']['name'] for p in structured_posts}

        # Update names in analyzed posts
        for post in analyzed_posts:
            post_id = post.get('post_id')
            if post_id in name_map:
                post['author']['name'] = name_map[post_id]

        save_cache('analyzed_posts.json', analyzed_posts)
        print(f"✓ Updated {analyzed_cache}")

        # Update final output
        output_file = OUTPUT_DIR / 'posts.json'
        if output_file.exists():
            write_json(str(output_file), analyzed_posts)
            print(f"✓ Updated {output_file}")

    print("\n" + "=" * 60)
    print("SUCCESS! Author names updated.")
    print("=" * 60)

    # Print summary
    unique_names = set(p['author']['name'] for p in structured_posts)
    known_names = [n for n in unique_names if n != 'Unknown']

    print(f"\nSummary:")
    print(f"  Total posts: {len(structured_posts)}")
    print(f"  Posts with names: {len([p for p in structured_posts if p['author']['name'] != 'Unknown'])}")
    print(f"  Unique authors: {len(known_names)}")

    if known_names:
        print(f"\nAuthors found:")
        for name in sorted(known_names):
            count = len([p for p in structured_posts if p['author']['name'] == name])
            print(f"  - {name}: {count} post(s)")

    print("\n✓ Done! Refresh your website to see the names.")


if __name__ == '__main__':
    update_author_names()
