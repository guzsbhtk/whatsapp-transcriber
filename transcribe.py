import sys
import os
import ssl
import whisper
import certifi

DEBUG = False  # Change to False to disable debug logging

import warnings
warnings.simplefilter("ignore")


def debug_log(message):
    if DEBUG:
        print(f"🛠️ DEBUG: {message}")

# Ensure updated SSL certificates
ssl._create_default_https_context = ssl._create_unverified_context
ssl_context = ssl.create_default_context()
ssl_context.load_verify_locations(certifi.where())

debug_log("🔥 Starting transcription process")

# Check if an audio file was provided as an argument
if len(sys.argv) < 2:
    print("❌ Error: No audio file provided for transcription.")
    print(f"🛠️ DEBUG: Received parameters: {sys.argv}")
    sys.exit(1)

# Get the input audio file from arguments
input_file = sys.argv[1]
full_path = os.path.abspath(input_file)
debug_log(f"📂 Received input file: {input_file}")
debug_log(f"📂 Full file path: {full_path}")

# Verify if the input file exists
if not os.path.exists(input_file):
    print(f"❌ Error: File {input_file} not found.")
    sys.exit(1)
debug_log(f"✅ File {input_file} found!")

# Load Whisper model (medium accuracy level)
debug_log("⏳ Loading Whisper model (medium)...")
try:
    model = whisper.load_model("medium")
    debug_log("✅ Model loaded successfully!")
except Exception as e:
    debug_log(f"❌ Error loading model: {e}")
    sys.exit(1)

# Transcribe audio
try:
    debug_log(f"🎙️ Starting transcription of {input_file}...")
    result = model.transcribe(input_file)
    debug_log("✅ Transcription completed successfully!")

    # Output transcription result
    print(result["text"])

    # Delete file after transcription
    os.remove(input_file)
    debug_log(f"🗑️ File {input_file} successfully deleted!")
except Exception as e:
    print(f"❌ Transcription error: {e}")
    debug_log(f"❌ Detailed error: {e}")
    sys.exit(1)