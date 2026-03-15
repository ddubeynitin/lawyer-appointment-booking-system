const express = require("express");
const router = express.Router();

// Test routes
router.get("/keep-alive", (req, res) => {
  res.status(200).json({ message: "Server is alive!" });
});

module.exports = router;