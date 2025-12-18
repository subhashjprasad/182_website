"""Fetch and structure posts from Ed API."""
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
from tqdm import tqdm

import config
from ed_client import EdClient


def save_json(filepath: Path, data: Any) -> None:
    """Save data as JSON with pretty formatting."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def load_json(filepath: Path) -> Any:
    """Load data from JSON file."""
    if not filepath.exists():
        return None
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def fetch_all_participation_posts(
    use_cache: bool = True,
    limit: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Fetch all Special Participation B posts from Ed.
    
    Args:
        use_cache: Whether to use cached data if available
        limit: Optional limit on number of posts to fetch (for testing)
        
    Returns:
        List of structured post dictionaries
    """
    cache_file = config.CACHE_DIR / 'raw_threads.json'
    
    # Check cache first
    if use_cache and cache_file.exists():
        print("Loading threads from cache...")
        cached = load_json(cache_file)
        if cached:
            print(f"✓ Loaded {len(cached)} threads from cache")
            return cached
    
    # Initialize Ed client
    client = EdClient()
    
    # Fetch all threads
    print("\n=== Fetching Threads ===")
    all_threads = client.fetch_all_threads(limit=limit)
    
    # Filter for participation B
    participation_threads = client.filter_participation_b_threads(all_threads)
    
    # Fetch detailed content for each thread
    print("\n=== Fetching Thread Details ===")
    detailed_posts = []
    
    for thread in tqdm(participation_threads, desc="Fetching details"):
        thread_number = thread.get('number')
        if not thread_number:
            continue

        details = client.fetch_thread_details(thread_number)
        if details:
            detailed_posts.append(details)
    
    # Cache the results
    if config.ENABLE_CACHE:
        save_json(cache_file, detailed_posts)
        print(f"\n✓ Cached {len(detailed_posts)} posts to {cache_file}")
    
    return detailed_posts


def structure_post_data(raw_post: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert raw Ed thread data to our structured format.
    
    Args:
        raw_post: Raw thread data from Ed API
        
    Returns:
        Structured post dictionary matching our schema
    """
    # Extract basic metadata
    post_id = str(raw_post.get('id', ''))
    thread_title = raw_post.get('title', 'Untitled')
    content = raw_post.get('content', '')
    user_id = raw_post.get('user_id', '')
    created_at = raw_post.get('created_at', datetime.now().isoformat())

    # Build structured post
    structured = {
        'post_id': f"post_{post_id}",
        'ed_thread_id': post_id,
        'title': thread_title,
        'author': {
            'name': 'Unknown',  # Ed API doesn't return user names in thread list
            'ed_user_id': str(user_id),
            'linkedin': None,  # Will extract from content later
            'website': None,
            'github': None,
        },
        'date': created_at,
        'llm_info': {
            'primary_llm': 'Unknown',  # Will extract from content
            'version': None,
            'variant': None,
            'special_modes': [],
            'assistant_tool': None,
        },
        'content_raw_html': content if isinstance(content, str) else '',
        'content_markdown': '',  # Will convert from HTML
        'summary': '',  # Will generate with AI
        'code_snippets': [],  # Will extract
        'attachments': [],  # Will extract
        'external_links': [],  # Will extract
        'task_types': [],  # Will analyze with AI
        'homework_coverage': [],  # Will analyze
        'problems_attempted': [],  # Will extract
        'insights': {
            'strengths': [],
            'weaknesses': [],
            'hallucinations': [],
            'common_mistakes': [],
            'effective_strategies': [],
            'one_shot_success_rate': None,
            'iterations_required': None,
        },
        'code_quality': {
            'correctness_rating': 0,
            'code_style_rating': 0,
            'pythonic_rating': 0,
            'notes': [],
        },
        'tags': [],  # Will generate with AI
        'highlight_score': 0,  # Will calculate
        'related_posts': [],  # Will compute later
        'raw_ed_data': raw_post,  # Keep for reference
    }
    
    return structured


def main():
    """Main function to fetch and structure posts."""
    print("=" * 60)
    print("CS182 Special Participation B - Data Fetching")
    print("=" * 60)
    
    # Fetch posts
    raw_posts = fetch_all_participation_posts(use_cache=True)
    
    if not raw_posts:
        print("\n⚠ No posts found. Check your Ed API credentials.")
        return
    
    # Structure posts
    print(f"\n=== Structuring {len(raw_posts)} Posts ===")
    structured_posts = []
    
    for raw_post in tqdm(raw_posts, desc="Structuring"):
        structured = structure_post_data(raw_post)
        structured_posts.append(structured)
    
    # Save structured posts
    output_file = config.CACHE_DIR / 'structured_posts.json'
    save_json(output_file, structured_posts)
    
    print(f"\n✓ Saved {len(structured_posts)} structured posts to {output_file}")
    print("\n=== Summary ===")
    print(f"Total posts fetched: {len(structured_posts)}")
    
    if structured_posts:
        print("\nSample post titles:")
        for post in structured_posts[:5]:
            print(f"  • {post['title']}")
    
    print("\n✓ Data fetching complete!")
    print(f"Next step: Run extract_content.py to parse HTML and extract code")


if __name__ == "__main__":
    main()
