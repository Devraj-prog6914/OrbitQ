from fastapi import FastAPI, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import time

from optimization.classical import optimize_classical
from optimization.quantum import optimize_quantum
from models.database import SessionLocal, init_db, MissionRun

app = FastAPI(title="ORBIT-Q API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MissionRequest(BaseModel):
    origin: str
    destination: str
    mass: float
    launchDate: str
    gravityAssist: bool = False

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def on_startup():
    init_db()

@app.post("/api/optimize")
def optimize_trajectory(request: MissionRequest, db: Session = Depends(get_db)):
    params = request.dict()
    
    # Simulate processing time for QUBO solver
    time.sleep(1.5)
    
    # Run optimization engines
    classical_res = optimize_classical(params)
    quantum_res = optimize_quantum(params)
    
    # Calculate savings
    fuel_saved = 0.0
    if classical_res["fuelCost"] > 0:
        fuel_saved = (classical_res["fuelCost"] - quantum_res["fuelCost"]) / classical_res["fuelCost"] * 100
        
    # Log to DB
    run = MissionRun(
        origin=request.origin,
        destination=request.destination,
        mass=request.mass,
        classical_delta_v=classical_res["deltaV"],
        quantum_delta_v=quantum_res["deltaV"],
        fuel_saved_percent=fuel_saved
    )
    db.add(run)
    db.commit()
    
    return {
        "classical": classical_res,
        "quantum": quantum_res,
        "metrics": {
            "fuel_saved_percent": round(fuel_saved, 2)
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
