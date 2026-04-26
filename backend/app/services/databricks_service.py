from databricks.sdk import WorkspaceClient
from datetime import timedelta
import os

class DatabricksService:
    def __init__(self):
        self.host = "https://dbc-bb186c12-6d3e.cloud.databricks.com/"
        self.token = os.getenv("DATABRICKS_TOKEN", "YOUR_TOKEN_HERE")
        self.job_id = 787825749675163
        self.w = WorkspaceClient(host=self.host, token=self.token)

    async def trigger_job_run(self, query: str, previous_query: str | None = None):
        # Wir kombinieren den aktuellen Query mit dem vorherigen Kontext
        full_context = f"[Context: {previous_query}] {query}" if previous_query else query
        
        waiter = self.w.jobs.run_now(
            job_id=self.job_id,
            notebook_params={
                "postal_code": full_context 
            }
        )

        parent_run = waiter.result(timeout=timedelta(minutes=10))
        run_details = self.w.jobs.get_run(run_id=parent_run.run_id)
        
        # Den Output des ersten Tasks abrufen
        first_task_run_id = run_details.tasks[0].run_id
        output = self.w.jobs.get_run_output(run_id=first_task_run_id)
        
        return {
            "parent_run_id": parent_run.run_id,
            "task_run_id": first_task_run_id,
            "notebook_output": output.notebook_output.result
        }
