"""
Clean up space on C: drive used by Python/npm so you can train again.
Run from project root: python scripts/clean_c_drive.py
"""
import os
import shutil
import subprocess
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Freed = 0

def dir_size(path):
    try:
        if not os.path.isdir(path):
            return 0
        total = 0
        for entry in os.scandir(path):
            try:
                if entry.is_dir(follow_symlinks=False):
                    total += dir_size(entry.path)
                else:
                    total += entry.stat(follow_symlinks=False).st_size
            except OSError:
                pass
        return total
    except OSError:
        return 0

def safe_rmtree(path, name):
    global Freed
    if not os.path.isdir(path):
        print(f"  [SKIP] {name}: not found")
        return
    try:
        size = dir_size(path)
        shutil.rmtree(path, ignore_errors=True)
        Freed += size
        print(f"  [OK] {name}: freed ~{size // (1024*1024)} MB")
    except Exception as e:
        print(f"  [FAIL] {name}: {e}")

def main():
    print("=" * 60)
    print("Cleaning C: drive (pip / npm / project caches)")
    print("=" * 60)

    # 1. Pip cache (biggest win)
    pip_cache = os.path.expandvars(r"%LOCALAPPDATA%\pip\Cache")
    if os.path.isdir(pip_cache):
        size_before = dir_size(pip_cache)
        print(f"\n1. Pip cache: {pip_cache} (~{size_before // (1024*1024)} MB)")
        safe_rmtree(pip_cache, "pip Cache")
    else:
        print("\n1. Pip cache: not found (OK)")

    # 2. Pip purge via command (cleans more)
    print("\n2. Running: pip cache purge")
    try:
        subprocess.run([sys.executable, "-m", "pip", "cache", "purge"], check=False, capture_output=True)
        print("  [OK] pip cache purge done")
    except Exception as e:
        print("  [SKIP]", e)

    # 3. Npm cache
    npm_cache = os.path.expandvars(r"%APPDATA%\npm-cache")
    if os.path.isdir(npm_cache):
        size_before = dir_size(npm_cache)
        print(f"\n3. Npm cache: {npm_cache} (~{size_before // (1024*1024)} MB)")
        safe_rmtree(npm_cache, "npm-cache")
    else:
        print("\n3. Npm cache: not found (OK)")

    # 4. Project __pycache__ and .pytest_cache
    to_remove = []
    for root, dirs, _ in os.walk(PROJECT_ROOT, topdown=True):
        dirs[:] = [d for d in dirs if d not in ("node_modules", ".git", "venv", ".venv")]
        for folder in ["__pycache__", ".pytest_cache", ".mypy_cache"]:
            if folder in dirs:
                to_remove.append(os.path.join(root, folder))
    for path in to_remove:
        if os.path.isdir(path):
            safe_rmtree(path, os.path.relpath(path, PROJECT_ROOT))

    print("\n" + "=" * 60)
    print(f"Total freed (approx): {Freed // (1024*1024)} MB")
    print("=" * 60)
    print("\nTo avoid filling C: again, use D: for caches (run in PowerShell):")
    print('  $env:PIP_CACHE_DIR = "D:\\pip_cache"')
    print('  $env:NPM_CONFIG_CACHE = "D:\\npm_cache"')
    print("  Then run: pip install -r backend/requirements.txt")
    print("  And run: python backend/scripts/retrain_heart_model.py")
    print()

if __name__ == "__main__":
    main()
