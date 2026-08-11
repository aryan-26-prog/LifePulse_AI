const nodemailer = require("nodemailer");

module.exports = async (email, otp) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error(`EMAIL_USER or EMAIL_PASS environment variable is missing (user: ${user ? 'OK' : 'MISSING'}, pass: ${pass ? 'OK' : 'MISSING'})`);
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: user,
      pass: pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  await transporter.sendMail({
    from: `"LifePulse AI" <${user}>`,
    to: email,
    subject: "LifePulse OTP Verification",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2563eb;">LifePulse AI Email Verification</h2>
        <p>Your OTP for verification is:</p>
        <h1 style="color: #10b981; letter-spacing: 4px;">${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      </div>
    `
  });
};
