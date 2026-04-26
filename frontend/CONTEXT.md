# NGO Healthcare Planning App - Frontend Progress Summary

## 1. Architecture & Core Logic
*   **Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS 4.
*   **State Management:** Centralized orchestration in `page.tsx` managing transitions between Landing and Workspace views.
*   **Data Contract:** Flexible mock data structure in `mock-data.ts` supporting three core scenarios: `facility_search`, `regional_gap`, and `validation`.

## 2. State 1: Landing View (ChatGPT-Style)
*   **Minimalist Design:** Clean, centered entry point focused on the natural language prompt.
*   **Interactive Search:** Fully rounded input field (`rounded-full`) with a circular blue send button.
*   **Smart Suggestions:** NGO-specific example prompts in card format with hover effects for instant analysis.
*   **Aesthetics:** Subtle background glows for a modern, "alive" prototype feel.

## 3. State 2: Analysis Workspace (Dashboard)
*   **3-Zone Layout:** Desktop-first design optimized for NGO planners.
    *   **Top Bar:** Displays active query with a clickable logo ("HealthPlan AI") for home navigation.
    *   **Main Area:** Large-scale interactive map integration.
    *   **Sidebar:** Right-side panel with deep shadows for visual depth, containing results and reasoning.
*   **Result Cards:** Hospital and regional findings displayed in cards with persistent shadows and hover animations. Includes match-score progress bars and risk indicators.
*   **Interactive Refinement:** Fully rounded follow-up input field at the bottom of the sidebar for iterative analysis.

## 4. Mapping Module (Leaflet Integration)
*   **Interactive World Map:** Fully functional map based on OpenStreetMap (CartoDB Light).
*   **Adaptive Layers:**
    *   **Markers:** Custom pin icons with a transparent "hole" in the center for precise geographic context.
    *   **Risk Zones:** Semi-transparent red/amber circles for visualizing healthcare coverage gaps.
*   **Technical Implementation:** Dynamic client-side loading to ensure compatibility with Next.js SSR.

## Current Design Profile
*   **Theme:** Light Theme (White/Slate-Grey) with Blue primary accents.
*   **Styling:** Consistent use of rounded corners and a clear shadow hierarchy to communicate trust and operational utility.
