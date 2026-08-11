# ORBIT-Q 🚀
**Quantum Optimized Deep Space Mission Planner**

ORBIT-Q is a hackathon-winning full-stack application that demonstrates quantum-assisted deep space trajectory planning. It features a React Three.js frontend for premium 3D visualization and a FastAPI backend simulating Classical (Differential Evolution) vs. Quantum (QUBO / Simulated Annealing) optimization for orbital transfers.

## Features
- **Interactive 3D Solar System**: Real-time rendering of Earth, Mars, and spacecraft trajectories.
- **Quantum vs Classical Comparison**: Compare Delta-V and Fuel consumption using standard and quantum-inspired algorithms.
- **Mission Dashboard**: Beautiful glassmorphism UI with framer-motion micro-animations.
- **Database Integration**: SQLite backend for tracking mission runs.

## Setup Instructions

### 1. Backend (Python/FastAPI)
Open a terminal in the `backend` directory:
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
The API will run on `http://localhost:8000`.

### 2. Frontend (React/Vite)
Open a new terminal in the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
The dashboard will run on `http://localhost:5173`.
