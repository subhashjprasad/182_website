"""Configuration for the data pipeline."""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Ed API Configuration
ED_API_TOKEN = os.getenv('ED_API_TOKEN', '')
COURSE_ID = int(os.getenv('COURSE_ID', '84647'))

# AI API Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY', '')
USE_AI_PROVIDER = os.getenv('USE_AI_PROVIDER', 'google')  # 'openai', 'anthropic', or 'google'
AI_MODEL = os.getenv('AI_MODEL', 'gemini-2.5-flash')  # Default to Gemini 2.5 Flash

# Directory Configuration
PROJECT_ROOT = Path(__file__).parent.parent
CACHE_DIR = PROJECT_ROOT / os.getenv('CACHE_DIR', 'data_pipeline/cache')
OUTPUT_DIR = PROJECT_ROOT / os.getenv('OUTPUT_DIR', 'public/data')
ATTACHMENTS_DIR = PROJECT_ROOT / os.getenv('ATTACHMENTS_DIR', 'public/attachments')

# Cache Configuration
ENABLE_CACHE = os.getenv('ENABLE_CACHE', 'true').lower() == 'true'

# Ensure directories exist
CACHE_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
ATTACHMENTS_DIR.mkdir(parents=True, exist_ok=True)

# Search Configuration
PARTICIPATION_B_KEYWORDS = [
    'participation b',
    'special participation b',
    'extra credit b',
]

# AI Analysis Configuration
MAX_RETRIES = 3
REQUEST_TIMEOUT = 60
BATCH_SIZE = 10  # Process posts in batches to avoid rate limits

# Task Type Taxonomy
TASK_TYPES = [
    'neural-network-architecture',
    'optimizer-implementation',
    'data-preprocessing',
    'data-augmentation',
    'training-loop',
    'debugging',
    'tensor-manipulation',
    'backpropagation',
    'loss-function',
    'performance-optimization',
    'bug-fixing',
    'code-refactoring',
    'unit-testing',
    'hyperparameter-tuning',
    'visualization',
]

# LLM Categories
KNOWN_LLMS = [
    'ChatGPT',
    'GPT',
    'Claude',
    'Gemini',
    'Grok',
    'Llama',
    'DeepSeek',
    'Mistral',
    'Qwen',
    'Kimi',
    'Copilot',
    'Cursor',
]
