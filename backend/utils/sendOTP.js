const nodemailer = require("nodemailer");

module.exports = async (email, otp) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error(`EMAIL_USER or EMAIL_PASS environment variable is missing on server`);
  }

  const cleanUser = user.trim();
  const cleanPass = pass.trim();

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: cleanUser,
      pass: cleanPass
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000
  });

  await transporter.sendMail({
    from: `"LifePulse AI" <${cleanUser}>`,
    to: email,
    subject: "LifePulse OTP Verification",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #f8fafc; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-bottom: 8px;">LifePulse AI Email Verification</h2>
        <p style="color: #334155; font-size: 16px;">Your OTP code for verification is:</p>
        <div style="background-color: #ffffff; padding: 16px 24px; border-radius: 8px; display: inline-block; border: 1px solid #cbd5e1; margin: 12px 0;">
          <h1 style="color: #10b981; letter-spacing: 6px; margin: 0; font-size: 36px;">${otp}</h1>
        </div>
        <p style="color: #64748b; font-size: 14px;">This OTP will expire in 5 minutes.</p>
      </div>
    `
  });

  console.log(`✅ [NODEMAILER] OTP email sent successfully to ${email}`);
};
