# import os
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker, declarative_base, Session
# from typing import Generator

# DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./yellowsense.db")

# # If using SQLite, add check_same_thread=False
# if DATABASE_URL.startswith("sqlite"):
#     engine = create_engine(
#         DATABASE_URL, connect_args={"check_same_thread": False}
#     )
# else:
#     engine = create_engine(DATABASE_URL)

# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()

# def get_db() -> Generator[Session, None, None]:
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from typing import Generator
from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL   # was: os.getenv("DATABASE_URL", "sqlite:///./yellowsense.db")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()