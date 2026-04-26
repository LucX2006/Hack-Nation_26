# NGO Healthcare Planning App - Frontend Progress Summary

## 1. Architecture & Core Logic
*   **Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS 4.
*   **State Management:** Centralized orchestration in `page.tsx` managing transitions between Landing and Workspace views.
*   **Data Integration:** Real-time connection to Python FastAPI backend (`/api/analyze`).
*   **Data Transformer:** Custom logic in `Home` component that maps raw Databricks JSON results to the internal UI structure, including intelligent city-to-coordinate mapping (e.g., Mumbai, Delhi).

## 2. State 1: Landing View (ChatGPT-Style)
*   **Controlled Input:** The search bar is now a controlled component; selecting a suggestion populates the bar before submitting.
*   **Loading State:** Input and buttons are disabled and visually dimmed (`opacity-60`) during analysis to prevent duplicate requests.
*   **Interactive Design:** Clean, centered entry point with NGO-specific example prompts.

## 3. State 2: Analysis Workspace (Dashboard)
*   **3-Zone Layout:** Map (Left), Results & Reasoning (Right Sidebar), Follow-up (Sticky Bottom).
*   **Result Cards:** 
    *   **Expandable Reasoning:** Each facility card has an individual "Show reasoning" toggle that reveals specific logic from the AI judge.
    *   **Interactive Cards:** Highlighting via blue border, rings, and shadows on hover.
*   **Sticky Refinement:** Suggested follow-up questions and input field are fixed at the bottom, remaining visible even when scrolling through long result lists.
*   **Loading Overlay:** A "Recalculating" backdrop appears when submitting follow-up questions, providing seamless feedback without leaving the workspace.

## 4. Mapping Module (Leaflet Integration)
*   **Auto-Zoom (fitBounds):** The map automatically calculates the optimal zoom level and center point to fit all markers in the current result set.
*   **Bidirectional Hover Sync:** 
    *   Hovering over a sidebar card enlarges the map pin (1.4x scale) and increases its Z-index.
    *   Hovering over a map pin/region highlights the corresponding card in the sidebar.
*   **Safety & Constraints:** `minZoom` set to 3, `maxBounds` locked to world coordinates, and `noWrap` enabled to prevent world-repetition.
*   **Jitter Logic:** Markers in the same city are slightly offset to ensure they remain individually selectable.

## Current Design Profile
*   **Theme:** Light Theme (White/Slate-Grey) with Blue primary accents.
*   **Shadow Hierarchy:** Combined multi-layered shadows for depth (`shadow-[0_8px_20px...]`).
