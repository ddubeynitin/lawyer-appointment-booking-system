const expess = require("express");
const router = expess.Router();
const { createAvailability, getAvailabilityByLawyerAndDate, getAvailabilityByLawyer, updateBookedSlot, deleteAvailability } = require("../controllers/availability.controller");

// Create or update availability
router.post("/", createAvailability);
router.get("/:lawyerId/:date", getAvailabilityByLawyerAndDate);
router.get("/lawyer/:lawyerId", getAvailabilityByLawyer);
router.patch("/book-slot", updateBookedSlot);
router.delete("/:id", deleteAvailability);

module.exports = router;
