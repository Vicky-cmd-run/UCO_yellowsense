#!/usr/bin/env python
import os
import sys
import subprocess

def main():
    print("Resetting database to initial demo state...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    api_dir = os.path.join(project_root, "apps", "api")
    
    sys.path.insert(0, api_dir)
    try:
        from app.db.seed import SessionLocal, Base, engine, seed_db
        print("Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        print("Recreating all tables...")
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_db(db)
        finally:
            db.close()
        print("Demo database successfully reset!")
    except Exception as e:
        print(f"Error importing app modules: {e}. Falling back to subprocess...")
        env = os.environ.copy()
        env["PYTHONPATH"] = api_dir
        result = subprocess.run([sys.executable, "-m", "app.db.seed", "--reset"], cwd=api_dir, env=env)
        sys.exit(result.returncode)

if __name__ == "__main__":
    main()
