# NGO Healthcare Planning App - Frontend Progress Summary

## 1. Architecture & Core Logic
*   **Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS 4.
*   **State Management:** Centralized orchestration in `page.tsx`.
*   **Data Transformer:** Advanced mapping logic that handles:
    *   `query_reasoning` extraction (reasoning steps, constraints).
    *   `trust_score` calculation from penalties.
    *   Intelligent city-to-coordinate mapping and Jitter for overlapping pins.
    *   Extraction of `lat/lon` from API vs. fallback systems.

## 2. State 1: Landing View
*   **Controlled Search:** Suggestions now populate the search bar before submitting.
*   **Interactive Testing:** Temporary "Heatmap Test" button to bypass API for design validation.
*   **Loading UX:** Disabled inputs and dimmed UI during active analysis.

## 3. State 2: Analysis Workspace
*   **AI Transparency (New):** "AI Query Analysis" section displaying the logical steps and structured constraints derived from the user's prompt.
*   **Trust Integration:** Facility cards show a "Trust Score" badge (shield icon) based on AI verification.
*   **Expandable Reasoning:** Specific logic per facility is available via individual toggles.
*   **Sticky Interaction:** Suggested follow-ups and prompt input are fixed at the bottom for accessibility.

## 4. Mapping Module (Leaflet)
*   **State-Level Heatmap:** High-detail India borders via GeoJSON (`india-states.geojson`).
*   **Dynamic Styling:** Thematic red color scale based on `risk_score` (0.0 - 1.0).
*   **Clean Design:** Transparent base states and removed hard outlines for a seamless look.
*   **Auto-Navigation:** Automatically pans/zooms to fit all current results (fitBounds).
*   **Bidirectional Sync:** Hover synchronization between map elements and sidebar cards.

## Current Design Profile
*   **Theme:** Light Theme (White/Slate-Grey) with Blue accents.
*   **Status Indicators:** Color-coded urgency and trust badges (Green/Amber/Red).
