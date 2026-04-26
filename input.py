from fastapi import FastAPI, Request
from databricks.sdk import WorkspaceClient
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.post("/trigger-run")
async def trigger_run(request: Request):
    data = await request.json()
    user_input = data.get("postal_code", "")

    w = WorkspaceClient(
        host="https://dbc-bb186c12-6d3e.cloud.databricks.com/",
        token="---"
    )

    waiter = w.jobs.run_now(
        job_id=787825749675163,
        notebook_params={
            "postal_code": user_input
        }
    )

    parent_run = waiter.result(timeout=timedelta(minutes=10))

    run_details = w.jobs.get_run(run_id=parent_run.run_id)

    first_task_run_id = run_details.tasks[0].run_id

    output = w.jobs.get_run_output(run_id=first_task_run_id)

    notebook_output = output.notebook_output.result

    print(notebook_output)

    return {
        "parent_run_id": parent_run.run_id,
        "task_run_id": first_task_run_id,
        "notebook_output": notebook_output
    }