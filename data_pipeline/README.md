# Data Pipeline

This directory contains the Python scripts for fetching, parsing, and analyzing Special Participation B posts from Ed.

## Pipeline Stages

1. **Ed API Client** (`ed_client.py`)
   - Connects to Ed API
   - Fetches threads with rate limiting
   - Filters for participation B posts

2. **Fetch Posts** (`fetch_posts.py`)
   - Downloads all participation B posts
   - Structures raw Ed data
   - Caches results

3. **Extract Content** (`extract_content.py`)
   - Parses HTML to markdown
   - Extracts code snippets
   - Identifies LLMs and homework assignments
   - Extracts links and attachments

4. **AI Analysis** (`ai_analysis.py`) - *Coming in Phase 3*
   - Uses GPT-4/Claude for deep analysis
   - Generates summaries and tags
   - Analyzes LLM behavior patterns

5. **Generate Insights** (`generate_insights.py`) - *Coming in Phase 4*
   - Cross-post analysis
   - LLM performance profiles
   - Task difficulty rankings

6. **Build Dataset** (`build_dataset.py`) - *Coming in Phase 5*
   - Orchestrates full pipeline
   - Outputs final JSON files

## Usage

### Prerequisites

1. Activate virtual environment:
```bash
source ../venv/bin/activate
```

2. Create `.env` file in project root:
```bash
ED_API_TOKEN=your_token_here
COURSE_ID=84647
```

### Running the Pipeline

**Step 1: Test Ed API Connection**
```bash
python ed_client.py
```

**Step 2: Fetch Posts**
```bash
python fetch_posts.py
```

**Step 3: Extract Content**
```bash
python extract_content.py
```

### Cache Management

Cached data is stored in `cache/`:
- `raw_threads.json` - Raw Ed API responses
- `structured_posts.json` - Structured post data
- `enriched_posts.json` - Posts with extracted content
- `analysis_*.json` - AI analysis results (cached by content hash)

To force re-fetch from Ed, delete the cache files.

## Configuration

See `config.py` for all configuration options:
- Ed API settings
- AI provider selection (OpenAI vs Anthropic)
- Cache settings
- Task type taxonomy
- Known LLMs list

## Development

### Adding New Features

1. Keep functions pure and testable
2. Use type hints
3. Add docstrings
4. Handle errors gracefully
5. Use caching to avoid re-work

### Testing

```bash
pytest tests/
```

## Output

Final output files go to `../public/data/`:
- `posts.json` - All posts with full analysis
- `insights.json` - Cross-post insights
- `llm_profiles.json` - LLM behavior profiles
