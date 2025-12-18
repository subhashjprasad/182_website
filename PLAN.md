# Implementation Plan: Special Participation B Blue Team Website

## Executive Summary

This plan outlines the development of a premium Blue Team website for Special Participation B that significantly exceeds the Red Team baseline. Our goal is to achieve the full 10 points by creating a feature-rich, intelligent platform that makes LLM coding interaction submissions truly valuable for students and staff.

### Core Differentiation from Red Team B

The Red Team B submission (analyzed from https://github.com/ElShroomster/182-extra-credit) provides:
- Basic Ed API data extraction
- AI-generated summaries and tags using Gemini
- Simple filtering by keyword, tag, and student
- Static site with client-side search
- Basic detail views

**Our Blue Team will exceed this baseline by:**
1. **Advanced Analysis Layer**: Deep LLM behavior analytics with pattern detection across submissions
2. **Interactive Learning Tools**: Not just display, but tools to help students learn from the patterns
3. **Superior UX**: Drawing from Blue Team E's excellent features (playlist view, quick view, saved posts)
4. **Multi-dimensional Organization**: By LLM, by coding task type, by effectiveness, by insights
5. **Comparative Analysis**: Side-by-side LLM comparisons, effectiveness metrics, common pitfalls
6. **Staff Tools**: Analytics dashboard for research insights about LLM coding capabilities

## Project Architecture

### Technology Stack

**Backend (Python)**
- Python 3.11+ for data pipeline
- `edapi` or `edstem` library for Ed API access (more stable than edpy based on research)
- OpenAI API (GPT-4) or Anthropic API (Claude) for higher-quality analysis than Gemini
- `beautifulsoup4` for HTML parsing from Ed posts
- `pandas` for data analysis and insight generation
- `pytest` for testing data pipeline

**Frontend (Modern Web Stack)**
- **React 18+** with TypeScript for type safety and component architecture
- **Vite** for fast development and optimized builds
- **TailwindCSS** for responsive, modern UI (following Blue Team E's clean aesthetic)
- **shadcn/ui** or **Radix UI** for accessible, high-quality components
- **React Query** for efficient data fetching and caching
- **Recharts** or **Victory** for data visualization
- **Fuse.js** for advanced fuzzy search
- **React Router** for client-side routing and deep linking
- **Zustand** or **Jotai** for lightweight state management (saved posts, filters)

**Infrastructure**
- Static site generation for GitHub Pages or eecs182.org deployment
- Pre-computed analytics and insights for instant loading
- Progressive enhancement: core content works without JavaScript

### Project Structure

```
182_website/
├── data_pipeline/           # Python scripts for data collection and analysis
│   ├── __init__.py
│   ├── ed_client.py        # Ed API wrapper and authentication
│   ├── fetch_posts.py      # Download all Special Participation B posts
│   ├── extract_content.py  # Parse Ed HTML, extract code snippets, images
│   ├── ai_analysis.py      # LLM-powered analysis and categorization
│   ├── generate_insights.py # Cross-post pattern analysis
│   ├── build_dataset.py    # Orchestrate full pipeline
│   └── config.py           # Configuration and credentials
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   │   ├── layout/        # Header, Footer, Navigation
│   │   ├── directory/     # Post listings, filters, search
│   │   ├── post/          # Post detail view, quick view
│   │   ├── analytics/     # Charts, insights, comparisons
│   │   └── ui/            # Base UI components (buttons, cards, etc.)
│   ├── pages/             # Route-level components
│   │   ├── DirectoryPage.tsx
│   │   ├── PostDetailPage.tsx
│   │   ├── InsightsPage.tsx
│   │   ├── ComparisonPage.tsx
│   │   ├── PlaylistPage.tsx
│   │   └── SavedPage.tsx
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities, constants, types
│   ├── store/             # State management (saved posts, preferences)
│   └── App.tsx            # Root component and routing
├── public/                # Static assets and generated data
│   ├── data/
│   │   ├── posts.json     # All post data with metadata
│   │   ├── insights.json  # Cross-post analytics
│   │   ├── llm_profiles.json # LLM behavior profiles
│   │   └── taxonomy.json  # Categorization hierarchies
│   └── attachments/       # Downloaded Ed attachments (PDFs, images)
├── tests/                 # Python tests for data pipeline
├── docs/                  # Documentation
├── scripts/               # Build and deployment scripts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Data Pipeline: Collection & Analysis

### Phase 1: Data Collection

**1.1 Ed API Integration** (`ed_client.py`, `fetch_posts.py`)
- Authenticate with Ed API using token from environment variables
- Fetch all course threads, filter for "Special Participation B" or "participation b" in title
- For each thread:
  - Extract thread metadata (ID, title, author, timestamp)
  - Extract post content (HTML body)
  - Extract replies and engagement metrics
  - Download attachments (PDFs, images, code files)
  - Extract external URLs mentioned
- Implement retry logic and rate limiting
- Cache raw data to avoid re-fetching

**1.2 Content Extraction** (`extract_content.py`)
- Parse Ed HTML to extract:
  - Clean text content (markdown-formatted)
  - Code snippets (identify language, extract blocks)
  - Embedded images and screenshots
  - Links to GitHub repos, Colab notebooks, etc.
  - Student attribution and contact links (LinkedIn, websites)
- Structured output format:
```json
{
  "post_id": "unique_id",
  "ed_thread_id": "12345",
  "title": "ChatGPT 4 on HW3 Coding Problems",
  "author": {
    "name": "Student Name",
    "ed_user_id": "abc123",
    "linkedin": "url_if_provided",
    "website": "url_if_provided"
  },
  "date": "2025-03-15",
  "llm": "ChatGPT 4",
  "llm_variant": "Standard (no o1 reasoning)",
  "content_raw_html": "...",
  "content_markdown": "...",
  "code_snippets": [
    {
      "language": "python",
      "code": "...",
      "context": "Prompt given to LLM"
    }
  ],
  "attachments": [
    {
      "type": "pdf",
      "filename": "interaction_log.pdf",
      "local_path": "/attachments/...",
      "ed_url": "..."
    }
  ],
  "external_links": ["https://github.com/..."],
  "raw_ed_data": {...}
}
```

### Phase 2: AI-Powered Analysis

**2.1 Individual Post Analysis** (`ai_analysis.py`)

For each post, use GPT-4 or Claude to generate:

**A. Executive Summary** (3-4 sentences)
- What LLM was tested
- What coding tasks were attempted
- Overall success rate and key findings

**B. Detailed Categorization**
- **LLM Information**:
  - Primary LLM (ChatGPT, Claude, Gemini, etc.)
  - Version (GPT-4, Claude 3.5 Sonnet, etc.)
  - Special modes (o1 reasoning, thinking mode, etc.)
  - Coding assistant used (Cursor, GitHub Copilot, etc.) if applicable
- **Task Types Covered** (multi-label):
  - Neural network architecture implementation
  - Optimizer implementation
  - Data preprocessing/augmentation
  - Training loop debugging
  - Tensor manipulation
  - Backpropagation
  - Loss function implementation
  - Performance optimization
  - Bug fixing
  - Code refactoring
  - Unit testing
- **Homework/Assignment**: Which homework was tested (HW1, HW2, etc.)
- **Problem Types**: Specific problems attempted

**C. LLM Behavior Analysis**
Extract and categorize student observations about:
- **Strengths**: What did the LLM do well?
- **Weaknesses**: Where did it struggle?
- **Hallucinations**: Specific examples of incorrect code/explanations
- **Common Mistakes**: Patterns of errors
- **Interaction Strategies**: What prompting techniques worked?
- **One-shot Success Rate**: How often did initial response work?
- **Iterations Required**: Average back-and-forth for correct solution

**D. Code Quality Assessment**
- Were the generated solutions correct?
- Code style and pythonic quality
- Error handling approach
- Comments and documentation quality
- Performance considerations

**E. Rich Tagging System** (15-25 tags)
- LLM-specific tags: `gpt-4`, `claude-sonnet`, `thinking-mode`
- Task tags: `neural-networks`, `optimization`, `debugging`
- Quality tags: `high-quality`, `detailed-analysis`, `code-examples`
- Insight tags: `surprising-failure`, `creative-solution`, `hallucination-example`
- Assignment tags: `hw1`, `hw3-q2`

**F. Highlight Worthiness Score** (0-10)
Based on:
- Depth of analysis
- Novelty of insights
- Quality of documentation
- Usefulness for other students
- Uniqueness of LLM/task combination

Prompt template for GPT-4:
```
You are analyzing a student's submission documenting their interaction with an LLM for coding tasks in a Deep Learning course (CS182).

Post content:
{content}

Attachments: {attachment_descriptions}

Analyze this post and provide:
1. Executive summary (3-4 sentences)
2. Structured categorization (JSON format):
   - llm_info: {primary_llm, version, variant, special_modes, assistant_tool}
   - task_types: [list of applicable task types]
   - homework_coverage: [hw1, hw2, etc.]
   - problems_attempted: [specific problem identifiers]
3. LLM behavior insights (JSON):
   - strengths: [list]
   - weaknesses: [list]
   - hallucinations: [specific examples with context]
   - common_mistakes: [patterns]
   - effective_strategies: [what worked]
   - one_shot_success_rate: estimated percentage
   - iterations_required: average number
4. Code quality assessment (JSON):
   - correctness_rating: 1-10
   - code_style_rating: 1-10
   - pythonic_rating: 1-10
   - notes: [specific observations]
5. Tags (15-25 relevant tags)
6. Highlight score (0-10) with justification

Return as structured JSON.
```

**2.2 Cross-Post Pattern Analysis** (`generate_insights.py`)

After analyzing individual posts, perform corpus-level analysis:

**A. LLM Performance Profiles**
For each LLM (ChatGPT 4, Claude 3.5, Gemini Pro, etc.):
- Number of submissions
- Average success rate
- Task-specific strengths/weaknesses
- Common failure modes
- Unique capabilities
- Cost-effectiveness insights (if mentioned by students)

**B. Task Difficulty Rankings**
Based on all submissions:
- Which coding tasks stumped most LLMs?
- Which tasks had high one-shot success rates?
- Task-specific LLM recommendations

**C. Comparative Analysis**
- Head-to-head LLM comparisons on same tasks
- Correlation between LLM features (thinking mode, etc.) and success
- Evolution over time (early submissions vs. late submissions)

**D. Student Strategy Patterns**
- Most effective prompting techniques
- Common pitfalls to avoid
- Best practices for LLM-assisted coding

**E. Insight Nuggets**
Extract quotable, actionable insights:
- "ChatGPT 4 consistently struggles with tensor reshaping in attention mechanisms"
- "Claude 3.5 excels at debugging off-by-one errors in training loops"
- "Asking the LLM to 'think step-by-step' improved correctness by 40%"

Output: `insights.json`, `llm_profiles.json`

### Phase 3: Data Enrichment

**3.1 Similarity Detection**
- Use embeddings (OpenAI embeddings API) to find similar posts
- Group posts by topic clusters
- Identify complementary perspectives on same LLM/task

**3.2 Link Validation**
- Verify all external links (GitHub, Colab, etc.)
- Extract README content from GitHub repos
- Generate preview data for link cards

**3.3 Accessibility Enhancements**
- Generate alt text for images using GPT-4 Vision
- Extract text from PDF attachments using OCR if needed
- Create transcripts for any video submissions

## Frontend: User Experience

### Core Pages

#### 1. Directory Page (Main Hub)

**Layout**: Similar to Blue Team E's directory with improvements

**Search & Filtering Panel** (Persistent left sidebar or top bar)
- **Multi-field Search**:
  - Full-text search across title, summary, student name, insights
  - Fuzzy matching with Fuse.js
  - Real-time search with debouncing
  - Highlight matching terms in results
- **Advanced Filters**:
  - LLM (multi-select): ChatGPT, Claude, Gemini, etc.
  - LLM Variant (conditional on LLM selection): GPT-4, GPT-4 Turbo, o1, etc.
  - Task Type (multi-select): 15+ categories
  - Homework Assignment (multi-select): HW1-HW10
  - Quality Tier: Highlighted only, High quality (8+), All
  - Code Quality Rating: 7+, 5+, All
  - Success Rate: High (80%+), Medium (50-80%), Variable
- **Sort Options**:
  - Relevance (if search query)
  - Date (newest/oldest)
  - Highlight score (highest first)
  - Student name (alphabetical)
  - LLM name (alphabetical)

**Results Grid**
- Card-based layout (3-4 columns on desktop, responsive)
- Each card shows:
  - Title with highlight badge if applicable
  - Student name with avatar/initials
  - LLM and variant
  - Date
  - Top 5 tags
  - Executive summary (truncated)
  - Quick metrics: Success rate, iterations, code quality
  - Save button (bookmark icon)
  - Quick View button
- Infinite scroll or pagination
- Empty state with helpful suggestions

**Quick View Panel** (Inspired by Blue Team E)
- Slides in from right when "Quick View" clicked
- Shows full post content without navigation
- Scroll through post while keeping directory visible
- Action buttons: Open Full View, Save, Close
- Navigate to previous/next post in results

#### 2. Post Detail Page

**Hero Section**
- Post title
- Student attribution with links (LinkedIn, website, GitHub)
- LLM badge (styled, with icon)
- Date and engagement stats
- Save button and share button

**Navigation Tabs**
- Overview
- Full Analysis
- Code Examples
- Attachments
- Related Posts

**Overview Tab**
- Executive Summary (featured)
- Key Metrics Grid:
  - One-shot success rate
  - Average iterations
  - Code quality score
  - Number of tasks attempted
- Task Coverage: Visual list of task types
- Quick Insights: 3-5 bullet points of notable findings

**Full Analysis Tab**
- Detailed sections:
  - LLM Behavior Analysis
    - Strengths (expandable list with examples)
    - Weaknesses (expandable list with examples)
    - Hallucinations (detailed examples with code)
    - Common Mistakes (patterns)
  - Effective Strategies
    - Prompting techniques that worked
    - Interaction patterns
    - Tips for others
  - Student Commentary
    - Original student observations
    - Reflections and learnings

**Code Examples Tab**
- Syntax-highlighted code snippets
- Organized by problem/task
- Show: Initial prompt → LLM response → Iterations → Final solution
- Side-by-side diff view where applicable
- Copy button for each snippet

**Attachments Tab**
- Embedded PDF viewer (with expand option, like Blue Team E)
- Image gallery with lightbox
- Download links for all attachments
- Preview for GitHub repos (README, key files)

**Related Posts Section** (Bottom of page)
- Similar LLM, different task
- Same task, different LLM
- Same student, other submissions
- Same homework assignment
- Complementary insights

#### 3. Insights Dashboard Page

**Purpose**: Staff and student research tool for understanding LLM coding capabilities

**LLM Comparison Section**
- Interactive table comparing all LLMs
- Columns: LLM, # Submissions, Avg Success Rate, Top Strength, Top Weakness
- Click row to expand detailed profile
- Filter by task type to see task-specific comparisons

**LLM Deep Dive Cards**
- One card per LLM
- Performance radar chart (correctness, code style, documentation, debugging, etc.)
- Task success heatmap
- Common failure modes
- Recommended use cases
- Cost considerations (if data available)

**Task Analysis Section**
- Task difficulty ranking (bar chart)
- Which LLMs perform best on each task (grouped bar chart)
- Task-specific insights and patterns

**Insight Nuggets Feed**
- Curated list of actionable insights
- Filterable by LLM, task, category
- Upvote/bookmark functionality
- Link to source posts

**Trend Analysis** (if temporal data available)
- LLM performance over time
- Submission volume by LLM (shows popularity)
- Quality scores over time

#### 4. Comparison Tool Page

**Interactive LLM Comparison**
- Select 2-4 LLMs to compare side-by-side
- Show profiles, metrics, strengths/weaknesses in parallel columns
- Filter comparison by specific task or homework
- Find posts that tested same task with different LLMs
- Visual diff of behavior patterns

**Head-to-Head Battle View**
- Pick a specific task (e.g., "Implementing Adam optimizer")
- See all LLM submissions for that task
- Compare code quality, iterations, success
- Determine "winner" for that task

#### 5. Playlist Page (Inspired by Blue Team E)

**Organization by Homework Assignment**
- Collapsible sections for HW1, HW2, HW3, etc.
- Within each homework:
  - Problem-level organization (HW3 Q1, HW3 Q2, etc.)
  - Show all relevant posts for that problem
  - Highlight posts covering multiple problems
- Saved posts appear highlighted within relevant sections
- Create personalized study path

**Lecture-Aligned View** (if lecture mapping data is available)
- Organize by course topics/lectures
- Connect submissions to specific concepts
- "Week 3: CNNs and Convolution" → relevant submissions

**Create Custom Playlists**
- Allow users to create named playlists
- Add posts to playlists
- Share playlist URL

#### 6. Saved Posts Page

**My Saved Posts**
- All bookmarked posts in one place
- Organize by custom playlists or default categories
- Add private notes to saved posts
- Export saved posts list

**Study Mode**
- Focus view for saved posts
- Hide distractions
- Progress tracking

### UI/UX Excellence

**Design Principles**
- Clean, minimal aesthetic (following Blue Team E)
- High contrast for readability
- Consistent spacing and typography
- Smooth animations and transitions
- Responsive design (mobile, tablet, desktop)
- Accessibility: ARIA labels, keyboard navigation, screen reader support

**Performance**
- Lazy load images and PDFs
- Virtual scrolling for long lists
- Code splitting for faster initial load
- Optimized bundle size
- Service worker for offline access to visited pages

**Data Visualization**
- Custom color schemes for each LLM (brand colors)
- Consistent chart styles using Recharts
- Interactive tooltips
- Exportable charts (SVG download)

**Interaction Patterns**
- Toast notifications for save/unsave actions
- Loading skeletons during data fetch
- Error boundaries with helpful messages
- Confirmation dialogs for destructive actions
- Keyboard shortcuts (? to show help)

## Technical Implementation Details

### Data Pipeline Execution

**Configuration** (`config.py`)
```python
# Environment variables
ED_API_TOKEN = os.getenv('ED_API_TOKEN')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
COURSE_ID = 84647  # From Ed URL

# Constants
PARTICIPATION_B_KEYWORDS = ['participation b', 'special participation b']
CACHE_DIR = 'cache/'
OUTPUT_DIR = 'public/data/'
ATTACHMENTS_DIR = 'public/attachments/'
```

**Build Script** (`build_dataset.py`)
```python
def main():
    # 1. Fetch posts from Ed
    raw_posts = fetch_all_participation_b_posts()
    save_cache('raw_posts.json', raw_posts)

    # 2. Extract and structure content
    structured_posts = [extract_content(post) for post in raw_posts]
    save_cache('structured_posts.json', structured_posts)

    # 3. AI analysis of each post
    analyzed_posts = []
    for post in structured_posts:
        # Check cache first
        cache_key = f"analysis_{post['post_id']}"
        if cached := load_cache(cache_key):
            analyzed_posts.append(cached)
        else:
            analysis = ai_analyze_post(post)
            analyzed_posts.append({**post, **analysis})
            save_cache(cache_key, analyzed_posts[-1])

    # 4. Generate cross-post insights
    insights = generate_insights(analyzed_posts)
    llm_profiles = generate_llm_profiles(analyzed_posts)

    # 5. Compute similarities and related posts
    for post in analyzed_posts:
        post['related_posts'] = find_similar_posts(post, analyzed_posts)

    # 6. Write final outputs
    write_json(OUTPUT_DIR + 'posts.json', analyzed_posts)
    write_json(OUTPUT_DIR + 'insights.json', insights)
    write_json(OUTPUT_DIR + 'llm_profiles.json', llm_profiles)

    print(f"✓ Processed {len(analyzed_posts)} posts")
    print(f"✓ Generated {len(llm_profiles)} LLM profiles")
    print(f"✓ Extracted {len(insights['nuggets'])} insight nuggets")
```

**Caching Strategy**
- Cache raw Ed API responses to avoid re-fetching
- Cache AI analysis results (keyed by content hash)
- Incremental updates: only analyze new/changed posts
- Cache invalidation: detect Ed post edits by comparing timestamps

**Error Handling**
- Graceful degradation: if AI analysis fails, use basic extraction
- Retry logic for API failures (Ed, OpenAI)
- Comprehensive logging
- Continue pipeline even if some posts fail

### Frontend Implementation

**State Management** (using Zustand)
```typescript
// store/useAppStore.ts
interface AppState {
  savedPostIds: Set<string>;
  searchQuery: string;
  activeFilters: FilterState;
  toggleSavePost: (postId: string) => void;
  setSearchQuery: (query: string) => void;
  updateFilters: (filters: Partial<FilterState>) => void;
}

const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      savedPostIds: new Set(),
      searchQuery: '',
      activeFilters: DEFAULT_FILTERS,
      toggleSavePost: (postId) => set((state) => {
        const newSet = new Set(state.savedPostIds);
        newSet.has(postId) ? newSet.delete(postId) : newSet.add(postId);
        return { savedPostIds: newSet };
      }),
      // ... other actions
    }),
    {
      name: 'cs182-participation-b-storage',
    }
  )
);
```

**Data Fetching** (using React Query)
```typescript
// hooks/usePostsData.ts
export function usePostsData() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await fetch('/data/posts.json');
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json() as Promise<Post[]>;
    },
    staleTime: Infinity, // Static data, never refetch
  });
}
```

**Search Implementation** (using Fuse.js)
```typescript
// hooks/useSearchPosts.ts
export function useSearchPosts(posts: Post[], query: string) {
  const fuse = useMemo(
    () => new Fuse(posts, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'summary', weight: 1.5 },
        { name: 'author.name', weight: 1 },
        { name: 'tags', weight: 1 },
        { name: 'insights.strengths', weight: 0.5 },
      ],
      threshold: 0.3,
      includeMatches: true,
    }),
    [posts]
  );

  return useMemo(() => {
    if (!query.trim()) return posts;
    return fuse.search(query).map(result => ({
      ...result.item,
      _matches: result.matches,
    }));
  }, [posts, query, fuse]);
}
```

**Filtering Logic**
```typescript
// lib/filterPosts.ts
export function filterPosts(
  posts: Post[],
  filters: FilterState
): Post[] {
  return posts.filter(post => {
    // LLM filter
    if (filters.llms.length > 0 && !filters.llms.includes(post.llm_info.primary_llm)) {
      return false;
    }

    // Task type filter (any match)
    if (filters.taskTypes.length > 0) {
      if (!post.task_types.some(t => filters.taskTypes.includes(t))) {
        return false;
      }
    }

    // Homework filter
    if (filters.homeworks.length > 0) {
      if (!post.homework_coverage.some(hw => filters.homeworks.includes(hw))) {
        return false;
      }
    }

    // Quality filter
    if (filters.minHighlightScore > 0) {
      if (post.highlight_score < filters.minHighlightScore) {
        return false;
      }
    }

    // ... other filters

    return true;
  });
}
```

**Quick View Component**
```typescript
// components/post/QuickView.tsx
export function QuickView({ postId, onClose }: QuickViewProps) {
  const { data: posts } = usePostsData();
  const post = posts?.find(p => p.post_id === postId);

  if (!post) return null;

  return (
    <Sheet open={!!postId} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-2/3 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{post.title}</SheetTitle>
          <SheetDescription>
            {post.author.name} • {post.llm_info.primary_llm}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <PostSummary post={post} />
          <PostMetrics post={post} />
          <PostInsights post={post} />

          <div className="flex gap-2">
            <Button asChild>
              <Link to={`/post/${postId}`}>Full View</Link>
            </Button>
            <SavePostButton postId={postId} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

**Responsive Design**
- Mobile: Single column, bottom navigation, collapsible filters
- Tablet: Two columns, side filters
- Desktop: Three+ columns, persistent filters
- Use Tailwind responsive utilities: `md:`, `lg:`, `xl:`

### Build & Deployment

**Vite Configuration**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/', // or '/participation-b/' if subdirectory
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          'charts': ['recharts'],
        },
      },
    },
  },
});
```

**Build Process**
1. Run Python pipeline: `python data_pipeline/build_dataset.py`
2. Build React app: `npm run build`
3. Output: `dist/` directory ready for deployment

**Deployment Options**
- **GitHub Pages**: Push `dist/` to `gh-pages` branch
- **eecs182.org Integration**: Copy `dist/` contents to server directory
- **Netlify/Vercel**: Connect repo, auto-deploy on push

**CI/CD** (Optional but recommended)
- GitHub Actions workflow
- On push to main: Run data pipeline → Build frontend → Deploy
- Scheduled runs to pick up new Ed posts

## Development Phases

### Phase 1: Foundation (Estimated: Setup)
- [ ] Initialize repository structure
- [ ] Set up Python environment and dependencies
- [ ] Set up React + Vite + TypeScript project
- [ ] Configure TailwindCSS and UI component library
- [ ] Create basic configuration and environment setup
- [ ] Test Ed API authentication and basic fetching

### Phase 2: Data Pipeline Core (Estimated: Core functionality)
- [ ] Implement Ed API client wrapper
- [ ] Build post fetching with pagination and filtering
- [ ] Implement content extraction (HTML parsing, code extraction)
- [ ] Set up attachment downloading
- [ ] Create caching system
- [ ] Test with sample posts

### Phase 3: AI Analysis Layer (Estimated: AI integration)
- [ ] Design AI prompts for post analysis
- [ ] Implement GPT-4/Claude analysis calls
- [ ] Build structured categorization
- [ ] Extract LLM behavior insights
- [ ] Generate tags and highlight scores
- [ ] Test analysis quality on diverse posts

### Phase 4: Cross-Post Intelligence (Estimated: Analytics)
- [ ] Implement LLM performance profiling
- [ ] Build task difficulty analysis
- [ ] Create comparative analysis
- [ ] Extract insight nuggets
- [ ] Compute post similarities with embeddings
- [ ] Generate final JSON outputs

### Phase 5: Frontend Core (Estimated: Core UI)
- [ ] Set up routing and pages
- [ ] Implement data loading with React Query
- [ ] Build post card components
- [ ] Create directory page with grid layout
- [ ] Implement basic search and filtering
- [ ] Build post detail page layout

### Phase 6: Advanced Features (Estimated: Enhanced UX)
- [ ] Implement Quick View panel
- [ ] Build advanced filter UI
- [ ] Add fuzzy search with highlighting
- [ ] Create saved posts functionality with persistence
- [ ] Implement playlist page
- [ ] Build insights dashboard with charts

### Phase 7: Polish & Excellence (Estimated: Quality)
- [ ] Design LLM comparison tool
- [ ] Add data visualizations (charts, heatmaps)
- [ ] Implement PDF embedding and viewer
- [ ] Create similar posts algorithm
- [ ] Add keyboard shortcuts
- [ ] Optimize performance (lazy loading, code splitting)
- [ ] Mobile responsive refinement
- [ ] Accessibility audit and fixes

### Phase 8: Testing & Documentation (Estimated: Quality assurance)
- [ ] Test data pipeline end-to-end
- [ ] Test frontend on multiple browsers and devices
- [ ] Write README with setup instructions
- [ ] Create CLAUDE.md for future development
- [ ] Document data schema and API
- [ ] Create deployment guide

### Phase 9: Deployment & Submission (Estimated: Final steps)
- [ ] Run full pipeline on all posts
- [ ] Build production frontend
- [ ] Deploy to hosting
- [ ] Test deployed site
- [ ] Prepare submission materials
- [ ] Submit to gradescope and Ed

## Success Metrics (Why This Earns 10 Points)

### Exceeding Red Team Baseline
1. **AI Quality**: Using GPT-4/Claude instead of Gemini for deeper, more accurate analysis
2. **Multi-dimensional Analysis**: Not just summaries and tags, but comprehensive behavior profiling
3. **Cross-Post Intelligence**: Insights Dashboard with LLM comparisons, task analysis, patterns
4. **Interactive Tools**: Comparison tool, playlist builder, not just static display
5. **Superior UX**: All Blue Team E features + LLM-specific innovations

### Value for Students
1. **Learning Resource**: Understand which LLM works best for which tasks
2. **Strategic Guidance**: Learn effective prompting strategies from peers
3. **Time Saving**: Quickly find relevant examples for their coding challenges
4. **Study Tool**: Playlist feature organizes by homework/lecture
5. **Research Tool**: Comparative analysis helps choose LLM for projects

### Value for Staff
1. **Research Insights**: Comprehensive data on LLM coding capabilities
2. **Curriculum Design**: Identify which topics benefit from LLM assistance
3. **Assessment**: Understand student-LLM interaction patterns
4. **Future Planning**: Data-driven decisions about AI in education

### Technical Excellence
1. **Modern Stack**: React 18 + TypeScript + Vite (current best practices 2025)
2. **Performance**: Optimized bundle, lazy loading, instant search
3. **Accessibility**: WCAG compliant, keyboard navigation, screen reader support
4. **Maintainability**: Clean code, TypeScript types, component architecture
5. **Scalability**: Handles 100+ posts smoothly, easy to add more features

### Innovation Beyond Requirements
1. **LLM Behavior Profiling**: Unique feature not in requirements
2. **Comparison Tool**: Interactive side-by-side analysis
3. **Insight Nuggets**: Curated, quotable findings
4. **Playlist System**: Personalized study guide builder
5. **Code Quality Metrics**: Assess generated code quality

## Risk Mitigation

### Technical Risks
- **Ed API Changes**: Use stable library (edapi), cache raw responses
- **AI Analysis Cost**: Cache aggressively, batch requests, use cheaper model for simpler tasks
- **Large Dataset**: Optimize with pagination, virtual scrolling, lazy loading
- **Deployment Issues**: Test early, have multiple hosting options

### Quality Risks
- **AI Hallucinations in Analysis**: Human review of sample analyses, validation checks
- **Incomplete Post Coverage**: Robust error handling, graceful degradation
- **Poor UX**: User testing with classmates, iterate on feedback
- **Mobile Performance**: Test on real devices, optimize bundle size

### Timeline Risks
- **Scope Creep**: Prioritize must-have features, nice-to-haves can be added later
- **Dependency Issues**: Lock versions, test early and often
- **Data Pipeline Slowness**: Parallel processing, incremental builds

## Open Questions for Clarification

1. **Ed API Access**: Do we have API token? Rate limits?
2. **AI Budget**: What's the budget for OpenAI/Anthropic API calls? (Estimated: $20-50 for full analysis)
3. **Hosting**: Preference for GitHub Pages vs. eecs182.org integration?
4. **Submission Format**: Besides deployed site, what else needed? (Repo link, writeup, etc.)
5. **Team Coordination**: Are we coordinating with Red Team to ensure we exceed their baseline?
6. **Deadlines**: When is submission due? When do we need to sign up?

## Next Steps

1. **Review this plan** with team and get feedback
2. **Set up development environment** and verify Ed API access
3. **Build minimal prototype** with basic pipeline and simple frontend
4. **Iterate** based on data quality and feedback
5. **Execute phases** systematically
6. **Test continuously** to catch issues early
7. **Deploy** and submit with confidence

---

This plan represents a comprehensive, thoughtful approach to creating a Blue Team website that significantly exceeds the Red Team baseline and delivers exceptional value to students and staff. The combination of advanced AI analysis, multi-dimensional organization, interactive tools, and superior UX positions this for full 10-point credit.
