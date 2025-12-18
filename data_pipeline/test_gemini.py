#!/usr/bin/env python3
"""
Test Gemini integration

This script verifies that the AIAnalyzer can be initialized with Google/Gemini provider.
"""

import os
import sys

# Set a dummy API key for testing initialization
os.environ['GOOGLE_API_KEY'] = 'test-key-for-initialization'

from ai_analysis import AIAnalyzer


def test_gemini_initialization():
    """Test that AIAnalyzer can be initialized with Google provider."""
    print("\nTesting Gemini Integration")
    print("=" * 60)

    try:
        # Test initialization
        print("\n1. Testing AIAnalyzer initialization with Google provider...")
        analyzer = AIAnalyzer(provider='google', model='gemini-1.5-flash')
        print("   Success: AIAnalyzer initialized with Gemini")

        print(f"   Provider: {analyzer.provider}")
        print(f"   Model: {analyzer.model}")
        print(f"   Client type: {type(analyzer.client).__name__}")

        # Verify the client is a Google genai Client
        assert analyzer.provider == 'google', "Provider should be 'google'"
        assert analyzer.model == 'gemini-1.5-flash', "Model should be 'gemini-1.5-flash'"
        assert 'Client' in type(analyzer.client).__name__, "Client should be a genai.Client"

        print("\n2. Testing fallback analysis structure...")
        # Test the fallback analysis (doesn't require API call)
        sample_post = {
            'post_id': 'test_1',
            'title': 'Test Post',
            'homework_coverage': ['hw3']
        }

        fallback = analyzer._get_fallback_analysis(sample_post)

        print("   Success: Fallback analysis generated")
        print(f"   Summary: {fallback['summary'][:60]}...")
        print(f"   Highlight score: {fallback['highlight_score']}")

        # Verify fallback structure
        required_fields = ['summary', 'task_types', 'homework_coverage', 'insights',
                          'code_quality', 'tags', 'highlight_score']
        for field in required_fields:
            assert field in fallback, f"Missing field: {field}"

        print("\n" + "=" * 60)
        print("SUCCESS: All Gemini integration tests passed!")
        print("=" * 60)
        print("\nGemini is ready to use. To run actual analysis:")
        print("1. Add your GOOGLE_API_KEY to .env")
        print("2. Set USE_AI_PROVIDER=google in .env")
        print("3. Run: python build_dataset.py")
        print("\nAvailable Gemini models:")
        print("  - gemini-1.5-flash (fast, cheaper)")
        print("  - gemini-1.5-pro (more capable)")
        print("=" * 60)

        return True

    except AssertionError as e:
        print(f"\nError: Test failed - {e}")
        return False
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    success = test_gemini_initialization()
    sys.exit(0 if success else 1)
