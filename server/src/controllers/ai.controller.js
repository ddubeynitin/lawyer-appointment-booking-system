const {
  generateLegalAssistantResponse,
  runSelfTest,
} = require("../services/aiService");

const generateAiResponse = async (req, res) => {
  try {
    const { prompt, model, config } = req.body;

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await generateLegalAssistantResponse({
      prompt,
      model,
      config,
    });

    res.status(200).json({
      message: "AI response generated successfully",
      text: result.text,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || "Failed to generate AI response",
    });
  }
};

const aiSelfTest = async (req, res) => {
  try {
    const text = await runSelfTest();

    res.status(200).json({
      message: "AI service is working",
      text,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || "AI service self-test failed",
    });
  }
};

module.exports = {
  generateAiResponse,
  aiSelfTest,
};
