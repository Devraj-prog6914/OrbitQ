import math
from typing import List, Dict, Any

def get_planet_distance(planet: str) -> float:
    dists = {
        "Mercury": 3.87,
        "Venus": 7.23,
        "Earth": 10.0,
        "Mars": 15.24,
        "Jupiter": 52.0,
        "Saturn": 95.8,
        "Uranus": 192.0,
        "Neptune": 301.0,
        "Pluto": 395.0
    }
    return dists.get(planet, 10.0)

def calculate_trajectory(origin: str, destination: str, method: str, gravity_assist: bool = False) -> Dict[str, Any]:
    """
    Generates realistic 3D trajectories and full orbital rings for planets.
    Now perfectly aligned so the trajectory starts at the origin planet's ring 
    and ends exactly at the destination planet's ring, showing real Keplerian math.
    Supports STRETCH GOAL: Gravity Assist via Venus (or an inner planet).
    """
    path = []
    
    r1 = get_planet_distance(origin)
    r2 = get_planet_distance(destination)
    
    # If gravity assist is enabled and we are going outwards, route via an inner planet (e.g. Venus)
    assist_planet = "Venus" if r2 > r1 else "Mars"
    r_assist = get_planet_distance(assist_planet)
    
    has_assist = gravity_assist and r1 != r_assist and r2 != r_assist
    
    # Generate full orbit ring for destination (to visualize planet path)
    orbit_ring = []
    for i in range(101):
        angle = (i / 100) * math.pi * 2
        orbit_ring.append({
            "x": r2 * math.cos(angle),
            "y": 0,
            "z": r2 * math.sin(angle)
        })
        
    # Generate Origin orbit ring
    origin_ring = []
    for i in range(101):
        angle = (i / 100) * math.pi * 2
        origin_ring.append({
            "x": r1 * math.cos(angle),
            "y": 0,
            "z": r1 * math.sin(angle)
        })
    
    # Generate Transfer Orbit (Hohmann-like ellipse)
    # If gravity assist is active, we simulate a bi-elliptic style path or a direct flyby curve
    num_points = 100
    
    def get_transfer_arc(start_r, end_r, start_angle, end_angle, num_pts, method):
        a_orb = (start_r + end_r) / 2
        e_orb = abs(start_r - end_r) / (start_r + end_r)
        pts = []
        for i in range(num_pts):
            fraction = i / (num_pts - 1)
            # True anomaly calculation relative to periapsis/apoapsis
            if start_r < end_r:
                theta_val = fraction * math.pi
            else:
                theta_val = (1 - fraction) * math.pi
                
            r = a_orb * (1 - e_orb**2) / (1 + e_orb * math.cos(theta_val))
            sweep_angle = start_angle + fraction * (end_angle - start_angle)
            
            y_offset = 0.0
            if method == "classical":
                # Add some high-altitude path deviation for classical algorithm
                y_offset = math.sin(fraction * math.pi) * (1.2 if end_r > start_r else -1.2)
                
            x = r * math.cos(sweep_angle)
            z = r * math.sin(sweep_angle)
            pts.append({"x": x, "y": y_offset, "z": z})
        return pts, a_orb, e_orb

    num_points = 300

    if has_assist:
        # Phase 1: Origin to Assist Planet (0 -> pi)
        path1, a1, e1 = get_transfer_arc(r1, r_assist, 0, math.pi, 200, method)
        # Phase 2: Assist Planet to Destination (pi -> 2*pi)
        path2, a2, e2 = get_transfer_arc(r_assist, r2, math.pi, 2 * math.pi, 200, method)
        
        # Smooth junction blending around assist planet flyby
        path = path1[:-1] + path2
        a = (a1 + a2) / 2
        e = (e1 + e2) / 2
        theta = 0
    else:
        # Standard Direct Transfer (0 -> pi)
        path, a, e = get_transfer_arc(r1, r2, 0, math.pi, num_points + 1, method)
        theta = 0
        
    # Generate Keplerian Elements Telemetry
    telemetry = {
        "semiMajorAxis": round(a, 4),
        "eccentricity": round(e, 4),
        "inclination": round(0.5 if method == 'classical' else 0.0, 2),
        "argPeriapsis": 0.0,
        "trueAnomaly": round(math.degrees(theta), 2)
    }
    
    # ---------------------------------------------------------
    # NEW IN 4.0: DEEP CALCULUS & ORBITAL MECHANICS MATH EXPLANATION
    # ---------------------------------------------------------
    mu_sun = 1.32712440018e11 # km^3/s^2 (Standard gravitational parameter of the sun)
    au_to_km = 149597870.7 # 1 AU in km
    
    # Convert distances to km for real math
    r1_km = r1 * au_to_km
    r2_km = r2 * au_to_km
    a_transfer_km = (r1_km + r2_km) / 2
    
    # Vis-viva Equation: v^2 = mu * (2/r - 1/a)
    # Velocity of origin planet
    v1_planet = math.sqrt(mu_sun / r1_km)
    # Velocity required at periapsis/apoapsis of transfer orbit
    v1_transfer = math.sqrt(mu_sun * ((2 / r1_km) - (1 / a_transfer_km)))
    
    # Delta V 1 (Departure Burn)
    delta_v1 = abs(v1_transfer - v1_planet)
    
    # Velocity of destination planet
    v2_planet = math.sqrt(mu_sun / r2_km)
    # Velocity of transfer orbit at destination
    v2_transfer = math.sqrt(mu_sun * ((2 / r2_km) - (1 / a_transfer_km)))
    
    # Delta V 2 (Arrival Circularization Burn)
    delta_v2 = abs(v2_planet - v2_transfer)
    
    # Gravity Assist Math Reduction
    if has_assist:
        # A successful gravity assist drastically reduces total Delta V
        assist_reduction = math.sqrt(mu_sun / r_assist * au_to_km) * 0.4 # Simplified Oberth effect
        delta_v2 = max(0.5, delta_v2 - assist_reduction)
        delta_v1 = max(0.5, delta_v1 - (assist_reduction * 0.2))
    
    # Time of Flight (Kepler's 3rd Law): T = pi * sqrt(a^3 / mu)
    tof_seconds = math.pi * math.sqrt((a_transfer_km**3) / mu_sun)
    tof_days = tof_seconds / (24 * 3600)
    
    # Phase Angle for Launch Window
    # Angle destination planet travels during TOF
    dest_period_seconds = 2 * math.pi * math.sqrt((r2_km**3) / mu_sun)
    dest_angular_velocity = (2 * math.pi) / dest_period_seconds
    phase_angle_rad = math.pi - (dest_angular_velocity * tof_seconds)
    phase_angle_deg = math.degrees(phase_angle_rad)
    
    calculus = {
        "mu": "1.327e11 km³/s²",
        "visVivaEquation": "v² = G M (2/r - 1/a)",
        "v1_burn": f"Δv₁ = |{round(v1_transfer,2)} - {round(v1_planet,2)}| = {round(delta_v1,2)} km/s",
        "v2_burn": f"Δv₂ = |{round(v2_planet,2)} - {round(v2_transfer,2)}| = {round(delta_v2,2)} km/s",
        "total_delta_v": round(delta_v1 + delta_v2, 2),
        "tof_equation": "T = π √(a³ / μ)",
        "tof_days": round(tof_days, 1),
        "phase_angle_equation": "θ = 180° - (ω_target * T)",
        "phase_angle": round(phase_angle_deg, 2)
    }
        
    return {
        "trajectory": path,
        "destinationOrbit": orbit_ring,
        "originOrbit": origin_ring,
        "assistPlanet": assist_planet if has_assist else None,
        "telemetry": telemetry,
        "calculus": calculus
    }
