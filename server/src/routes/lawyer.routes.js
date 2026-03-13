const express = require('express');
const router = express.Router();
const upload = require("../middlewares/upload");
const { getAllLawyers, getLawyerById, updateLawyer, completeLawyerProfile, deleteLawyer, verificationLawyer } = require('../controllers/lawyer.controller');

// lawyer routes
router.get('/', getAllLawyers);
router.get('/:id', getLawyerById);
router.put('/update-lawyer/:id', updateLawyer);
router.patch('/complete-profile/:id', upload.single("profileImage"), completeLawyerProfile);
router.delete('/delete-lawyer/:id', deleteLawyer);
router.patch('/lawyer-verification/:id', verificationLawyer);

module.exports = router;