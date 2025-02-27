const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const { exec } = require("child_process");

const PYTHON_PATH = "/Users/oz/PycharmProjects/tree/.venv/bin/python3"; // Ensure this is the correct Python path
const FFMPEG_PATH = "/opt/homebrew/bin/ffmpeg"; // Ensure this is the correct FFmpeg path

const DEBUG = true; // Set to false to disable debug logs

function debugLog(message) {
    if (DEBUG) console.log(`🛠️ DEBUG: ${message}`);
}

// Check which Python version the bot is using
if (DEBUG) {
    exec("which python3", (err, stdout, stderr) => {
        console.log(`🛠️ DEBUG: Python path: ${stdout.trim()}`);
    });
}

const SESSION_FILE = "session.json";
const RESET_INTERVAL_DAYS = 14;

// Reset session every two weeks
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

// Create a WhatsApp Web client instance
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false,
        executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
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

// Function to convert OGG to MP3
function convertToMp3(inputFile, outputFile, callback) {
    debugLog(`⏳ Converting to MP3: ${outputFile}`);
    exec(`${FFMPEG_PATH} -i ${inputFile} -acodec libmp3lame ${outputFile} -y`, (err, stdout, stderr) => {
        if (err) {
            console.error("❌ FFmpeg conversion error:", err.message);
            return callback(err);
        }
        debugLog(`✅ File successfully converted to MP3: ${outputFile}`);
        fs.unlinkSync(inputFile);
        debugLog(`🗑️ OGG file deleted: ${inputFile}`);
        callback(null, outputFile);
    });
}

// Function to execute the transcription script
function transcribeAudio(audioFile, sender, msg) {
    debugLog(`🎙️ Starting transcription for ${audioFile}...`);
    exec(`${PYTHON_PATH} transcribe.py ${audioFile}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Python execution error: ${error.message}`);
            return;
        }
        if (stderr && !stderr.includes("FP16 is not supported on CPU")) { // Ignore FP16 warning
            console.error(`⚠️ Python warning: ${stderr}`);
        }

        const transcription = stdout.trim();
        console.log(`📜 Transcription (${sender}): ${transcription}`);
        msg.reply(`🎙️ Transcription:\n${transcription}`);
    });
}

// Detect voice messages in WhatsApp
client.on("message", async msg => {
    if (msg.hasMedia && msg.type === "ptt") {
        console.log(`🎙️ Voice message received from ${msg.from}`);

        const timestamp = Date.now();
        const oggFile = `voice_${timestamp}.ogg`;
        const mp3File = `voice_${timestamp}.mp3`;
        const media = await msg.downloadMedia();
        fs.writeFileSync(oggFile, Buffer.from(media.data, "base64"));
        debugLog(`✅ Voice file saved: ${oggFile}`);

        convertToMp3(oggFile, mp3File, (err, convertedFile) => {
            if (!err) transcribeAudio(convertedFile, msg.from, msg);
        });
    }
});

client.initialize();
