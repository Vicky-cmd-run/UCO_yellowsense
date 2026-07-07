#!/usr/bin/env python
import os
import sys
import subprocess

def main():
    print("Running database seeding...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    api_dir = os.path.join(project_root, "apps", "api")
    
    # Run python -m app.db.seed
    sys.path.insert(0, api_dir)
    try:
        from app.db.seed import SessionLocal, seed_db
        db = SessionLocal()
        try:
            seed_db(db)
        finally:
            db.close()
    except Exception as e:
        print(f"Error importing app modules: {e}. Falling back to subprocess...")
        env = os.environ.copy()
        env["PYTHONPATH"] = api_dir
        result = subprocess.run([sys.executable, "-m", "app.db.seed"], cwd=api_dir, env=env)
        sys.exit(result.returncode)

if __name__ == "__main__":
    main()
