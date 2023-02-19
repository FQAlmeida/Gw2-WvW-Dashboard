import subprocess

def start():
    subprocess.run(["poetry", "run", "streamlit", "run", "gw2_wvw_dashboard/Main.py"])