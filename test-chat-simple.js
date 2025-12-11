const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

async function testGemini() {
    try {
        const envPath = path.join(__dirname, '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY=(.*)/);

        if (!match) {
            console.error('Could not find GEMINI_API_KEY in .env.local');
            return;
        }

        const apiKey = match[1].trim();
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        console.log('Testing gemini-2.5-flash...');
        const result = await model.generateContent('Hello, are you working?');
        const response = await result.response;
        console.log('Success:', response.text());

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testGemini();
