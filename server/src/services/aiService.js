const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const LEGAL_ASSISTANT_SYSTEM_PROMPT =
  "You are JustifAi's legal assistant. Answer only: 1) legal questions about laws, FIR, courts, crimes, contracts, disputes, and rights, or 2) JustifAi platform questions such as booking appointments, using dashboards, requests, lawyer search, profiles, and related app features. For anything else, reply exactly: \"I'm a legal assistant. Please ask legal-related questions only.\"";

const getApiKey = () => process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

const createAiClient = () => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error(
      "Missing Gemini API key. Set GEMINI_API_KEY or GOOGLE_API_KEY in the environment.",
    );
  }

  return new GoogleGenAI({ apiKey });
};

const normalizeTextResponse = (response) => {
  if (typeof response?.text === "string" && response.text.trim()) {
    return response.text.trim();
  }

  return "";
};

const buildAiServiceError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const mapAiProviderError = (error) => {
  const rawMessage =
    error?.message ||
    error?.error?.message ||
    error?.response?.data?.error?.message ||
    "";
  const normalizedMessage = String(rawMessage).toLowerCase();

  if (
    normalizedMessage.includes("resource_exhausted") ||
    normalizedMessage.includes("quota exceeded") ||
    normalizedMessage.includes("\"code\":429") ||
    normalizedMessage.includes("status\":\"resource_exhausted\"")
  ) {
    return buildAiServiceError(
      "AI assistant is busy right now. Please wait a moment and try again.",
      429,
    );
  }

  if (
    normalizedMessage.includes("rate limit") ||
    normalizedMessage.includes("too many requests")
  ) {
    return buildAiServiceError(
      "Too many AI requests right now. Please try again shortly.",
      429,
    );
  }

  if (normalizedMessage.includes("missing gemini api key")) {
    return buildAiServiceError(
      "AI assistant is not configured correctly right now.",
      500,
    );
  }

  return buildAiServiceError(
    "AI assistant is unavailable right now. Please try again later.",
    500,
  );
};

const generateText = async ({
  prompt,
  model = DEFAULT_MODEL,
  config,
} = {}) => {
  if (!prompt || !String(prompt).trim()) {
    throw new Error("Prompt is required to generate AI content.");
  }

  const ai = createAiClient();
  let response;

  try {
    response = await ai.models.generateContent({
      model,
      contents: String(prompt).trim(),
      ...(config ? { config } : {}),
    });
  } catch (error) {
    throw mapAiProviderError(error);
  }

  return {
    text: normalizeTextResponse(response),
    raw: response,
  };
};

const generateLegalAssistantResponse = async ({
  prompt,
  model = DEFAULT_MODEL,
  config,
} = {}) => {
  if (!prompt || !String(prompt).trim()) {
    throw new Error("Prompt is required to generate AI content.");
  }

  return generateText({
    prompt: `${LEGAL_ASSISTANT_SYSTEM_PROMPT}\n\nUser query: ${String(prompt).trim()}`,
    model,
    config: {
      temperature: 0.2,
      ...(config || {}),
    },
  });
};

const runSelfTest = async () => {
  const { text } = await generateLegalAssistantResponse({
    prompt: "How do I book an appointment on JustifAi?",
    config: {
      temperature: 0,
      maxOutputTokens: 80,
    },
  });

  return text;
};

module.exports = {
  DEFAULT_MODEL,
  LEGAL_ASSISTANT_SYSTEM_PROMPT,
  createAiClient,
  generateText,
  generateLegalAssistantResponse,
  mapAiProviderError,
  runSelfTest,
};

if (require.main === module) {
  runSelfTest()
    .then((text) => {
      console.log(text || "AI service test completed with an empty response.");
    })
    .catch((error) => {
      console.error(`AI service self-test failed: ${error.message}`);
      process.exitCode = 1;
    });
}
