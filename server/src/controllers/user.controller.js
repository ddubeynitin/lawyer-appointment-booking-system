const cloudinary = require("../config/cloudinary");
const User = require('../models/user.model');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ isActive: true });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.isActive) {
            return res.status(404).json({ message: "User not found or inactive" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { name, email, phone, gender, city, state } = req.body;
        const normalizedEmail = String(email || "").toLowerCase().trim();

        if (!name || !normalizedEmail || !phone) {
            return res.status(400).json({ message: "Name, email, and phone are required" });
        }

        if (gender && !["Male", "Female", "Other"].includes(String(gender).trim())) {
            return res.status(400).json({ message: "Invalid gender value" });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: req.params.id },
        });

        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const updateDoc = {
            name: String(name).trim(),
            email: normalizedEmail,
            phone: String(phone).trim(),
        };

        if (gender !== undefined) updateDoc.gender = String(gender).trim();
        if (city !== undefined) updateDoc.city = String(city || "").trim();
        if (state !== undefined) updateDoc.state = String(state || "").trim();

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "clients",
            });
            updateDoc.profilePicture = result.secure_url;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateDoc,
            { new: true, runValidators: true }
        );
        if (!user || !user.isActive) {
            return res.status(404).json({ message: "User not found or inactive" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
