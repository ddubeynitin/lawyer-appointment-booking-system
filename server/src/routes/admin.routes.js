const express = require("express");
const router = express.Router();

const {
  loginAdmin,
  createAdmin,
  bootstrapAdmin,
} = require("../controllers/auth.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.post("/login", loginAdmin);
router.post("/bootstrap", bootstrapAdmin);
router.post("/create", authMiddleware, createAdmin);

module.exports = router;
