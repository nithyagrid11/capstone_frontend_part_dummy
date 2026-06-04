from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Event(BaseModel):
    event_type: str
    lead_id: str

@app.post("/salesforce/events")
async def salesforce_events(event: Event):

    print("EVENT RECEIVED")
    print(event.model_dump())

    return {"status": "success"}