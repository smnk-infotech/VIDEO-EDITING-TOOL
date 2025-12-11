import subprocess

def run_ffmpeg_command(command: list):
    """
    Wrapper to run ffmpeg commands safely.
    """
    try:
        subprocess.run(command, check=True, capture_output=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg error: {e.stderr}")
        return False
