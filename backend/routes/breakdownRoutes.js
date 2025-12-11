const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini if key exists
let genAI = null;
let model = null;

if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
}

// Mock AI Analysis Logic (Fallback)
const analyzeSceneMock = (text) => {
    const lowerText = text.toLowerCase();
    const result = {
        shotType: [],
        movement: [],
        mood: [],
        characters: [],
        props: [],
        sound: [],
        sceneDynamics: [],
        purposeNotes: [],
        lighting: []
    };

    // Shot Types
    if (lowerText.includes('close up') || lowerText.includes('close-up') || lowerText.includes('face')) result.shotType.push('Close-Up');
    if (lowerText.includes('wide') || lowerText.includes('landscape') || lowerText.includes('room')) result.shotType.push('Wide Shot');
    if (lowerText.includes('mid') || lowerText.includes('waist')) result.shotType.push('Mid Shot');
    if (result.shotType.length === 0) result.shotType.push('Mid Shot'); // Default

    // Camera Movement
    if (lowerText.includes('pan')) result.movement.push('Pan');
    if (lowerText.includes('tilt')) result.movement.push('Tilt');
    if (lowerText.includes('dolly') || lowerText.includes('move in') || lowerText.includes('move out')) result.movement.push('Dolly');
    if (lowerText.includes('static') || lowerText.includes('still')) result.movement.push('Static');
    if (lowerText.includes('handheld') || lowerText.includes('shaky')) result.movement.push('Handheld');
    if (result.movement.length === 0) result.movement.push('Static'); // Default

    // Mood
    if (lowerText.includes('dark') || lowerText.includes('night') || lowerText.includes('shadow')) result.mood.push('Dark/Noir');
    if (lowerText.includes('bright') || lowerText.includes('sun') || lowerText.includes('day')) result.mood.push('Bright/Happy');
    if (lowerText.includes('tense') || lowerText.includes('quiet') || lowerText.includes('nervous')) result.mood.push('Tense');
    if (lowerText.includes('fast') || lowerText.includes('run') || lowerText.includes('chase')) result.mood.push('Action/Fast');
    if (result.mood.length === 0) result.mood.push('Neutral');

    // Characters (Simple Capitalization Detection - very basic)
    const words = text.split(/\s+/);
    const potentialNames = words.filter(w => /^[A-Z][a-z]+$/.test(w) && w.length > 2);
    const commonStarters = ['The', 'A', 'An', 'It', 'He', 'She', 'They', 'We', 'In', 'On', 'At', 'Then', 'Suddenly'];
    result.characters = [...new Set(potentialNames.filter(n => !commonStarters.includes(n)))];

    // Props (Keyword based)
    const commonProps = ['gun', 'phone', 'knife', 'table', 'chair', 'car', 'book', 'glass', 'bottle', 'sword', 'bag', 'computer', 'laptop'];
    result.props = commonProps.filter(p => lowerText.includes(p)).map(p => p.charAt(0).toUpperCase() + p.slice(1));

    // Sound (Keyword based)
    const commonSounds = ['crash', 'bang', 'scream', 'whisper', 'music', 'silence', 'footsteps', 'wind', 'rain', 'thunder'];
    result.sound = commonSounds.filter(s => lowerText.includes(s)).map(s => s.charAt(0).toUpperCase() + s.slice(1));
    if (result.sound.length === 0) result.sound.push('Ambient Noise');

    // Scene Dynamics (Simple inference)
    if (result.mood.includes('Action/Fast') || result.movement.includes('Handheld')) {
        result.sceneDynamics.push('High Energy');
    } else if (result.mood.includes('Tense') || result.mood.includes('Dark/Noir')) {
        result.sceneDynamics.push('Suspenseful');
    } else {
        result.sceneDynamics.push('Balanced');
    }

    // Purpose / Notes
    result.purposeNotes.push('Establish setting and atmosphere.');
    if (result.characters.length > 0) result.purposeNotes.push('Introduce characters.');

    // Lighting (Keyword based)
    const commonLighting = ['dark', 'bright', 'shadow', 'neon', 'sunlight', 'moonlight', 'candle', 'lamp', 'fluorescent', 'dim'];
    result.lighting = commonLighting.filter(l => lowerText.includes(l)).map(l => l.charAt(0).toUpperCase() + l.slice(1));
    if (result.lighting.length === 0) result.lighting.push('Natural/Ambient');

    return result;
};

router.post('/analyze', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ success: false, message: 'Text is required' });
        }

        // Use Gemini if available
        if (model) {
            console.log('Attempting Gemini analysis...');
            try {
                const prompt = `You are a professional cinematographer and script supervisor. Analyze the given scene description and extract the following visual elements in JSON format: 
                - shotType (array of strings, e.g., 'Wide Shot', 'Close Up')
                - movement (array of strings, e.g., 'Pan', 'Dolly')
                - mood (array of strings, e.g., 'Tense', 'Dark')
                - characters (array of strings, names only)
                - props (array of strings)
                - sound (array of strings, e.g., 'Footsteps', 'Wind', 'Silence')
                - sceneDynamics (array of strings, e.g., 'High Energy', 'Slow Burn', 'Chaotic')
                - purposeNotes (array of strings, brief notes on the scene's narrative purpose or technical requirements) 
                - lighting (array of strings, e.g., 'High Contrast', 'Soft', 'Neon', 'Natural') 
                
                Scene Description: "${text}"
                
                Return ONLY the valid JSON object, no markdown formatting.`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                let textResponse = response.text();

                // Clean up markdown code blocks if present
                textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

                console.log('Gemini response received');
                const analysis = JSON.parse(textResponse);
                return res.json({ success: true, analysis, source: 'AI (Google Gemini)' });

            } catch (aiError) {
                console.error('Gemini API Error Details:', aiError.message);
                // Fallback to mock if API fails
                console.log('Falling back to mock analysis...');
            }
        } else {
            console.log('Gemini instance not initialized. Key missing?');
        }

        // Fallback or if no key
        const analysis = analyzeSceneMock(text);

        // Simulate AI delay only if using mock
        setTimeout(() => {
            res.json({ success: true, analysis, source: 'Mock Logic (Fallback)' });
        }, 1000);

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ success: false, message: 'Analysis failed' });
    }
});

module.exports = router;
