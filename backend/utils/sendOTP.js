const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = async (email, otp) => {

  await transporter.sendMail({
    from: "LifePulse AI",
    to: email,
    subject: "LifePulse OTP Verification",
    html: `
      <h2>LifePulse AI Email Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP expires in 5 minutes.</p>
    `
  });

};
