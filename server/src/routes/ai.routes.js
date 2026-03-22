const express = require("express");
const router = express.Router();
const {
  generateAiResponse,
  aiSelfTest,
} = require("../controllers/ai.controller");

router.post("/generate", generateAiResponse);
router.get("/self-test", aiSelfTest);

module.exports = router;
