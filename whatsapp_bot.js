const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const { exec } = require("child_process");

// Paths and tools settings (using generic commands from the PATH)
const PYTHON_PATH = "python3"; // Will use the Python interpreter from the active environment
const FFMPEG_PATH = "ffmpeg";  // Ensure ffmpeg is installed and available in the PATH
const DEBUG = true; // Set to false to disable debug logs
const SESSION_FILE = "session.json";
const RESET_INTERVAL_DAYS = 14;

// Debug function
function debugLog(message) {
    if (DEBUG) console.log(`🛠️ DEBUG: ${message}`);
}

// Session management - reset every 14 days
if (fs.existsSync(SESSION_FILE)) {
    const sessionData = JSON.parse(fs.readFileSync(SESSION_FILE, "utf8"));
    const lastLogin = new Date(sessionData.lastLogin);
    const now = new Date();
    const diffDays = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
    if (diffDays >= RESET_INTERVAL_DAYS) {
        console.log("🔄 Two weeks have passed since the last login. Resetting session...");
        fs.rmSync(".wwebjs_auth", { recursive: true, force: true });
        fs.unlinkSync(SESSION_FILE);
    }
}

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false,
        executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    }
});


client.on("qr", qr => {
    console.log("📌 Scan the QR code to connect:");
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("✅ Bot is connected to WhatsApp!");
    fs.writeFileSync(SESSION_FILE, JSON.stringify({ lastLogin: new Date().toISOString() }), "utf8");
});

// Queue system for processing audio files
const audioQueue = [];
let isProcessing = false;

function processQueue() {
    if (isProcessing || audioQueue.length === 0) return;
    isProcessing = true;

    // Extract filePath and sender from the next item in the queue
    const { filePath, sender } = audioQueue.shift();
    debugLog(`⏳ Processing file ${filePath} from user ${sender}`);

    // Execute transcription script using Python
    exec(`${PYTHON_PATH} transcribe.py ${filePath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Transcription error: ${error.message}`);
        } else {
            if (stderr && !stderr.includes("FP16 is not supported on CPU")) {
                console.error(`⚠️ Python warning: ${stderr}`);
            }
            const transcription = stdout.trim();
            console.log(`📜 Transcription (${sender}): ${transcription}`);
        }

        // Delete the file after processing, if it exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            debugLog(`🗑️ File ${filePath} deleted`);
        } else {
            debugLog(`🗑️ File ${filePath} was already deleted`);
        }

        isProcessing = false;
        processQueue(); // Process next file in queue
    });
}

// Function to convert OGG file to MP3 and add it to the queue
function convertAndQueue(inputFile, sender) {
    const mp3File = inputFile.replace(".ogg", ".mp3");
    debugLog(`⏳ Converting file ${inputFile} to MP3...`);

    exec(`${FFMPEG_PATH} -i ${inputFile} -acodec libmp3lame ${mp3File} -y`, (err, stdout, stderr) => {
        if (err) {
            console.error("❌ FFmpeg conversion error:", err.message);
            return;
        }
        debugLog(`✅ File successfully converted to MP3: ${mp3File}`);
        fs.unlinkSync(inputFile);
        debugLog(`🗑️ OGG file ${inputFile} deleted`);

        // Add the converted file to the queue
        audioQueue.push({ filePath: mp3File, sender });
        processQueue();
    });
}

// Handle incoming messages
client.on("message", async msg => {
    // Focus on voice messages (ptt)
    if (msg.hasMedia && msg.type === "ptt") {
        console.log(`🎙️ Voice message received from ${msg.from}`);

        const timestamp = Date.now();
        const oggFile = `voice_${timestamp}.ogg`;
        const media = await msg.downloadMedia();
        fs.writeFileSync(oggFile, Buffer.from(media.data, "base64"));
        debugLog(`✅ File saved: ${oggFile}`);

        // Convert the file and add it to the queue
        convertAndQueue(oggFile, msg.from);
    }
});

client.initialize();