#!/usr/bin/env python3
"""
Fetch user names from Ed API and update posts.
"""

import json
from pathlib import Path
from ed_client import EdClient
from utils import load_cache, save_cache, write_json
from config import OUTPUT_DIR, CACHE_DIR


def fetch_and_update_names():
    """Fetch user names from Ed API and update all posts."""

    print("=" * 60)
    print("Fetching User Names from Ed API")
    print("=" * 60)

    # Load posts to get user IDs
    posts_file = OUTPUT_DIR / 'posts.json'
    if not posts_file.exists():
        print(f"\n✗ Error: {posts_file} not found")
        return

    print(f"\nLoading posts from {posts_file}...")
    with open(posts_file, 'r') as f:
        posts = json.load(f)

    print(f"✓ Loaded {len(posts)} posts")

    # Extract unique user IDs
    user_ids = set()
    for post in posts:
        user_id = post.get('author', {}).get('ed_user_id')
        if user_id:
            user_ids.add(int(user_id))

    print(f"\nFound {len(user_ids)} unique users")

    # Initialize Ed client
    client = EdClient()

    # Fetch all users from Ed API
    print("\nFetching all users from Ed API...")
    try:
        all_users = client.api.list_users(client.course_id)
        print(f"✓ Fetched {len(all_users)} users from Ed")

        # Build user ID to name mapping
        user_names = {}
        for user in all_users:
            user_id = user.get('id')
            name = user.get('name', 'Unknown')
            if user_id:
                user_names[str(user_id)] = name
                if name != 'Unknown':
                    print(f"  ✓ {user_id} -> {name}")

    except Exception as e:
        print(f"  ✗ Error fetching users: {e}")
        user_names = {}

    # Update posts with fetched names
    print(f"\nUpdating {len(posts)} posts with user names...")
    updated_count = 0

    for post in posts:
        user_id = post.get('author', {}).get('ed_user_id')
        if user_id and user_id in user_names:
            old_name = post['author']['name']
            new_name = user_names[user_id]
            if old_name != new_name:
                post['author']['name'] = new_name
                updated_count += 1

    print(f"✓ Updated {updated_count} author names")

    # Save updated posts
    write_json(str(posts_file), posts)
    print(f"\n✓ Saved updated posts to {posts_file}")

    # Also update cached files
    for cache_file in ['analyzed_posts.json', 'structured_posts.json']:
        cache_path = CACHE_DIR / cache_file
        if cache_path.exists():
            cached_posts = load_cache(cache_file)
            for post in cached_posts:
                user_id = post.get('author', {}).get('ed_user_id')
                if user_id and user_id in user_names:
                    post['author']['name'] = user_names[user_id]
            save_cache(cache_file, cached_posts)
            print(f"✓ Updated {cache_path}")

    print("\n" + "=" * 60)
    print("SUCCESS! User names fetched and updated.")
    print("=" * 60)

    # Print summary
    known_names = [n for n in user_names.values() if n != 'Unknown']
    print(f"\nSummary:")
    print(f"  Total users: {len(user_ids)}")
    print(f"  Users with names: {len(known_names)}")
    print(f"  Posts updated: {updated_count}")

    if known_names:
        print(f"\nSample names found:")
        for name in sorted(set(known_names))[:10]:
            count = list(user_names.values()).count(name)
            print(f"  - {name}: {count} post(s)")

    print("\n✓ Done! Refresh your website to see the names.")


if __name__ == '__main__':
    fetch_and_update_names()
