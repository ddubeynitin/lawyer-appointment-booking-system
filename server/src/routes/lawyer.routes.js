const express = require('express');
const router = express.Router();
const { getAllLawyers, getLawyerById, updateLawyer, completeLawyerProfile, deleteLawyer } = require('../controllers/lawyer.controller');

// lawyer routes
router.get('/', getAllLawyers);
router.get('/:id', getLawyerById);
router.put('/:id', updateLawyer);
router.patch('/complete-profile/:id', completeLawyerProfile);
router.delete('/:id', deleteLawyer);

module.exports = router;