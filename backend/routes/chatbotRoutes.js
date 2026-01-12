const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// -------------------- Gemini Init -------------------- //
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// -------------------- Medicine Routes -------------------- //
router.get('/medicines', chatbotController.getMedicines);
router.post('/medicines', chatbotController.createMedicine);
router.put('/medicines/:id', chatbotController.updateMedicine);
router.delete('/medicines/:id', chatbotController.deleteMedicine);
router.get('/categories', chatbotController.getMedicineCategories);

// -------------------- Chatbot AI Route -------------------- //
router.post('/chat', async (req, res) => {
  try {
    const { messages = [], language = 'English' } = req.body;

    const langPrompt =
      language === 'Hindi'
        ? 'Respond in Hindi.'
        : language === 'Punjabi'
        ? 'Respond in Punjabi.'
        : 'Respond in English.';

    const prompt = `
You are a medical AI assistant.
${langPrompt}

Rules:
- Do NOT prescribe medicines
- Suggest only common OTC options
- Give general guidance only

If medicines are suggested, return JSON ONLY:

{
  "medicines": [],
  "doctorType": "",
  "advice": ""
}

User message:
${messages.map(m => m.text).join('\n')}
`;

    const result = await model.generateContent(prompt);
    const aiText = result.response.text();

    let medicines = [];
    let doctorType = 'general';
    let advice = aiText;

    try {
      const jsonMatch = aiText.match(/{[\s\S]*}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        medicines = parsed.medicines || [];
        doctorType = parsed.doctorType || 'general';
        advice = parsed.advice || aiText;
      }
    } catch {
      // fallback to text
    }

    res.json({
      text: advice,
      medicines,
      doctorType,
    });

  } catch (error) {
    console.error('Gemini Error:', error);
    res.status(500).json({
      error: 'Failed to get AI response',
    });
  }
});

module.exports = router;
