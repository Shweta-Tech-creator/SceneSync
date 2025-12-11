const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const modelFlash = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await modelFlash.generateContent("Hello");
        console.log("gemini-flash-latest works:", result.response.text());
    } catch (error) {
        console.error("gemini-flash-latest failed:", error.message);
    }
}

listModels();
