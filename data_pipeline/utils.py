"""Utility functions for data pipeline."""
import json
import hashlib
from pathlib import Path
from typing import Any, Optional


def save_json(filepath: Path, data: Any) -> None:
    """Save data as JSON with pretty formatting."""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def load_json(filepath: Path) -> Optional[Any]:
    """Load data from JSON file."""
    if not filepath.exists():
        return None
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def get_content_hash(content: str) -> str:
    """
    Generate a hash of content for caching purposes.
    
    Args:
        content: String content to hash
        
    Returns:
        MD5 hash string
    """
    return hashlib.md5(content.encode('utf-8')).hexdigest()


def get_cache_path(cache_key: str, cache_dir: Path) -> Path:
    """
    Get the cache file path for a given key.
    
    Args:
        cache_key: Unique cache identifier
        cache_dir: Cache directory
        
    Returns:
        Path to cache file
    """
    cache_dir.mkdir(parents=True, exist_ok=True)
    return cache_dir / f"{cache_key}.json"


def load_from_cache(cache_key: str, cache_dir: Path) -> Optional[Any]:
    """
    Load data from cache if it exists.
    
    Args:
        cache_key: Cache identifier
        cache_dir: Cache directory
        
    Returns:
        Cached data or None
    """
    cache_path = get_cache_path(cache_key, cache_dir)
    return load_json(cache_path)


def save_to_cache(cache_key: str, data: Any, cache_dir: Path) -> None:
    """
    Save data to cache.
    
    Args:
        cache_key: Cache identifier
        data: Data to cache
        cache_dir: Cache directory
    """
    cache_path = get_cache_path(cache_key, cache_dir)
    save_json(cache_path, data)


def download_file(url: str, save_path: Path) -> bool:
    """
    Download a file from URL.

    Args:
        url: URL to download from
        save_path: Local path to save to

    Returns:
        True if successful, False otherwise
    """
    import requests

    try:
        save_path.parent.mkdir(parents=True, exist_ok=True)

        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()

        with open(save_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False


# Convenience wrappers for build_dataset.py
def save_cache(filename: str, data: Any) -> None:
    """Save data to cache directory."""
    from config import CACHE_DIR
    cache_path = CACHE_DIR / filename
    save_json(cache_path, data)


def load_cache(filename: str) -> Optional[Any]:
    """Load data from cache directory."""
    from config import CACHE_DIR
    cache_path = CACHE_DIR / filename
    return load_json(cache_path)


def write_json(filepath: str, data: Any) -> None:
    """Write data to JSON file (string path version)."""
    save_json(Path(filepath), data)
