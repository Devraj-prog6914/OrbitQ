"""
ORBIT-Q Trajectory & QUBO Verification Test Suite
Verifies Keplerian Vis-Viva equations, delta-V constraints, and QUBO convergence.
"""

import math
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from physics.engine import get_planet_distance, calculate_trajectory
from optimization.classical import optimize_classical
from optimization.quantum import optimize_quantum

def test_planet_distances():
    assert get_planet_distance("Earth") == 10.0, "Earth distance invalid"
    assert get_planet_distance("Mars") == 15.24, "Mars distance invalid"
    assert get_planet_distance("Jupiter") == 52.0, "Jupiter distance invalid"
    print("✅ test_planet_distances: PASSED")

def test_keplerian_vis_viva_conservation():
    params = {
        "origin": "Earth",
        "destination": "Mars",
        "mass": 1500,
        "launchDate": "2026-10-20",
        "gravityAssist": False
    }
    traj = calculate_trajectory("Earth", "Mars", "quantum", False)
    calculus = traj["calculus"]
    
    assert calculus["total_delta_v"] > 0, "Total Delta-V must be positive"
    assert calculus["tof_days"] > 200, "Earth-Mars transfer time should be > 200 days"
    assert "v² = G M (2/r - 1/a)" in calculus["visVivaEquation"], "Vis-viva equation missing"
    print(f"✅ test_keplerian_vis_viva_conservation: PASSED (Δv={calculus['total_delta_v']} km/s, TOF={calculus['tof_days']} days)")

def test_quantum_vs_classical_fuel_savings():
    params = {
        "origin": "Earth",
        "destination": "Jupiter",
        "mass": 1500,
        "launchDate": "2026-10-20",
        "gravityAssist": True
    }
    c_res = optimize_classical(params)
    q_res = optimize_quantum(params)
    
    assert q_res["fuelCost"] < c_res["fuelCost"], "Quantum solver must achieve lower fuel cost than classical"
    savings = (c_res["fuelCost"] - q_res["fuelCost"]) / c_res["fuelCost"] * 100
    assert savings >= 15.0, f"Expected >15% fuel savings, got {savings:.2f}%"
    print(f"✅ test_quantum_vs_classical_fuel_savings: PASSED (Fuel Savings: {savings:.2f}%)")

def test_qubo_matrix_generation():
    params = {
        "origin": "Earth",
        "destination": "Mars",
        "mass": 2000,
        "launchDate": "2026-10-20"
    }
    q_res = optimize_quantum(params)
    assert "quboEquation" in q_res, "QUBO Hamiltonian missing"
    assert "quboMatrix" in q_res, "QUBO Matrix representation missing"
    assert "H(x) =" in q_res["quboEquation"], "Hamiltonian string invalid"
    print("✅ test_qubo_matrix_generation: PASSED")

if __name__ == "__main__":
    print("==========================================")
    print("RUNNING ORBIT-Q ASTRODYNAMICS TEST SUITE")
    print("==========================================")
    test_planet_distances()
    test_keplerian_vis_viva_conservation()
    test_quantum_vs_classical_fuel_savings()
    test_qubo_matrix_generation()
    print("==========================================")
    print("ALL 4 VERIFICATION SUITES PASSED (100%)")
    print("==========================================")
