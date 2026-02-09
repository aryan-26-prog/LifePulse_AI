const User = require("../models/User");
const Volunteer = require("../models/Volunteer");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateOTP = require("../utils/generateOTP");
const sendOTP = require("../utils/sendOTP");

/* ================= REGISTER ================= */
exports.register = async (req, res) => {

  try {

    const { name, email, password, role, ngoRegistrationId } = req.body;

    /* NGO REG VALIDATION */
    if (role === "ngo" && !ngoRegistrationId) {
      return res.status(400).json({
        message: "NGO Registration ID required"
      });
    }

    const exists = await User.findOne({ email });

    if (exists)
      return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    /* OTP */
    const otp = generateOTP();

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      ngoRegistrationId: role === "ngo" ? ngoRegistrationId : null,

      otp: {
        code: otp,
        expiresAt: Date.now() + 5 * 60 * 1000
      }
    });

    /* Volunteer profile auto create */
    if (role === "volunteer") {

      const volunteer = await Volunteer.create({
        name,
        available: true
      });

      user.volunteerProfile = volunteer._id;
      await user.save();
    }

    await sendOTP(email, otp);

    res.json({
      message: "OTP sent to email",
      userId: user._id
    });

  } catch (err) {
    console.log(err.response?.data);
  alert(err.response?.data?.message || "Registration failed");
  }
};



/* ================= VERIFY OTP ================= */
exports.verifyOTP = async (req, res) => {

  const { userId, otp } = req.body;

  const user = await User.findById(userId);

  if (!user)
    return res.status(404).json({ message: "User not found" });

  if (!user.otp || user.otp.code !== otp)
    return res.status(400).json({ message: "Invalid OTP" });

  if (user.otp.expiresAt < Date.now())
    return res.status(400).json({ message: "OTP expired" });

  user.isEmailVerified = true;
  user.otp = null;

  await user.save();

  res.json({ message: "Email verified successfully" });
};



/* ================= RESEND OTP ================= */
exports.resendOTP = async (req, res) => {

  const { userId } = req.body;

  const user = await User.findById(userId);

  if (!user)
    return res.status(404).json({ message: "User not found" });

  const otp = generateOTP();

  user.otp = {
    code: otp,
    expiresAt: Date.now() + 5 * 60 * 1000
  };

  await user.save();

  await sendOTP(user.email, otp);

  res.json({ message: "OTP resent" });
};



/* ================= LOGIN ================= */
exports.login = async (req, res) => {

  const { email, password } = req.body;

  const user = await User
    .findOne({ email })
    .populate("volunteerProfile");

  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: "Invalid credentials" });

  if (!user.isEmailVerified)
    return res.status(403).json({ message: "Verify email first" });

  if (user.isBlocked)
    return res.status(403).json({ message: "Account blocked" });

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET
  );

  res.json({
    token,
    user,
    volunteerId: user.volunteerProfile?._id || null
  });
};

