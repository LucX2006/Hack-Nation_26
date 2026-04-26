# NGO Healthcare Planning App - Backend Progress Summary

## 1. Architecture & Framework
*   **Tech Stack:** Python 3.12, FastAPI, Uvicorn.
*   **Structure:** Modular design with separation of concerns:
    *   `main.py`: Entry point, CORS configuration, and environment loading.
    *   `app/api/`: REST endpoints (FastAPI Router).
    *   `app/services/`: External service integrations (Databricks).
    *   `app/models/`: Pydantic schemas for request/response validation.

## 2. API Endpoints
*   **POST `/api/analyze`**: 
    *   Accepts `query` (natural language) and optional `previous_query` (memory/context).
    *   Triggers the Databricks Analysis Job.
    *   Returns structured results including job IDs and notebook output.

## 3. Databricks Integration
*   **SDK:** Utilizes the official `databricks-sdk` for secure workspace interaction.
*   **Job Execution:**
    *   Triggers a specific Notebook Job (ID: `787825749675163`).
    *   **Context Awareness:** Passes a combined context string `[Context: previous_query] current_query` to the notebook via `postal_code` parameter.
    *   **Result Retrieval:** Waits for job completion and extracts the `notebook_output` for the frontend.
*   **Performance:** Configured with a 10-minute timeout for complex analysis models.

## 4. Security & Configuration
*   **Environment Variables:** Managed via `.env` file (ignored by Git).
*   **Authentication:** Uses `DATABRICKS_TOKEN` for WorkspaceClient authorization.
*   **CORS:** Enabled for frontend communication (currently allowing all origins for development).

## Dependencies
*   `fastapi`, `uvicorn`: Web server logic.
*   `databricks-sdk`: Cloud workspace interaction.
*   `python-dotenv`: Environment management.
*   `pydantic`: Data modeling.
