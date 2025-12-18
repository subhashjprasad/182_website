# CS182 Special Participation B - Blue Team Website

A comprehensive website for curating and analyzing student submissions documenting interactions with LLMs for coding tasks in CS182 Deep Learning.

## Project Structure

```
182_website/
├── data_pipeline/          # Python scripts for data collection and AI analysis
│   ├── ed_client.py       # Ed API wrapper
│   ├── fetch_posts.py     # Download posts from Ed
│   ├── extract_content.py # Parse and extract content
│   ├── ai_analysis.py     # AI-powered analysis
│   └── build_dataset.py   # Main pipeline orchestrator
├── src/                   # React frontend (TypeScript)
│   ├── components/        # UI components
│   ├── pages/            # Route-level pages
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utilities and types
├── public/               # Static assets
│   ├── data/            # Generated JSON datasets
│   └── attachments/     # Downloaded attachments
└── docs/                # Documentation
```

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn
- Ed API token (get from https://edstem.org/us/settings/api-tokens)
- OpenAI API key (for GPT-4 analysis)

### Backend Setup (Python)

1. Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file with your credentials:
```bash
cp .env.example .env
# Edit .env and add your API tokens
```

4. Test the Ed API connection:
```bash
source venv/bin/activate
python data_pipeline/ed_client.py
```

### Frontend Setup (React)

1. Install Node.js dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:5173 in your browser

## Development Workflow

### Running the Data Pipeline

1. Activate Python environment:
```bash
source venv/bin/activate
```

2. Run the full pipeline (when implemented):
```bash
python data_pipeline/build_dataset.py
```

This will:
- Fetch all Special Participation B posts from Ed
- Extract and structure content
- Run AI analysis on each post
- Generate insights and profiles
- Output JSON files to `public/data/`

### Developing the Frontend

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Tech Stack

**Backend:**
- Python 3.9+ with edapi for Ed integration
- OpenAI GPT-4 for AI analysis
- BeautifulSoup4 for HTML parsing
- pandas for data analysis

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- React Router for routing
- React Query for data fetching
- Zustand for state management
- Recharts for visualizations
- Fuse.js for fuzzy search

## Current Status

Phase 1: Foundation ✅
- [x] Project structure initialized
- [x] Python environment configured
- [x] React + Vite + TypeScript setup
- [x] TailwindCSS configured
- [x] Basic Ed API client created
- [x] TypeScript types defined

Next: Phase 2 - Data Pipeline Core

## Contributing

See PLAN.md for the full implementation roadmap.

## Team

Blue Team - Special Participation B

## License

MIT
