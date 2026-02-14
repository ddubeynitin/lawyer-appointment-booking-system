const Lawyer = require("../models/lawyer.model");

const getAllLawyers = async (req, res) => {
  try {
    const lawyers = await Lawyer.find({ isActive: true });
    res.status(200).json(lawyers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLawyerById = async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id);
    if (!lawyer || !lawyer.isActive) {
      return res.status(404).json({ message: "Lawyer not found or inactive" });
    }
    res.status(200).json(lawyer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateLawyer = async (req, res) => {
  try {
    const lawyer = await Lawyer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lawyer || !lawyer.isActive) {
      return res.status(404).json({ message: "Lawyer not found or inactive" });
    }
    res.status(200).json(lawyer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const completeLawyerProfile = async (req, res) => {
  try {
    const {profileImage, location, education, specializations, feesByCategory, experience, rating, totalReviews, verification} = req.body;

    const lawyer = await Lawyer.findByIdAndUpdate(
      req.params.id,
      {
        profileImage,
        location,
        education,
        specializations,
        feesByCategory,
        experience,
        rating,
        totalReviews,
        verification,
        isProfileComplete: true
      },
      { new: true },
    );

    if (!lawyer || !lawyer.isActive) {
      return res.status(404).json({ message: "Lawyer not found or inactive" });
    }
    res.status(200).json({ message: "Profile completed successfully", lawyer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteLawyer = async (req, res) => {
  try {
    const lawyer = await Lawyer.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!lawyer) {
      return res.status(404).json({ message: "Lawyer not found" });
    }
    res.status(200).json({ message: "Lawyer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllLawyers,
  getLawyerById,
  updateLawyer,
  completeLawyerProfile,
  deleteLawyer,
};
