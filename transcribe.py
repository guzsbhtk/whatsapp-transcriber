import sys
import os
import ssl
import whisper
import certifi

DEBUG = True  # Set to False to disable debug logs

def debug_log(message):
    if DEBUG:
        print(f"🛠️ DEBUG: {message}")

# Ensure the use of updated SSL certificates
ssl._create_default_https_context = ssl._create_unverified_context
ssl_context = ssl.create_default_context()
ssl_context.load_verify_locations(certifi.where())

debug_log("🔥 Starting transcription process")

# Check if an audio file was provided as a parameter
if len(sys.argv) < 2:
    print("❌ Error: No audio file provided for transcription.")
    print(f"🛠️ DEBUG: Received parameters: {sys.argv}")
    sys.exit(1)

# Extract the audio file name from the command-line arguments
input_file = sys.argv[1]
full_path = os.path.abspath(input_file)
debug_log(f"📂 Received input file: {input_file}")
debug_log(f"📂 Full file path: {full_path}")

# Check if the input file exists
if not os.path.exists(input_file):
    print(f"❌ Error: The file {input_file} was not found.")
    sys.exit(1)
debug_log(f"✅ The file {input_file} was found!")

# Load the Whisper model with medium accuracy
debug_log("⏳ Loading Whisper model (medium)...")
try:
    model = whisper.load_model("medium")
    debug_log("✅ Model loaded successfully!")
except Exception as e:
    debug_log(f"❌ Error loading the model: {e}")
    sys.exit(1)

# Transcribe the audio
try:
    debug_log(f"🎙️ Starting transcription for {input_file}...")
    result = model.transcribe(input_file)  # Language set to automatic detection
    debug_log("✅ Transcription completed successfully!")

    # Print the transcribed text
    print(result["text"])

    # Delete the file after processing
    os.remove(input_file)
    debug_log(f"🗑️ File {input_file} deleted successfully!")
except Exception as e:
    print(f"❌ Error during transcription: {e}")
    debug_log(f"❌ Detailed error: {e}")
    sys.exit(1)