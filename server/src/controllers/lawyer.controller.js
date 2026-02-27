const cloudinary = require("../config/cloudinary");
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
    const {
      location,
      education,
      specializations,
      feesByCategory,
      experience,
      bio,
      practiceCourt,
      rating,
      totalReviews,
      verification,
    } = req.body;

    const parseJson = (value, fallback) => {
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch {
          return fallback;
        }
      }
      return value ?? fallback;
    };

    const parsedLocation = parseJson(location, undefined);
    const parsedEducation = parseJson(education, []);
    const parsedSpecializations = parseJson(specializations, []);
    const parsedFeesByCategory = parseJson(feesByCategory, []);

    let imageUrl = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "lawyers",
      });
      imageUrl = result.secure_url;
    }

    const updateDoc = {
      isProfileComplete: true,
    };

    if (req.file) {
      updateDoc.profileImage = {
        url: imageUrl,
        public_id: req.file.filename,
      };
    }

    if (parsedLocation) updateDoc.location = parsedLocation;
    if (Array.isArray(parsedEducation)) updateDoc.education = parsedEducation;
    if (Array.isArray(parsedSpecializations)) updateDoc.specializations = parsedSpecializations;
    if (Array.isArray(parsedFeesByCategory)) updateDoc.feesByCategory = parsedFeesByCategory;

    if (experience !== undefined) updateDoc.experience = Number(experience);
    if (bio !== undefined) updateDoc.bio = bio;
    if (practiceCourt !== undefined) updateDoc.practiceCourt = practiceCourt;
    if (rating !== undefined) updateDoc.rating = Number(rating);
    if (totalReviews !== undefined) updateDoc.totalReviews = Number(totalReviews);
    if (verification !== undefined) updateDoc.verification = verification;

    const lawyer = await Lawyer.findByIdAndUpdate(req.params.id, updateDoc, { new: true });

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
