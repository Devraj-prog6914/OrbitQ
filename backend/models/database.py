import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

# Use /tmp on Vercel/serverless environments to avoid read-only filesystem errors
db_path = "/tmp/orbit_q.db" if os.environ.get("VERCEL") else "./orbit_q.db"
DATABASE_URL = f"sqlite:///{db_path}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class MissionRun(Base):
    __tablename__ = "mission_runs"

    id = Column(Integer, primary_key=True, index=True)
    origin = Column(String, index=True)
    destination = Column(String, index=True)
    mass = Column(Float)
    classical_delta_v = Column(Float)
    quantum_delta_v = Column(Float)
    fuel_saved_percent = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

def init_db():
    try:
        Base.metadata.create_all(bind=engine)
    except Exception:
        pass
