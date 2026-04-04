const express = require('express');
const router = express.Router();
const upload = require("../middlewares/upload");
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/user.controller');

// user routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', upload.single("profilePicture"), updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
