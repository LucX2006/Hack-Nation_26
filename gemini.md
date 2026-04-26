# Gemini CLI Build Brief — NGO Healthcare Planning App

## Objective
Build a **desktop-first web application** for the Hack-Nation challenge **"Serving a Nation"**.

The product should feel like a mix of:
- **ChatGPT at the beginning**: a clean landing screen with a large central prompt bar
- **an operations dashboard after submit**: a dynamic analysis workspace with a map, rankings/tables, trust information, reasoning summaries, evidence, and follow-up questions

The core purpose is to support **NGO planners and decision-makers** with an agentic healthcare planning interface that turns natural-language requests into actionable spatial and facility-level insights.[file:2]

---

## Product idea
The app starts with a **minimal chat-like entry experience**.

At the beginning:
- the screen is mostly empty
- a large prompt input is centered on the page
- there are a few suggested prompts below it
- no heavy dashboard panels are visible yet

After the user submits the first query:
- the app transitions into an **analysis workspace**
- the map and side panels appear
- the result layout adapts to the type of query

This means the application has **two major UI states**:

1. **Initial prompt state**
2. **Result workspace state**

---

## Main UX concept

### State 1 — Initial prompt screen
This state should feel similar to ChatGPT's opening experience, but tailored to NGO healthcare planning.

#### Requirements
- centered headline/subheadline
- large central prompt bar
- primary CTA such as **Analyze** or **Run query**
- 3 to 5 suggested example prompts
- subtle, clean background
- no visible ranking tables or reasoning panels yet
- optionally a faint map silhouette or quiet geographic texture, but keep it minimal

#### Example heading
- **What healthcare gap should we analyze?**
- **Ask about care access, facility readiness, or regional health deserts**

#### Example suggested prompts
- Find the nearest facility in rural Bihar that can perform an emergency appendectomy and typically leverages parttime doctors
- Show the highest-risk medical deserts in India for dialysis, oncology, and emergency trauma
- Find facilities claiming advanced surgery but lacking supporting evidence such as anesthesia capability
- Which regions have weak neonatal and oxygen support coverage?

---

### State 2 — Analysis workspace
Once the user submits a query, the interface morphs into a desktop dashboard.

#### Layout
Use a **desktop-first 3-zone layout**:

- **Top bar**
  - smaller persistent prompt bar for refinements and follow-up queries
  - submit button
  - optional filters/chips

- **Main content area**
  - large map area as primary visual anchor

- **Right side stacked panels**
  - upper panel: ranking table or regional summary table
  - lower panel: trust, reasoning, evidence, follow-up questions

The app should stay on one route/page for MVP and transition between states within the same page.

---

## Adaptive output logic
The system should not always render results in the same way.

It must adapt based on the query type.

### Query type 1 — Regional gap / undercoverage
Examples:
- Where is emergency trauma care weak?
- Which regions are poorly equipped for dialysis?
- Where are neonatal services underdeveloped?

#### Best output
- **dominant view**: thematic / choropleth map
- **secondary panel**: regional ranking table
- **support panel**: confidence, evidence, reasoning summary

---

### Query type 2 — Best facility / best match
Examples:
- Which is the best hospital for emergency appendectomy in this area?
- What are the top trusted emergency-capable facilities in rural Bihar?

#### Best output
- **dominant view**: ranking table with best matching facilities
- **map**: markers showing facility locations
- **support panel**: trust score, evidence snippets, concise reasoning, flags

---

### Query type 3 — Validation / contradiction check
Examples:
- Which facilities claim advanced surgery but lack anesthesia evidence?
- Which hospitals show contradictory 24/7 emergency claims?

#### Best output
- **dominant view**: contradiction / validation list or table
- **map**: optional context only
- **support panel**: rule checks, trust issues, evidence, follow-up questions

---

## Reasoning panel rules
The reasoning panel is important, but it must be presented in a human-friendly way.

### Do this
Show compact reasoning cards/sections such as:
- Matched capability
- Geographic fit
- Trust score summary
- Missing evidence
- Data quality issues
- Evidence sentence(s)
- Confidence level

### Do not do this
- do not expose raw chain-of-thought
- do not show overly verbose internal reasoning dumps

### Follow-up questions
If the user query is too vague, the reasoning panel should also surface **clarifying questions**.

Examples:
- Which state or district should be prioritized?
- Is emergency care required or routine care?
- Which specialty matters most?
- Do you want only high-trust facilities?
- Should government facilities be prioritized?

These should appear as **chips or quick actions** that can help refine the prompt.

---

## Product interpretation
Treat this as an **agentic planning interface for NGO decision support**.

It is not just a map.
It is not just a chat interface.
It is not just a ranking tool.

It is a workflow where:
1. the user asks a planning question
2. the agent interprets it
3. the app chooses the best result view
4. the user reviews rankings, map patterns, trust, and evidence
5. the user can refine the analysis through follow-up questions

This reflects the challenge emphasis on:
- multi-attribute reasoning
- trust scoring
- dynamic crisis mapping
- traceability and evidence-backed recommendations
- actionable insights for NGO planners.[file:2]

---

## Recommended tech stack
Build with a fast, hackathon-friendly stack.

### Frontend
- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** for fast component scaffolding
- **Leaflet** for the first map MVP, or **MapLibre GL JS** if comfortable
- **TanStack Table** for ranking and results tables
- **Lucide icons** for clean iconography

### Backend integration
- design the app to consume **JSON output from an agent/backend**
- for MVP, use **mock data first**
- later integrate with Databricks-backed logic, MLflow traces, Vector Search, and structured outputs

### Why this stack
- very fast for hackathon delivery
- easy to build a polished desktop dashboard
- strong ecosystem for maps, panels, tables, and state-driven UI
- easy to later connect to real agent outputs

---

## Implementation strategy
Build in this order.

### Phase 1 — Landing state
Create the initial ChatGPT-like screen:
- centered layout
- big prompt box
- suggested prompts
- polished empty state

### Phase 2 — Workspace shell
After submit, transition to:
- top prompt bar
- large map panel
- ranking/results panel
- reasoning/trust/evidence panel

### Phase 3 — Adaptive rendering
Support at least these modes:
- `regional_gap`
- `facility_search`
- `validation`

Each mode should dynamically change:
- dominant visual focus
- map layer type
- table type
- panel content

### Phase 4 — Demo polish
Add:
- loading states
- empty states
- selected item highlighting between map and table
- follow-up question chips
- evidence cards
- summary banner
- smooth transition from initial screen to workspace

---

## Data contract
Assume the frontend receives JSON in a normalized structure.

```json
{
  "query": "Find the nearest facility in rural Bihar that can perform an emergency appendectomy and typically leverages parttime doctors",
  "query_type": "facility_search",
  "map_mode": "facility_markers",
  "summary": "3 facilities match strongly; 1 has the highest trust score.",
  "filters_interpreted": {
    "state": "Bihar",
    "rural": true,
    "procedure": "emergency appendectomy",
    "staffing": "parttime doctors"
  },
  "ranking": [
    {
      "rank": 1,
      "facility_name": "Example Hospital",
      "state": "Bihar",
      "district": "Patna",
      "lat": 25.6,
      "lng": 85.1,
      "match_score": 0.91,
      "trust_score": 0.84,
      "confidence": 0.78,
      "reasoning_summary": [
        "Surgery-related capability detected",
        "Emergency support indicators present",
        "Part-time staffing signal found"
      ],
      "evidence": [
        "Performs emergency appendectomy...",
        "24/7 emergency surgical services..."
      ],
      "flags": [
        "Anesthesia evidence incomplete"
      ]
    }
  ],
  "regions": [],
  "follow_up_questions": [
    "Should the search prioritize government facilities?",
    "Do you want to exclude low-confidence matches?"
  ]
}
```

Support a regional response too:

```json
{
  "query": "Show the highest-risk medical deserts in India for dialysis, oncology, and emergency trauma",
  "query_type": "regional_gap",
  "map_mode": "choropleth",
  "summary": "Several clusters show low coverage for high-acuity specialties.",
  "regions": [
    {
      "region_id": "IN-BR-001",
      "name": "Bihar Rural Cluster A",
      "risk_score": 0.87,
      "coverage_score": 0.22,
      "confidence": 0.64,
      "primary_gap": "Emergency Trauma",
      "supporting_facts": [
        "No high-trust trauma facilities identified",
        "Sparse emergency coverage signals"
      ]
    }
  ],
  "ranking": [],
  "follow_up_questions": [
    "Should the analysis focus only on rural areas?"
  ]
}
```

---

## UI behavior rules

### Initial app load
- show only the landing state
- no large data panels visible
- no heavy map workspace shown yet

### After first query
- animate into workspace mode
- keep the prompt accessible at the top
- show results according to the query type

### Interaction patterns
- clicking a ranking row highlights the map marker or region
- clicking a map marker highlights the corresponding table row
- selecting an item updates the trust/reasoning/evidence panel
- follow-up question chips can repopulate or extend the prompt input

### Query refinement
The app should feel iterative:
- initial query
- first result set
- follow-up clarification
- refined analysis

This is one of the key reasons to keep the prompt bar always visible after submit.

---

## Visual direction
The visual style should communicate:
- trust
- seriousness
- operational usefulness
- modern AI-native workflow

### Style notes
- desktop-first
- polished and restrained
- generous whitespace in initial state
- more information density in workspace state
- neutral base palette
- clear health/risk color semantics
- avoid flashy gradients and startup-style gimmicks

### Suggested color usage
- red/orange = undercoverage / high risk
- teal/blue = strong match / strong confidence
- amber = uncertainty / incomplete evidence
- slate/neutral = structure, panels, text

---

## Components to generate
Create the MVP with components such as:

- `LandingPrompt`
- `SuggestedPrompts`
- `WorkspaceHeader`
- `PromptBar`
- `MapView`
- `RankingTable`
- `RegionTable`
- `ReasoningPanel`
- `TrustPanel`
- `EvidenceList`
- `FollowUpQuestions`
- `SummaryBanner`
- `EmptyState`
- `LoadingState`

---

## Suggested file structure
```text
app/
  page.tsx
components/
  landing-prompt.tsx
  suggested-prompts.tsx
  workspace-header.tsx
  prompt-bar.tsx
  map-view.tsx
  ranking-table.tsx
  reasoning-panel.tsx
  trust-panel.tsx
  evidence-list.tsx
  follow-up-questions.tsx
lib/
  mock-data.ts
  query-mode.ts
  prompts.ts
  format.ts
public/
  india-geojson.json
```

If GeoJSON is not available yet, continue with:
- placeholder map area
- mock regions/facility overlays
- strong layout and interaction first

---

## MVP acceptance criteria
The MVP is successful if it can:

1. load into a clean chat-like landing screen
2. accept a natural-language prompt from the center input
3. transition into a workspace after submit
4. switch behavior across at least 3 query types
5. render a meaningful map state
6. show rankings or regional summaries
7. show trust, evidence, and reasoning summaries
8. show follow-up questions in the reasoning panel when needed
9. feel like a real NGO planning product rather than a static dashboard

---

## Built-in sample prompts
Use these as suggested prompts in the landing state:

1. Find the nearest facility in rural Bihar that can perform an emergency appendectomy and typically leverages parttime doctors
2. Show the highest-risk medical deserts in India for dialysis, oncology, and emergency trauma
3. Find facilities claiming advanced surgery but lacking supporting evidence such as anesthesia capability
4. Which regions have weak neonatal and oxygen support coverage?
5. What are the top trusted emergency-capable facilities in this region?

---

## Instruction to Gemini
When generating code, prioritize:

- speed of implementation
- strong desktop UX
- clean, modular TypeScript
- mock-data-first architecture
- easy future integration with Databricks JSON outputs
- a polished transition from the initial prompt screen to the dashboard workspace

Do not spend time on:
- authentication
- persistence
- advanced backend setup
- deployment complexity

Focus on one polished MVP experience.

---

## First implementation request
Generate a **Next.js + TypeScript + Tailwind** MVP with:

- a **ChatGPT-like landing screen** at first load
- a **large centered prompt bar**
- **suggested prompt cards/chips**
- no panels visible before first submit
- after submit, transition into a **desktop analysis workspace**
- a **large map panel**
- a **results/ranking panel**
- a **reasoning/trust/evidence panel**
- mocked responses for:
  - `regional_gap`
  - `facility_search`
  - `validation`
- adaptive rendering depending on the query type
- follow-up question chips inside the reasoning panel

