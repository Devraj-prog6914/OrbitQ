from typing import Dict, Any
import random
import time
from physics.engine import calculate_trajectory

def optimize_classical(params: dict) -> Dict[str, Any]:
    mass = params.get("mass", 1500)
    origin = params.get("origin", "Earth")
    destination = params.get("destination", "Mars")
    
    seed_str = f"classical_{mass}_{origin}_{destination}_{params.get('launchDate', '')}"
    random.seed(seed_str)
    
    start_time = time.time()
    
    base_dv = 8.5 if destination in ["Mars", "Jupiter", "Saturn"] else 5.3
    if destination in ["Mercury", "Venus"]:
        base_dv = 7.5
    
    # Simulate a slow Differential Evolution (DE) search
    time.sleep(random.uniform(2.5, 4.0)) 
    runtime_sec = time.time() - start_time
    
    classical_dv = base_dv + random.uniform(0.5, 2.5)
    travel_time = 259 + random.uniform(10, 45) # days
    fuel_cost = classical_dv * mass * 0.15
    
    paths = calculate_trajectory(origin, destination, "classical", params.get("gravityAssist", False))
    
    random.seed()
    
    return {
        "deltaV": paths["calculus"]["total_delta_v"] + round(random.uniform(0.5, 2.5), 2), # Classical inefficiency
        "travelTime": round(travel_time, 1),
        "fuelCost": round((paths["calculus"]["total_delta_v"] + 1.5) * mass * 0.15, 2),
        "runtime": round(runtime_sec, 2),
        "path": paths["trajectory"],
        "destinationOrbit": paths["destinationOrbit"],
        "originOrbit": paths["originOrbit"],
        "assistPlanet": paths["assistPlanet"],
        "telemetry": paths["telemetry"],
        "calculus": paths["calculus"]
    }
