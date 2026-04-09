const User = require("../models/user.model");
const Lawyer = require("../models/lawyer.model");
const Admin = require("../models/admin.model");
const EmailOtp = require("../models/emailOtp.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const env = require("../config/env");
const { isDisposableEmail } = require("../utils/emailValidation");
const {
  sendOtpEmail,
  sendWelcomeLawyerEmail,
  hasBrevoConfig,
} = require("../services/email.service");


const generateToken = (user) => {
  
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN || "7d" }
  );
};

const OTP_PURPOSE_LOGIN = "login";
const OTP_PURPOSE_PASSWORD_RESET = "password_reset";
const OTP_PURPOSE_REGISTRATION = "registration";

const getOtpLength = () => Number(env.EMAIL_OTP_LENGTH) || 6;
const getOtpTtlMinutes = () => Number(env.EMAIL_OTP_TTL_MINUTES) || 10;
const getOtpCooldownSeconds = () => Number(env.EMAIL_OTP_COOLDOWN_SECONDS) || 60;
const isValidAlphabeticName = (value) => /^[A-Za-z\s]+$/.test(String(value || "").trim());
const isValidTenDigitPhone = (value) => /^[0-9]{10}$/.test(String(value || "").trim());

const generateNumericOtp = (length = 6) => {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
};

const getUserModelByRole = (role) => {
  if (role === "lawyer") return Lawyer;
  if (role === "admin") return Admin;
  return User;
};

const findUserByEmailAndRole = async (email, role) => {
  const UserModel = getUserModelByRole(role);
  return UserModel.findOne({ email: String(email).toLowerCase().trim() });
};

const createAndSendOtp = async ({ email, role, purpose, userName }) => {
  if (!hasBrevoConfig()) {
    throw new Error(
      "Brevo is not configured. Please set BREVO_API_KEY, BREVO_SENDER_EMAIL, and BREVO_SENDER_NAME.",
    );
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const otpLength = getOtpLength();
  const ttlMinutes = getOtpTtlMinutes();
  const cooldownSeconds = getOtpCooldownSeconds();

  const existingRecentOtp = await EmailOtp.findOne({
    email: normalizedEmail,
    role,
    purpose,
    verifiedAt: null,
    createdAt: {
      $gte: new Date(Date.now() - cooldownSeconds * 1000),
    },
  }).sort({ createdAt: -1 });

  if (existingRecentOtp) {
    return {
      cooldown: true,
      message: `Please wait ${cooldownSeconds} seconds before requesting another code.`,
    };
  }

  await EmailOtp.deleteMany({
    email: normalizedEmail,
    role,
    purpose,
    verifiedAt: null,
  });

  const otp = generateNumericOtp(otpLength);
  console.log(`Generated OTP for ${normalizedEmail} (${purpose}): ${otp}`); // Log OTP for debugging (remove in production)
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  await EmailOtp.create({
    email: normalizedEmail,
    role,
    purpose,
    otpHash,
    expiresAt,
    attempts: 0,
    lastSentAt: new Date(),
  });

  await sendOtpEmail({
    email: normalizedEmail,
    name: userName,
    purpose,
    otp,
    minutesValid: ttlMinutes,
  });

  return {
    message: "OTP sent successfully",
    expiresInMinutes: ttlMinutes,
  };
};

const findLatestRegistrationOtp = async ({ email, role }) => {
  const normalizedEmail = String(email).toLowerCase().trim();
  return EmailOtp.findOne({
    email: normalizedEmail,
    role,
    purpose: OTP_PURPOSE_REGISTRATION,
  }).sort({ createdAt: -1 });
};

const requestRegistrationOtp = async (req, res) => {
  try {
    const { name, email, role, licenseNo } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: "Name, email, and role are required" });
    }

    if (!isValidAlphabeticName(name)) {
      return res.status(400).json({
        error: "Name can contain only alphabets and spaces.",
      });
    }

    if (role !== "user" && role !== "lawyer" && role !== "admin") {
      return res.status(400).json({ error: "Invalid role" });
    }

    if (role === "lawyer" && !licenseNo) {
      return res.status(400).json({ error: "License number is required for lawyer registration" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    if (isDisposableEmail(normalizedEmail)) {
      return res.status(400).json({
        error: "Temporary or disposable email addresses are not allowed. Please use a permanent email address.",
      });
    }

    let existingUser;
    if (role === "lawyer") {
      existingUser = await Lawyer.findOne({ email: normalizedEmail });
    } else if (role === "admin") {
      existingUser = await Admin.findOne({ email: normalizedEmail });
    } else {
      existingUser = await User.findOne({ email: normalizedEmail });
    }

    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const result = await createAndSendOtp({
      email: normalizedEmail,
      role,
      purpose: OTP_PURPOSE_REGISTRATION,
      userName: name,
    });

    return res.json({
      message: result.message,
      expiresInMinutes: result.expiresInMinutes,
    });
  } catch (err) {
    const status = err.message?.includes("Brevo is not configured") ? 500 : 400;
    res.status(status).json({ error: err.message });
  }
};

const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, role, otp } = req.body;

    if (!email || !role || !otp) {
      return res.status(400).json({ error: "Email, role, and OTP are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const otpRecord = await EmailOtp.findOne({
      email: normalizedEmail,
      role,
      purpose: OTP_PURPOSE_REGISTRATION,
      verifiedAt: null,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ error: "OTP not found or expired" });
    }

    if (otpRecord.expiresAt < new Date()) {
      await EmailOtp.deleteMany({
        email: normalizedEmail,
        role,
        purpose: OTP_PURPOSE_REGISTRATION,
        verifiedAt: null,
      });
      return res.status(400).json({ error: "OTP has expired" });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(429).json({ error: "Too many invalid attempts. Please request a new OTP." });
    }

    const isMatch = await bcrypt.compare(String(otp).trim(), otpRecord.otpHash);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ error: "Invalid OTP" });
    }

    otpRecord.verifiedAt = new Date();
    await otpRecord.save();

    const verificationToken = jwt.sign(
      {
        email: normalizedEmail,
        role,
        purpose: OTP_PURPOSE_REGISTRATION,
      },
      env.JWT_SECRET,
      { expiresIn: `${getOtpTtlMinutes()}m` },
    );

    return res.json({
      message: "OTP verified successfully",
      verificationToken,
      expiresInMinutes: getOtpTtlMinutes(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      gender,
      city,
      state,
      password,
      role,
      licenseNo,
      registrationVerificationToken,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!isValidAlphabeticName(name)) {
      return res.status(400).json({
        error: "Name can contain only alphabets and spaces.",
      });
    }

    if (!isValidTenDigitPhone(phone)) {
      return res.status(400).json({
        error: "Phone number must contain exactly 10 digits.",
      });
    }

    if (!gender || !["Male", "Female", "Other"].includes(String(gender).trim())) {
      return res.status(400).json({ error: "Gender is required" });
    }

    if (role === "user") {
      if (!String(city || "").trim()) {
        return res.status(400).json({ error: "City is required for client registration" });
      }

      if (!String(state || "").trim()) {
        return res.status(400).json({ error: "State is required for client registration" });
      }
    }

    // Validate role
    if (role !== "user" && role !== "lawyer" && role !== "admin") {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Lawyer-specific validation
    if (role === "lawyer" && !licenseNo) {
      return res.status(400).json({ error: "License number is required for lawyer registration" });
    }

    if (!registrationVerificationToken) {
      return res.status(400).json({ error: "Email verification is required before registration" });
    }

    let verificationPayload;
    try {
      verificationPayload = jwt.verify(registrationVerificationToken, env.JWT_SECRET);
    } catch (tokenError) {
      return res.status(400).json({ error: "Email verification has expired or is invalid" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    if (isDisposableEmail(normalizedEmail)) {
      return res.status(400).json({
        error: "Temporary or disposable email addresses are not allowed. Please use a permanent email address.",
      });
    }

    if (
      verificationPayload?.purpose !== OTP_PURPOSE_REGISTRATION ||
      verificationPayload?.email !== normalizedEmail ||
      verificationPayload?.role !== role
    ) {
      return res.status(400).json({ error: "Email verification does not match registration details" });
    }

    const otpRecord = await findLatestRegistrationOtp({ email: normalizedEmail, role });
    if (!otpRecord || !otpRecord.verifiedAt) {
      return res.status(400).json({ error: "Please verify your email before registering" });
    }

    // Check if user already exists based on role
    let existingUser;
    if (role === "lawyer") {
      existingUser = await Lawyer.findOne({ email: normalizedEmail });
    } else if (role === "admin") {
      existingUser = await Admin.findOne({ email: normalizedEmail });
    } else {
      existingUser = await User.findOne({ email: normalizedEmail });
    }

    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    // Create new user based on role
    let newUser;
    if (role === "lawyer") {
      newUser = await Lawyer.create({
        name,
        email: normalizedEmail,
        phone,
        gender: String(gender).trim(),
        password,
        licenseNo,
        role: "lawyer",
      });
    } else if (role === "admin") {
      newUser = await Admin.create({
        name,
        email: normalizedEmail,
        phone,
        password,
        role: "admin",
      });
    } else {
      newUser = await User.create({
        name,
        email: normalizedEmail,
        phone,
        gender: String(gender).trim(),
        city: String(city || "").trim(),
        state: String(state || "").trim(),
        password,
        role: "user",
      });
    }

    await EmailOtp.deleteMany({
      email: normalizedEmail,
      role,
      purpose: OTP_PURPOSE_REGISTRATION,
    });

    const token = generateToken(newUser);

    if (role === "lawyer") {
      sendWelcomeLawyerEmail({
        email: newUser.email,
        name: newUser.name,
        licenseNo: newUser.licenseNo,
      }).catch((emailError) => {
        console.error("Failed to send lawyer welcome email:", emailError);
      });
    }

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        profilePicture: newUser.profilePicture || null,
        gender: newUser.gender || null,
        city: newUser.city || null,
        state: newUser.state || null,
        role: newUser.role,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const requestLoginOtp = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: "Email and role are required" });
    }

    const user = await findUserByEmailAndRole(email, role);
    if (!user) {
      return res.status(404).json({ error: "No account found for this email and role" });
    }

    const result = await createAndSendOtp({
      email: user.email,
      role,
      purpose: OTP_PURPOSE_LOGIN,
      userName: user.name,
    });

    return res.json({
      message: result.message,
      expiresInMinutes: result.expiresInMinutes,
    });
  } catch (err) {
    const status = err.message?.includes("Brevo is not configured") ? 500 : 400;
    res.status(status).json({ error: err.message });
  }
};

const verifyLoginOtp = async (req, res) => {
  try {
    const { email, role, otp } = req.body;

    if (!email || !role || !otp) {
      return res.status(400).json({ error: "Email, role, and OTP are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    if (isDisposableEmail(normalizedEmail)) {
      return res.status(400).json({
        error: "Temporary or disposable email addresses are not allowed. Please use a permanent email address.",
      });
    }
    const otpRecord = await EmailOtp.findOne({
      email: normalizedEmail,
      role,
      purpose: OTP_PURPOSE_LOGIN,
      verifiedAt: null,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ error: "OTP not found or expired" });
    }

    if (otpRecord.expiresAt < new Date()) {
      await EmailOtp.deleteMany({
        email: normalizedEmail,
        role,
        purpose: OTP_PURPOSE_LOGIN,
        verifiedAt: null,
      });
      return res.status(400).json({ error: "OTP has expired" });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(429).json({ error: "Too many invalid attempts. Please request a new OTP." });
    }

    const isMatch = await bcrypt.compare(String(otp).trim(), otpRecord.otpHash);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ error: "Invalid OTP" });
    }

    otpRecord.verifiedAt = new Date();
    await otpRecord.save();

    const user = await findUserByEmailAndRole(normalizedEmail, role);
    if (!user) {
      return res.status(404).json({ error: "Account not found" });
    }

    const token = generateToken(user);

    res.json({
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage || null,
        profilePicture: user.profilePicture || null,
        gender: user.gender || null,
        city: user.city || null,
        state: user.state || null,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const requestPasswordResetOtp = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: "Email and role are required" });
    }

    const user = await findUserByEmailAndRole(email, role);
    if (!user) {
      return res.status(404).json({ error: "No account found for this email and role" });
    }

    const result = await createAndSendOtp({
      email: user.email,
      role,
      purpose: OTP_PURPOSE_PASSWORD_RESET,
      userName: user.name,
    });

    return res.json({
      message: result.message,
      expiresInMinutes: result.expiresInMinutes,
    });
  } catch (err) {
    const status = err.message?.includes("Brevo is not configured") ? 500 : 400;
    res.status(status).json({ error: err.message });
  }
};

const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, role, otp, newPassword } = req.body;

    if (!email || !role || !otp || !newPassword) {
      return res.status(400).json({
        error: "Email, role, OTP, and new password are required",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const otpRecord = await EmailOtp.findOne({
      email: normalizedEmail,
      role,
      purpose: OTP_PURPOSE_PASSWORD_RESET,
      verifiedAt: null,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ error: "OTP not found or expired" });
    }

    if (otpRecord.expiresAt < new Date()) {
      await EmailOtp.deleteMany({
        email: normalizedEmail,
        role,
        purpose: OTP_PURPOSE_PASSWORD_RESET,
        verifiedAt: null,
      });
      return res.status(400).json({ error: "OTP has expired" });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(429).json({ error: "Too many invalid attempts. Please request a new OTP." });
    }

    const isMatch = await bcrypt.compare(String(otp).trim(), otpRecord.otpHash);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const UserModel = getUserModelByRole(role);
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: "Account not found" });
    }

    user.password = newPassword;
    await user.save();

    otpRecord.verifiedAt = new Date();
    await otpRecord.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (role === "admin") {
      return res.status(400).json({
        error: "Use the admin login endpoint for admin accounts",
      });
    }

    let user;
    if (role === "lawyer") {
      user = await Lawyer.findOne({ email , isActive: true });
    } else {
      user = await User.findOne({ email, isActive: true });
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
        phone: user.phone,
        profileImage: user.profileImage || null,
        profilePicture: user.profilePicture || null,
        gender: user.gender || null,
        city: user.city || null,
        state: user.state || null,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN || "7d" },
    );

    res.json({
      message: "Login Successful",
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createAdminRecord = async ({ name, email, password }) => {
  const admin = await Admin.create({
    name,
    email,
    password,
    role: "admin",
  });

  return {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  };
};

const createAdmin = async (req, res) => {
  try {
    const requesterRole = req.user?.role;
    if (requesterRole !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").toLowerCase().trim();
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required",
      });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin already exists with this email" });
    }

    const admin = await createAdminRecord({ name, email, password });

    res.status(201).json({
      message: "Admin created successfully",
      admin,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const bootstrapAdmin = async (req, res) => {
  try {
    const existingCount = await Admin.countDocuments();
    if (existingCount > 0) {
      return res.status(409).json({
        error: "Bootstrap is only allowed before the first admin is created",
      });
    }

    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").toLowerCase().trim();
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required",
      });
    }

    const admin = await createAdminRecord({ name, email, password });

    res.status(201).json({
      message: "First admin created successfully",
      admin,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  loginAdmin,
  createAdmin,
  bootstrapAdmin,
  requestRegistrationOtp,
  verifyRegistrationOtp,
  requestLoginOtp,
  verifyLoginOtp,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  generateToken,
};
