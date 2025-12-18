"""Test script for data pipeline without requiring Ed API access."""
import json
from pathlib import Path

import config
from fetch_posts import structure_post_data
from extract_content import enrich_post


def create_mock_post():
    """Create a mock Ed post for testing."""
    return {
        'id': '12345',
        'thread': {
            'title': 'ChatGPT 4 on HW3 Coding Problems',
            'created_at': '2024-11-15T10:30:00Z',
        },
        'document': {
            'content': '''
            <h1>Testing ChatGPT 4 on Homework 3</h1>
            <p>I tested ChatGPT 4 on the Adam optimizer implementation from HW3.</p>
            
            <h2>Code Example</h2>
            <pre><code class="language-python">
def adam_optimizer(params, gradients, learning_rate=0.001):
    # Adam optimizer implementation
    m = 0  # first moment
    v = 0  # second moment
    for param, grad in zip(params, gradients):
        m = 0.9 * m + 0.1 * grad
        v = 0.999 * v + 0.001 * grad**2
        param -= learning_rate * m / (np.sqrt(v) + 1e-8)
    return params
            </code></pre>
            
            <h2>Results</h2>
            <p>The LLM got it right on the second try after I clarified the beta parameters.</p>
            
            <p>My GitHub: https://github.com/testuser</p>
            <p>LinkedIn: https://linkedin.com/in/testuser</p>
            
            <a href="https://colab.research.google.com/notebook">Colab Notebook</a>
            ''',
            'attachments': [
                {
                    'name': 'interaction_log.pdf',
                    'url': 'https://ed.example.com/file.pdf',
                }
            ]
        },
        'user': {
            'id': '999',
            'name': 'Test Student',
        }
    }


def test_structure():
    """Test post structuring."""
    print("=== Testing Post Structuring ===")
    mock_post = create_mock_post()
    structured = structure_post_data(mock_post)
    
    print(f"✓ Post ID: {structured['post_id']}")
    print(f"✓ Title: {structured['title']}")
    print(f"✓ Author: {structured['author']['name']}")
    print(f"✓ Has content: {len(structured['content_raw_html'])} chars")
    
    return structured


def test_extraction(structured_post):
    """Test content extraction."""
    print("\n=== Testing Content Extraction ===")
    enriched = enrich_post(structured_post)
    
    print(f"✓ Markdown length: {len(enriched['content_markdown'])} chars")
    print(f"✓ Code snippets found: {len(enriched['code_snippets'])}")
    print(f"✓ External links found: {len(enriched['external_links'])}")
    print(f"✓ Attachments found: {len(enriched['attachments'])}")
    print(f"✓ LLM identified: {enriched['llm_info']['primary_llm']}")
    print(f"✓ Homework coverage: {enriched['homework_coverage']}")
    
    if enriched['code_snippets']:
        print(f"\n✓ First code snippet preview:")
        snippet = enriched['code_snippets'][0]
        print(f"  Language: {snippet['language']}")
        print(f"  Length: {len(snippet['code'])} chars")
    
    if enriched['external_links']:
        print(f"\n✓ External links:")
        for link in enriched['external_links'][:3]:
            print(f"  • {link}")
    
    if enriched['author'].get('github'):
        print(f"\n✓ Author GitHub: {enriched['author']['github']}")
    if enriched['author'].get('linkedin'):
        print(f"✓ Author LinkedIn: {enriched['author']['linkedin']}")
    
    return enriched


def test_save_load():
    """Test caching functionality."""
    print("\n=== Testing Cache Save/Load ===")
    from utils import save_json, load_json
    
    test_data = {'test': 'data', 'number': 123}
    test_file = config.CACHE_DIR / 'test_cache.json'
    
    save_json(test_file, test_data)
    print(f"✓ Saved test data to {test_file}")
    
    loaded = load_json(test_file)
    print(f"✓ Loaded test data: {loaded}")
    
    assert loaded == test_data, "Data mismatch!"
    print("✓ Cache save/load working correctly")
    
    # Clean up
    test_file.unlink()


def main():
    """Run all tests."""
    print("=" * 60)
    print("Data Pipeline Test Suite")
    print("=" * 60)
    print()
    
    try:
        # Test structuring
        structured = test_structure()
        
        # Test extraction
        enriched = test_extraction(structured)
        
        # Test caching
        test_save_load()
        
        print("\n" + "=" * 60)
        print("✓ All tests passed!")
        print("=" * 60)
        print("\nThe pipeline is ready to use with real Ed data.")
        print("Next: Add your Ed API token to .env and run:")
        print("  python ed_client.py")
        
    except Exception as e:
        print(f"\n✗ Test failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
