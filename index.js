import express from 'express';
import { Telegraf, Markup } from 'telegraf';

// ✅ Fixed Port
const PORT = 8080;

// ✅ Express Setup
const app = express();

app.get('/', (req, res) => {
    res.send('🤖 Bot is running!');
});

app.listen(PORT, () => {
    console.log(`✅ Server running on fixed port ${PORT}`);
});

// ✅ Fixed Bot Token
const BOT_TOKEN = '86031144761:AAF6Pt7cylensV3646464644664';
const bot = new Telegraf(BOT_TOKEN);

// ✅ TeraBox URL Validation  
const teraboxUrlRegex = /^https:\/\/(terabox\.com|1024terabox\.com|teraboxapp\.com|teraboxlink\.com|terasharelink\.com|terafileshare\.com)\/s\/[A-Za-z0-9-_]+$/;

// ✅ Your Telegram Channel ID  
const CHANNEL_ID = "-1008906645565465"; // 🔹 এখানে আপনার চ্যানেলের আইডি বসান  

// ✅ /start Command  
bot.start((ctx) => {
    const welcomeMessage = '👋 Welcome! Send a TeraBox link to download.';
    const imageUrl = 'https://graph.org/file/4e8a1172e8ba4b7a0bdfa.jpg';

    ctx.replyWithPhoto(
        { url: imageUrl },
        {
            caption: welcomeMessage,
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.url('📌 US ❖ 𝐖𝐃 𝐙𝐎𝐍𝐄 ❖', 'https://t.me/AM_FILMS')]
            ])
        }
    );
});

// ✅ Message Handler  
bot.on('text', async (ctx) => {
    const messageText = ctx.message.text;

    if (!teraboxUrlRegex.test(messageText)) {
        return ctx.reply('❌ Invalid TeraBox link!');
    }

    await ctx.reply('🔄 Processing your link...');

    try {
        // ✅ TeraBox API Call  
        const apiUrl = `https://wdzone-terabox-api.vercel.app/api?url=${encodeURIComponent(messageText)}`;
        const apiResponse = await fetch(apiUrl);
        const apiData = await apiResponse.json();

        if (!apiResponse.ok || !apiData["📜 Extracted Info"]?.length) {
            return ctx.reply('⚠️ Download link not found.');
        }

        const fileInfo = apiData["📜 Extracted Info"][0];
        const downloadLink = fileInfo["🔽 Direct Download Link"];
        const filename = fileInfo["📂 Title"] || `video_${Date.now()}.mp4`;

        // ✅ ফাইল সাইজ ফরম্যাট করুন  
        let fileSize = "Unknown Size";
        let estimatedTime = "N/A";
        if (fileInfo["📏 Size"]) {
            fileSize = fileInfo["📏 Size"]; // সরাসরি API থেকে সাইজ নেওয়া
            estimatedTime = calculateDownloadTime(fileSize);
        }

        // ✅ Image Link  
        const imageUrl = 'https://graph.org/file/120e174a9161afae40914.jpg';

        // ✅ Send Image with Caption & Download Button (একসাথে)  
        const caption = `🎬 **File Processing Done!**\n✅ **Download Link Found:**\n📁 **File:** ${filename}\n⚖ **Size:** ${fileSize}\n⏳ **Estimated Time:** ${estimatedTime}`;

        await ctx.replyWithPhoto(imageUrl, {
            caption: caption,
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.url(`⬇️ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 (${fileSize})`, downloadLink)]
            ])
        });

        // ✅ অটো ফরওয়ার্ড টু চ্যানেল  
        await bot.telegram.sendMessage(CHANNEL_ID, `📥 **New Download Request**\n\n📁 **File:** ${filename}\n⚖ **Size:** ${fileSize}\n⏳ **Estimated Time:** ${estimatedTime}\n🔗 **Download Link:** [Click Here](${downloadLink})`, {
            parse_mode: "Markdown",
            disable_web_page_preview: true
        });

    } catch (error) {
        console.error('API Error:', error);
        ctx.reply('❌ An error occurred while processing your request.');
    }
});

// ✅ ডাউনলোড স্পিড ক্যালকুলেটর ফাংশন  
function calculateDownloadTime(sizeStr) {
    const speedMbps = 10; // 🔹 ইউজারের গড় ইন্টারনেট স্পিড (10 Mbps ধরা হয়েছে)
    const sizeUnits = { "B": 1, "KB": 1024, "MB": 1024 ** 2, "GB": 1024 ** 3 };

    let sizeValue = parseFloat(sizeStr);
    let sizeUnit = sizeStr.replace(/[0-9.]/g, '').trim();

    if (!sizeUnits[sizeUnit]) return "N/A";

    let sizeInBytes = sizeValue * sizeUnits[sizeUnit];
    let downloadTimeSec = (sizeInBytes * 8) / (speedMbps * 1024 * 1024);

    if (downloadTimeSec < 60) return `${Math.round(downloadTimeSec)} sec`;
    else return `${(downloadTimeSec / 60).toFixed(1)} min`;
}

// ✅ Unhandled Errors Handle  
bot.catch((err) => {
    console.error('🤖 Bot Crashed! Error:', err);
});

// ✅ Start Polling  
bot.launch().then(() => {
    console.log('🤖 Bot is running (Polling Mode)...');
}).catch(err => {
    console.error('Bot Launch Error:', err);
});
