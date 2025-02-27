# 📌 WhatsApp Voice Transcriber Bot

**Bot that transcribes WhatsApp voice messages using Whisper.**

This bot listens for WhatsApp voice messages, converts them to text using OpenAI's Whisper model, and replies with the transcription.

---

## 🚀 Features
✅ Listens for WhatsApp voice messages
✅ Converts `.ogg/.opus` to `.mp3` using FFmpeg
✅ Transcribes messages using Whisper (`medium` model)
✅ Replies with the transcribed text
✅ Auto-cleans temporary files after transcription
✅ Session management with auto-reset after 14 days

---

## 📂 Project Structure
```
📦 whatsapp-transcriber
 ┣ 📜 whatsapp_bot.js       # WhatsApp bot implementation (Node.js)
 ┣ 📜 transcribe.py         # Whisper-based transcription (Python)
 ┣ 📜 package.json         # Node.js dependencies
 ┣ 📜 requirements.txt     # Python dependencies
 ┣ 📜 .gitignore           # Files to exclude from Git
 ┗ 📜 README.md            # Project documentation
```

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/guzsbhtk/whatsapp-transcriber.git
cd whatsapp-transcriber
```

### 2️⃣ Install Python dependencies
```bash
python3 -m venv .venv
source .venv/bin/activate  # Mac/Linux
.venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

### 3️⃣ Install Node.js dependencies
```bash
npm install
```

### 4️⃣ Ensure FFmpeg is installed
This project relies on FFmpeg for audio conversion. Install it via:
```bash
brew install ffmpeg  # Mac
sudo apt install ffmpeg  # Ubuntu
winget install ffmpeg  # Windows
```

---

## ▶️ Running the Bot

Start the bot using:
```bash
node whatsapp_bot.js
```

You will see a QR code. Scan it using WhatsApp Web to authenticate.

---

## ⚙️ Configuration
Modify the following paths if needed:
- **In `whatsapp_bot.js`**: Update `executablePath` to match your Chrome location.
- **In `transcribe.py`**: Update the FFmpeg path if necessary.

---

## 🗑️ File Cleanup
- The bot automatically **deletes** temporary audio files (`.ogg` & `.mp3`) after transcription.
- WhatsApp session resets **every 14 days** (configurable in `whatsapp_bot.js`).

---

## 🛠️ Troubleshooting
### Issue: `ModuleNotFoundError: No module named 'whisper'`
🔹 Run: `pip install -r requirements.txt`

### Issue: `FileNotFoundError: No such file or directory: 'ffmpeg'`
🔹 Ensure FFmpeg is installed & accessible (`which ffmpeg` / `ffmpeg -version`)

### Issue: `Python path error when executing transcribe.py`
🔹 Update the `pythonPath` variable in `whatsapp_bot.js` to point to your Python executable.

---

## 📜 License
This project is open-source under the **MIT License**.

---

## 📩 Contact
For issues or contributions, open a GitHub **Issue** or **Pull Request**.

🚀 Happy coding!
