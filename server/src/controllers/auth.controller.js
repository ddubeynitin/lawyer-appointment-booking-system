const User = require("../models/user.model");
const Lawyer = require("../models/lawyer.model");
const Admin = require("../models/admin.model");
const jwt = require("jsonwebtoken");
const env = require("../config/env");


const generateToken = (user) => {
  
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN || "7d" }
  );
};

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, licenseNo } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate role
    if (role !== "user" && role !== "lawyer" && role !== "admin") {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Lawyer-specific validation
    if (role === "lawyer" && !licenseNo) {
      return res.status(400).json({ error: "License number is required for lawyer registration" });
    }

    // Check if user already exists based on role
    let existingUser;
    if (role === "lawyer") {
      existingUser = await Lawyer.findOne({ email });
    } else if (role === "admin") {
      existingUser = await Admin.findOne({ email });
    } else {
      existingUser = await User.findOne({ email });
    }

    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    // Create new user based on role
    let newUser;
    if (role === "lawyer") {
      newUser = await Lawyer.create({
        name,
        email,
        phone,
        password,
        licenseNo,
        role: "lawyer",
      });
    } else if (role === "admin") {
      newUser = await Admin.create({
        name,
        email,
        phone,
        password,
        role: "admin",
      });
    } else {
      newUser = await User.create({
        name,
        email,
        phone,
        password,
        role: "user",
      });
    }

    const token = generateToken(newUser);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    let user;
    if (role === "lawyer") {
      user = await Lawyer.findOne({ email });
    } else if (role === "admin") {
      user = await Admin.findOne({ email });
    } else {
      user = await User.findOne({ email });
    }
    
    // Check if user exists
    if (!user) return res.status(400).json({ error: "Invalid email" });

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

      // if( user.password !== password ){
      //   return res.status(400).json({error: "Invalid credentials"});
      // }
      
    const token = generateToken(user);

    res.json({ 
      message: "Login Successful", 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        idProfileComplete: user.isProfileComplete,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registerUser, loginUser, generateToken };
