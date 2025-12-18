# Using Gemini for AI Analysis

Google's Gemini is now fully supported as an alternative to OpenAI GPT-4 and Anthropic Claude!

## Why Use Gemini?

- **Free tier available**: Google provides generous free quotas for Gemini API
- **Fast**: Gemini 1.5 Flash is very fast for analysis tasks
- **Capable**: Gemini 1.5 Pro provides high-quality analysis comparable to GPT-4
- **No credit card required**: Can start using immediately with free tier

## Setup Instructions

### 1. Get a Google API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Get API Key" or "Create API Key"
3. Copy your API key

### 2. Configure Your Environment

Create or edit your `.env` file:

```bash
# Copy the example
cp .env.example .env

# Edit .env and add your keys
```

In `.env`, set:

```bash
# Google API Key
GOOGLE_API_KEY=your_google_api_key_here

# Use Google as the provider
USE_AI_PROVIDER=google

# Choose a model
AI_MODEL=gemini-1.5-flash  # Fast and free
# or
# AI_MODEL=gemini-1.5-pro  # More capable, still free tier available
```

### 3. Run the Pipeline

```bash
cd data_pipeline
source ../venv/bin/activate
python build_dataset.py
```

## Available Gemini Models

### gemini-1.5-flash (Recommended for most users)
- **Speed**: Very fast
- **Cost**: Free tier: 15 RPM (requests per minute), 1 million TPM (tokens per minute)
- **Quality**: Good for most analysis tasks
- **Best for**: Large datasets, quick iterations

### gemini-1.5-pro
- **Speed**: Moderate
- **Cost**: Free tier: 2 RPM, 32,000 TPM
- **Quality**: Excellent, comparable to GPT-4
- **Best for**: High-quality analysis, smaller datasets

## API Quotas (Free Tier)

| Model | Requests/Minute | Tokens/Minute | Requests/Day |
|-------|----------------|---------------|--------------|
| gemini-1.5-flash | 15 | 1,000,000 | 1,500 |
| gemini-1.5-pro | 2 | 32,000 | 50 |

*Note: Free tier quotas as of December 2025. Check [Google AI pricing](https://ai.google.dev/pricing) for current rates.*

## Estimated Costs

### For 25 Posts (typical project)
- **gemini-1.5-flash**: FREE (well within quotas)
- **gemini-1.5-pro**: FREE (well within quotas)
- **Time**: ~2-5 minutes with Flash, ~10-15 minutes with Pro

### For 50 Posts
- **gemini-1.5-flash**: FREE
- **gemini-1.5-pro**: FREE (might need to spread over 2 days or upgrade)
- **Time**: ~5-10 minutes with Flash, ~20-30 minutes with Pro

## Testing Gemini Integration

To verify Gemini is set up correctly:

```bash
cd data_pipeline
source ../venv/bin/activate
python test_gemini.py
```

You should see:
```
SUCCESS: All Gemini integration tests passed!
```

## Troubleshooting

### Error: "GOOGLE_API_KEY not set in environment"

**Solution**: Make sure you've created a `.env` file in the project root with your API key:
```bash
GOOGLE_API_KEY=your_actual_key_here
```

### Error: "Resource has been exhausted (quota)"

**Solution**: You've hit the free tier limit. Either:
1. Wait for the quota to reset (1 minute for RPM, 1 day for daily)
2. Switch to `gemini-1.5-flash` (higher quotas)
3. Upgrade to paid tier

### Slow analysis with Gemini Pro

**Solution**: Gemini Pro is limited to 2 requests/minute on free tier. The pipeline automatically adds delays. Consider using `gemini-1.5-flash` for faster processing.

## Comparison with Other Providers

| Feature | Gemini Flash | Gemini Pro | GPT-4 Turbo | Claude Sonnet |
|---------|--------------|------------|-------------|---------------|
| Free Tier | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| Speed | ⚡ Very Fast | 🚀 Fast | 🚀 Fast | 🚀 Fast |
| Quality | Good | Excellent | Excellent | Excellent |
| Cost (25 posts) | $0 | $0 | ~$1.00 | ~$0.75 |
| JSON Mode | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Manual |

## Recommended Configuration

For most users with limited or no API budget:

```bash
# .env
GOOGLE_API_KEY=your_key_here
USE_AI_PROVIDER=google
AI_MODEL=gemini-1.5-flash
```

This will give you:
- Free analysis for typical datasets
- Fast processing
- Good quality results
- No credit card required

## Next Steps

Once you've set up Gemini:

1. Add your Ed API token to `.env`
2. Run the full pipeline: `python build_dataset.py`
3. The pipeline will analyze all your posts and generate the dataset
4. Proceed to Phase 5 to build the frontend!
