"""Extract and parse content from Ed posts."""
import re
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup
from tqdm import tqdm
import requests

import config


def load_json(filepath: Path) -> Any:
    """Load data from JSON file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(filepath: Path, data: Any) -> None:
    """Save data as JSON."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def html_to_markdown(html_content: str) -> str:
    """
    Convert HTML content to markdown.
    
    Args:
        html_content: HTML string
        
    Returns:
        Markdown formatted string
    """
    if not html_content:
        return ""
    
    soup = BeautifulSoup(html_content, 'lxml')
    
    # Remove script and style elements
    for script in soup(["script", "style"]):
        script.decompose()
    
    # Get text
    text = soup.get_text()
    
    # Clean up whitespace
    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    text = '\n'.join(chunk for chunk in chunks if chunk)
    
    return text


def extract_code_snippets(html_content: str) -> List[Dict[str, str]]:
    """
    Extract code snippets from HTML.
    
    Args:
        html_content: HTML string
        
    Returns:
        List of code snippet dictionaries
    """
    snippets = []
    soup = BeautifulSoup(html_content, 'lxml')
    
    # Find all code blocks
    code_blocks = soup.find_all(['code', 'pre'])
    
    for block in code_blocks:
        code_text = block.get_text().strip()
        
        # Skip very short snippets (likely inline code)
        if len(code_text) < 20:
            continue
        
        # Try to detect language
        language = 'python'  # Default for CS182
        class_attr = block.get('class', [])
        if class_attr:
            for cls in class_attr:
                if 'language-' in cls:
                    language = cls.replace('language-', '')
                    break
        
        snippets.append({
            'language': language,
            'code': code_text,
            'context': None,  # Could extract surrounding text
        })
    
    return snippets


def extract_links(html_content: str) -> List[str]:
    """
    Extract external links from HTML.
    
    Args:
        html_content: HTML string
        
    Returns:
        List of URLs
    """
    links = []
    soup = BeautifulSoup(html_content, 'lxml')
    
    for a in soup.find_all('a', href=True):
        href = a['href']
        if href.startswith('http'):
            links.append(href)
    
    return list(set(links))  # Remove duplicates


def extract_llm_from_title(title: str) -> Dict[str, Any]:
    """
    Try to extract LLM information from post title.
    
    Args:
        title: Post title
        
    Returns:
        Dictionary with llm_info
    """
    title_lower = title.lower()
    
    llm_info = {
        'primary_llm': 'Unknown',
        'version': None,
        'variant': None,
        'special_modes': [],
        'assistant_tool': None,
    }
    
    # Check for known LLMs
    for llm in config.KNOWN_LLMS:
        if llm.lower() in title_lower:
            llm_info['primary_llm'] = llm
            break
    
    # Check for specific versions
    version_patterns = [
        r'gpt-?4',
        r'gpt-?3\.5',
        r'claude\s*3\.5',
        r'claude\s*3',
        r'gemini\s*pro',
        r'o1',
    ]
    
    for pattern in version_patterns:
        match = re.search(pattern, title_lower)
        if match:
            llm_info['version'] = match.group()
            break
    
    # Check for special modes
    if 'thinking' in title_lower or 'o1' in title_lower:
        llm_info['special_modes'].append('thinking')
    
    if 'cursor' in title_lower:
        llm_info['assistant_tool'] = 'Cursor'
    elif 'copilot' in title_lower:
        llm_info['assistant_tool'] = 'GitHub Copilot'
    
    return llm_info


def extract_homework_info(title: str, content: str) -> List[str]:
    """
    Extract homework assignment information.
    
    Args:
        title: Post title
        content: Post content
        
    Returns:
        List of homework identifiers (e.g., ['hw1', 'hw3'])
    """
    homeworks = []
    text = (title + ' ' + content).lower()
    
    # Look for homework patterns
    hw_patterns = [
        r'hw\s*(\d+)',
        r'homework\s*(\d+)',
        r'assignment\s*(\d+)',
    ]
    
    for pattern in hw_patterns:
        matches = re.finditer(pattern, text)
        for match in matches:
            hw_num = match.group(1)
            hw_id = f'hw{hw_num}'
            if hw_id not in homeworks:
                homeworks.append(hw_id)
    
    return sorted(homeworks)


def extract_attachments(raw_post: Dict[str, Any]) -> List[Dict[str, str]]:
    """
    Extract attachment information from raw Ed post.
    
    Args:
        raw_post: Raw Ed API response
        
    Returns:
        List of attachment dictionaries
    """
    attachments = []

    # Check for attachments - handle both dict and other formats
    document = raw_post.get('document', {})
    if isinstance(document, dict):
        ed_attachments = document.get('attachments', [])
    else:
        # Try getting attachments directly from post
        ed_attachments = raw_post.get('attachments', [])
    
    for att in ed_attachments:
        filename = att.get('name', 'unknown')
        file_ext = Path(filename).suffix.lower()
        
        # Determine type
        if file_ext in ['.pdf']:
            file_type = 'pdf'
        elif file_ext in ['.png', '.jpg', '.jpeg', '.gif']:
            file_type = 'image'
        elif file_ext in ['.py', '.ipynb', '.txt']:
            file_type = 'code'
        else:
            file_type = 'other'
        
        attachments.append({
            'type': file_type,
            'filename': filename,
            'local_path': '',  # Will download later
            'ed_url': att.get('url', ''),
        })
    
    return attachments


def extract_author_links(content: str) -> Dict[str, Optional[str]]:
    """
    Extract author contact links from content.
    
    Args:
        content: Post content
        
    Returns:
        Dictionary with linkedin, website, github URLs
    """
    links = {
        'linkedin': None,
        'website': None,
        'github': None,
    }
    
    # Look for LinkedIn
    linkedin_match = re.search(r'linkedin\.com/[\w\-/]+', content, re.IGNORECASE)
    if linkedin_match:
        links['linkedin'] = f"https://{linkedin_match.group()}"
    
    # Look for GitHub
    github_match = re.search(r'github\.com/[\w\-/]+', content, re.IGNORECASE)
    if github_match:
        links['github'] = f"https://{github_match.group()}"
    
    return links


def enrich_post(post: Dict[str, Any]) -> Dict[str, Any]:
    """
    Enrich a structured post with extracted content.
    
    Args:
        post: Structured post dictionary
        
    Returns:
        Enriched post dictionary
    """
    html_content = post.get('content_raw_html', '')
    raw_ed_data = post.get('raw_ed_data', {})
    
    # Convert HTML to markdown
    post['content_markdown'] = html_to_markdown(html_content)
    
    # Extract code snippets
    post['code_snippets'] = extract_code_snippets(html_content)
    
    # Extract links
    post['external_links'] = extract_links(html_content)
    
    # Extract LLM info from title
    llm_info = extract_llm_from_title(post['title'])
    post['llm_info'].update(llm_info)
    
    # Extract homework info
    post['homework_coverage'] = extract_homework_info(
        post['title'], 
        post['content_markdown']
    )
    
    # Extract attachments
    post['attachments'] = extract_attachments(raw_ed_data)
    
    # Extract author contact info
    author_links = extract_author_links(html_content)
    post['author'].update(author_links)
    
    return post


def main():
    """Main function to extract content from structured posts."""
    print("=" * 60)
    print("CS182 Special Participation B - Content Extraction")
    print("=" * 60)
    
    # Load structured posts
    input_file = config.CACHE_DIR / 'structured_posts.json'
    
    if not input_file.exists():
        print(f"\n✗ Error: {input_file} not found")
        print("Run fetch_posts.py first to fetch data from Ed")
        return
    
    posts = load_json(input_file)
    print(f"\n✓ Loaded {len(posts)} posts from {input_file}")
    
    # Enrich posts
    print(f"\n=== Extracting Content from {len(posts)} Posts ===")
    enriched_posts = []
    
    for post in tqdm(posts, desc="Extracting"):
        enriched = enrich_post(post)
        enriched_posts.append(enriched)
    
    # Save enriched posts
    output_file = config.CACHE_DIR / 'enriched_posts.json'
    save_json(output_file, enriched_posts)
    
    print(f"\n✓ Saved {len(enriched_posts)} enriched posts to {output_file}")
    
    # Print statistics
    print("\n=== Extraction Statistics ===")
    total_code_snippets = sum(len(p['code_snippets']) for p in enriched_posts)
    total_attachments = sum(len(p['attachments']) for p in enriched_posts)
    total_links = sum(len(p['external_links']) for p in enriched_posts)
    
    llms_found = {}
    for post in enriched_posts:
        llm = post['llm_info']['primary_llm']
        llms_found[llm] = llms_found.get(llm, 0) + 1
    
    print(f"Code snippets extracted: {total_code_snippets}")
    print(f"Attachments found: {total_attachments}")
    print(f"External links found: {total_links}")
    print(f"\nLLMs identified:")
    for llm, count in sorted(llms_found.items(), key=lambda x: -x[1]):
        print(f"  • {llm}: {count}")
    
    print("\n✓ Content extraction complete!")
    print("Next step: Run ai_analysis.py to analyze posts with GPT-4/Claude")


if __name__ == "__main__":
    from typing import Any
    main()
