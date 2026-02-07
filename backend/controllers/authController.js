const User = require("../models/User");
const Volunteer = require("../models/Volunteer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER 
exports.register = async (req, res) => {

  const { name, email, password, role, phone } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  let volunteerProfile = null;

  // Create volunteer profile automatically
  if (role === "volunteer") {

    const volunteer = await Volunteer.create({
      name,
      phone: phone || ""
    });

    volunteerProfile = volunteer._id;
  }

  const user = await User.create({
    name,
    email,
    password: hashed,
    role,
    volunteerProfile
  });

  res.json({
    message: "User Registered Successfully",
    user
  });
};

// LOGIN 
exports.login = async (req, res) => {

  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: "Invalid Credentials" });

  if (user.isBlocked)
    return res.status(403).json({ message: "Account blocked" });

  let volunteerId = user.volunteerProfile;

  // AUTO CREATE IF VOLUNTEER BUT PROFILE MISSING
  if (user.role === "volunteer" && !volunteerId) {

    const volunteer = await Volunteer.create({
      name: user.name,
      phone: ""
    });

    user.volunteerProfile = volunteer._id;
    await user.save();

    volunteerId = volunteer._id;
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET
  );

  res.json({
    token,
    user,
    volunteerId
  });
};
