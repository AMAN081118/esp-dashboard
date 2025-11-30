import subprocess
import time
import os

def run_backend():
    return subprocess.Popen(
        ["npm", "run", "start"],
        cwd=os.path.join(os.getcwd(), "backend"),
        shell=True
    )

def run_frontend():
    return subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=os.path.join(os.getcwd(), "frontend"),
        shell=True
    )

if __name__ == "__main__":
    print("Starting backend...")
    backend_proc = run_backend()

    # wait a bit so backend starts before frontend
    time.sleep(2)

    print("Starting frontend...")
    frontend_proc = run_frontend()

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("Shutting down...")
        backend_proc.terminate()
        frontend_proc.terminate()
