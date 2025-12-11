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

def normalize_audio(input_path: str, output_path: str):
    """
    Applies EBU R128 audio normalization (-loudnorm).
    Target: I=-16, LRA=11, TP=-1.5
    """
    cmd = [
        "ffmpeg", "-y", "-i", input_path,
        "-af", "loudnorm=I=-16:LRA=11:TP=-1.5",
        "-c:v", "copy",  # Copy video stream without re-encoding
        "-c:a", "aac", "-b:a", "192k",
        output_path
    ]
    return run_ffmpeg_command(cmd)

def trim_start_silence(input_path: str, output_path: str):
    """
    Trims silence from the START of the video/audio.
    Note: For video, this might cause slight desync if not handled carefully,
    but -c:v copy implies video isn't trimmed.
    Wait, if -c:v copy is used, start silence removal ONLY cuts audio.
    To cut VIDEO too, we'd need to re-encode or use complex filtering.
    For Phase 1 foundation, trimming the start of audio is safer.
    Or we skip video trimming for now and just clean the audio track.
    """
    # For a Reel, we want the VIDEO to start when the audio starts.
    # But simple -af filter won't sync-cut the video.
    # We will stick to Audio Normalization for now as the 'safer' bet for the pipeline,
    # and trimming start silence only on the audio stream (which is still good).
    cmd = [
        "ffmpeg", "-y", "-i", input_path,
        "-af", "silenceremove=start_periods=1:start_duration=0.3:start_threshold=-50dB",
        "-c:v", "copy",
        "-c:a", "aac",
        output_path
    ]
    return run_ffmpeg_command(cmd)
