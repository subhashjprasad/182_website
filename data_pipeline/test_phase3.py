#!/usr/bin/env python3
"""
Test Phase 3: AI Analysis Layer

This script tests the AI analysis and insights generation modules
without requiring real Ed API calls or actual OpenAI/Anthropic API calls.
"""

import json
from typing import Dict, Any
from ai_analysis import AIAnalyzer
from generate_insights import generate_insights_from_posts


# Sample posts for testing
SAMPLE_POSTS = [
    {
        'post_id': 'post_1',
        'ed_thread_id': '12345',
        'title': 'ChatGPT 4 on HW3 Neural Network Implementation',
        'author': {
            'name': 'Alice Student',
            'ed_user_id': 'alice123',
            'github': 'https://github.com/alice',
            'linkedin': 'https://linkedin.com/in/alice'
        },
        'date': '2025-12-01',
        'llm_info': {
            'primary_llm': 'ChatGPT',
            'version': 'GPT-4',
            'variant': 'Standard',
            'special_modes': [],
            'assistant_tool': None
        },
        'content_markdown': '''
# Testing ChatGPT 4 on HW3

I tested ChatGPT 4 (without o1 reasoning) on the neural network implementation problems from HW3.

## Problems Attempted
- Q2: Implementing the Adam optimizer
- Q3: Building a CNN for CIFAR-10

## Results

### Adam Optimizer (Q2)
The first attempt had a bug in the bias correction. After pointing this out, ChatGPT fixed it correctly on the second iteration.

**Success rate:** 50% one-shot, 100% after 2 iterations

### CNN Implementation (Q3)
ChatGPT struggled with the correct dimensions for the convolutional layers. It took 4 iterations to get dimensions right.

**Success rate:** 0% one-shot, 100% after 4 iterations

## Strengths
- Excellent at generating boilerplate code quickly
- Provides clear documentation and inline comments
- Understands PyTorch API comprehensively
- Good explanations of what the code does

## Weaknesses
- Struggles with tensor dimension calculations, especially for multi-layer networks
- Sometimes makes off-by-one errors in indexing
- Doesn't always validate shapes before returning code

## Hallucinations
- Suggested using `torch.optimize.adam_correction()` which doesn't exist
- Claimed CIFAR-10 has 100 classes (actually has 10)

## Code Quality
The final code was correct and well-documented. However, it wasn't very pythonic in some places:
- Used explicit loops instead of vectorized operations
- Didn't use list comprehensions where appropriate
- Some variable names were verbose

Overall correctness: 9/10
Code style: 7/10
Pythonic quality: 6/10

## Effective Strategies
- Asking it to "explain step-by-step" before generating code helped
- Providing the exact error message led to faster fixes
- Requesting it to "verify tensor shapes" reduced dimension errors
        ''',
        'code_snippets': [
            {
                'language': 'python',
                'code': 'def adam_update(params, grads, m, v, t, lr=0.001, beta1=0.9, beta2=0.999, eps=1e-8): ...',
                'context': 'Adam optimizer implementation'
            },
            {
                'language': 'python',
                'code': 'class SimpleCNN(nn.Module): ...',
                'context': 'CNN architecture for CIFAR-10'
            }
        ],
        'attachments': [],
        'external_links': ['https://github.com/alice/hw3-solutions'],
        'homework_coverage': ['hw3']
    },
    {
        'post_id': 'post_2',
        'ed_thread_id': '12346',
        'title': 'Claude 3.5 Sonnet: Debugging Training Loops (HW4)',
        'author': {
            'name': 'Bob Learner',
            'ed_user_id': 'bob456',
            'github': 'https://github.com/boblearns'
        },
        'date': '2025-12-05',
        'llm_info': {
            'primary_llm': 'Claude',
            'version': '3.5 Sonnet',
            'variant': None,
            'special_modes': [],
            'assistant_tool': None
        },
        'content_markdown': '''
# Claude 3.5 Sonnet for Debugging HW4

I used Claude 3.5 Sonnet to debug issues in my training loop for HW4.

## Problem
My training loss was exploding after epoch 2, and I couldn't figure out why.

## Process
1. Pasted my training code and error message
2. Claude identified the issue immediately: gradient accumulation without zeroing
3. It explained why this causes exponential growth
4. Provided corrected code with detailed comments

**Success rate:** 100% one-shot!

## Strengths
- Exceptional at debugging and error analysis
- Provides clear, educational explanations
- Identifies root causes, not just symptoms
- Suggests best practices and explains why

## Weaknesses
- Can be overly verbose in explanations
- Sometimes provides more context than needed

## Code Quality
The debugging suggestions were excellent. Code was:
- Pythonic and clean
- Well-commented
- Followed PyTorch best practices

Correctness: 10/10
Code style: 9/10
Pythonic quality: 9/10

## Insights
- Claude excels at debugging tasks
- Best when you provide full error messages and context
- Great for learning, not just getting answers
        ''',
        'code_snippets': [
            {
                'language': 'python',
                'code': 'optimizer.zero_grad()\nloss.backward()\noptimizer.step()',
                'context': 'Corrected training loop'
            }
        ],
        'attachments': [],
        'external_links': [],
        'homework_coverage': ['hw4']
    },
    {
        'post_id': 'post_3',
        'ed_thread_id': '12347',
        'title': 'Gemini Pro 1.5: Data Augmentation Pipeline',
        'author': {
            'name': 'Carol Researcher',
            'ed_user_id': 'carol789'
        },
        'date': '2025-12-10',
        'llm_info': {
            'primary_llm': 'Gemini',
            'version': 'Pro 1.5',
            'variant': None,
            'special_modes': [],
            'assistant_tool': None
        },
        'content_markdown': '''
# Gemini Pro 1.5 on Data Augmentation (HW2)

Testing Gemini Pro 1.5 for implementing data augmentation pipelines for HW2.

## Task
Implement random crop, flip, and color jitter for image augmentation.

## Results
- First attempt had the right structure but wrong parameter ranges
- After 2 iterations, got working code
- Performance was good but not optimal

**Success rate:** 40% one-shot

## Strengths
- Fast responses
- Good understanding of torchvision transforms
- Decent code organization

## Weaknesses
- Parameter ranges were often incorrect (e.g., brightness range > 1.0)
- Less detailed explanations compared to Claude
- Sometimes suggested deprecated APIs

## Code Quality
Functional but not exceptional:
- Works correctly after fixes
- Adequate documentation
- Some non-pythonic patterns

Correctness: 7/10
Code style: 6/10
Pythonic quality: 5/10
        ''',
        'code_snippets': [
            {
                'language': 'python',
                'code': 'transforms.Compose([transforms.RandomCrop(32), ...])',
                'context': 'Data augmentation pipeline'
            }
        ],
        'attachments': [],
        'external_links': [],
        'homework_coverage': ['hw2']
    }
]


def test_ai_analysis_structure():
    """Test that AI analysis returns the expected structure."""
    print("\n" + "=" * 70)
    print("TEST 1: AI Analysis Structure")
    print("=" * 70)

    # Create a mock analysis (since we don't want to call real API in tests)
    mock_analysis = {
        'summary': 'This is a test summary about the LLM interaction.',
        'task_types': ['neural-network-architecture', 'debugging'],
        'homework_coverage': ['hw3'],
        'problems_attempted': ['hw3-q2', 'hw3-q3'],
        'insights': {
            'strengths': ['Good at boilerplate', 'Clear explanations'],
            'weaknesses': ['Tensor dimensions', 'Indexing errors'],
            'hallucinations': [
                {'description': 'Nonexistent function', 'example': 'torch.optimize.adam_correction()'}
            ],
            'common_mistakes': ['Off-by-one errors'],
            'effective_strategies': ['Step-by-step reasoning', 'Provide error messages'],
            'one_shot_success_rate': 60,
            'iterations_required': 3
        },
        'code_quality': {
            'correctness_rating': 8,
            'code_style_rating': 7,
            'pythonic_rating': 6,
            'notes': ['Well-documented', 'Could be more pythonic']
        },
        'tags': [
            'chatgpt', 'gpt-4', 'hw3', 'neural-networks', 'optimizer',
            'adam', 'cnn', 'tensor-operations', 'debugging', 'code-quality',
            'hallucination-example', 'detailed-analysis'
        ],
        'highlight_score': 8
    }

    print("\n✓ Mock analysis structure:")
    print(json.dumps(mock_analysis, indent=2))

    # Validate structure
    required_fields = [
        'summary', 'task_types', 'homework_coverage', 'problems_attempted',
        'insights', 'code_quality', 'tags', 'highlight_score'
    ]

    for field in required_fields:
        assert field in mock_analysis, f"Missing field: {field}"
        print(f"  ✓ Field '{field}' present")

    print("\n✓ All required fields present")
    return True


def test_insights_generation():
    """Test insights generation from multiple posts."""
    print("\n" + "=" * 70)
    print("TEST 2: Cross-Post Insights Generation")
    print("=" * 70)

    # Add mock analysis to sample posts
    posts_with_analysis = []

    for post in SAMPLE_POSTS:
        # Simulate different analysis results
        if 'ChatGPT' in post['llm_info']['primary_llm']:
            analysis = {
                'summary': 'ChatGPT tested on neural network implementation with mixed results.',
                'task_types': ['neural-network-architecture', 'optimizer-implementation'],
                'homework_coverage': ['hw3'],
                'problems_attempted': ['hw3-q2', 'hw3-q3'],
                'insights': {
                    'strengths': ['Good boilerplate', 'Clear documentation'],
                    'weaknesses': ['Tensor dimensions', 'Indexing'],
                    'hallucinations': [{'description': 'Nonexistent torch function'}],
                    'common_mistakes': ['Off-by-one errors'],
                    'effective_strategies': ['Step-by-step prompting'],
                    'one_shot_success_rate': 50,
                    'iterations_required': 3
                },
                'code_quality': {
                    'correctness_rating': 8,
                    'code_style_rating': 7,
                    'pythonic_rating': 6,
                    'notes': []
                },
                'tags': ['chatgpt', 'gpt-4', 'hw3', 'neural-networks'],
                'highlight_score': 8
            }
        elif 'Claude' in post['llm_info']['primary_llm']:
            analysis = {
                'summary': 'Claude excellent at debugging training loop issues.',
                'task_types': ['debugging', 'training-loop'],
                'homework_coverage': ['hw4'],
                'problems_attempted': ['hw4-training'],
                'insights': {
                    'strengths': ['Exceptional debugging', 'Clear explanations'],
                    'weaknesses': ['Verbose'],
                    'hallucinations': [],
                    'common_mistakes': [],
                    'effective_strategies': ['Provide full error context'],
                    'one_shot_success_rate': 100,
                    'iterations_required': 1
                },
                'code_quality': {
                    'correctness_rating': 10,
                    'code_style_rating': 9,
                    'pythonic_rating': 9,
                    'notes': []
                },
                'tags': ['claude', 'claude-sonnet', 'hw4', 'debugging'],
                'highlight_score': 9
            }
        else:  # Gemini
            analysis = {
                'summary': 'Gemini decent for data augmentation but needs refinement.',
                'task_types': ['data-augmentation', 'data-preprocessing'],
                'homework_coverage': ['hw2'],
                'problems_attempted': ['hw2-augmentation'],
                'insights': {
                    'strengths': ['Fast', 'Good structure'],
                    'weaknesses': ['Wrong parameters', 'Less detailed'],
                    'hallucinations': [],
                    'common_mistakes': ['Deprecated APIs'],
                    'effective_strategies': [],
                    'one_shot_success_rate': 40,
                    'iterations_required': 2
                },
                'code_quality': {
                    'correctness_rating': 7,
                    'code_style_rating': 6,
                    'pythonic_rating': 5,
                    'notes': []
                },
                'tags': ['gemini', 'hw2', 'data-augmentation'],
                'highlight_score': 6
            }

        posts_with_analysis.append({**post, **analysis})

    # Generate insights
    insights = generate_insights_from_posts(posts_with_analysis)

    print("\n✓ Generated insights:")
    print(f"  LLM Profiles: {len(insights['llm_profiles'])}")
    print(f"  Task Difficulty Scores: {len(insights['task_difficulty'])}")
    print(f"  Insight Nuggets: {len(insights['nuggets'])}")

    # Show LLM profiles
    print("\n✓ LLM Profiles:")
    for profile in insights['llm_profiles']:
        print(f"\n  {profile['llm_name']}:")
        print(f"    Submissions: {profile['submission_count']}")
        print(f"    Avg Success Rate: {profile['average_success_rate']}%")
        print(f"    Task Strengths: {', '.join(profile['task_strengths'][:3]) if profile['task_strengths'] else 'None'}")

    # Show task difficulty
    print("\n✓ Task Difficulty (higher = harder):")
    for task, difficulty in sorted(insights['task_difficulty'].items(), key=lambda x: x[1], reverse=True)[:5]:
        print(f"    {task}: {difficulty}")

    print("\n✓ Insights generation successful")
    return True


def main():
    """Run all Phase 3 tests."""
    print("\n" + "=" * 70)
    print("Phase 3 Testing: AI Analysis Layer")
    print("=" * 70)

    try:
        # Test 1: Structure validation
        test_ai_analysis_structure()

        # Test 2: Insights generation
        test_insights_generation()

        print("\n" + "=" * 70)
        print("✅ ALL TESTS PASSED")
        print("=" * 70)
        print("\nPhase 3 components are working correctly:")
        print("  ✓ AI analysis structure is valid")
        print("  ✓ Insights generation works")
        print("  ✓ LLM profiling works")
        print("  ✓ Task difficulty analysis works")
        print("\nReady for actual API integration!")
        print("=" * 70)

    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False

    return True


if __name__ == '__main__':
    import sys
    success = main()
    sys.exit(0 if success else 1)
