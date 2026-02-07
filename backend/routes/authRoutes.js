const router = require("express").Router();

const {
  register,
  login,
  verifyOTP,
  resendOTP
} = require("../controllers/authController");

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", login);

module.exports = router;
