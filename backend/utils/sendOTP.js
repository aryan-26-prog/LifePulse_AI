const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();

  if (!user || !pass) {
    console.warn("⚠️ EMAIL_USER or EMAIL_PASS missing on server");
    return null;
  }

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // STARTTLS for port 587
    pool: true,
    maxConnections: 5,
    maxMessages: 100,

    auth: {
      user,
      pass,
    },
  });

  return transporter;
};

module.exports = async (email, otp) => {
  const mailer = getTransporter();

  if (!mailer) {
    console.warn(
      `⚠️ Transporter unavailable. Logged OTP for ${email}: ${otp}`
    );
    return;
  }

  const user = process.env.EMAIL_USER.trim();

  await mailer.sendMail({
    from: `"LifePulse AI" <${user}>`,
    to: email,
    subject: "LifePulse OTP Verification",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        padding: 24px;
        background-color: #f8fafc;
        border-radius: 8px;
      ">
        <h2 style="color: #2563eb; margin-bottom: 8px;">
          LifePulse AI Email Verification
        </h2>

        <p style="color: #334155; font-size: 16px;">
          Your OTP code for verification is:
        </p>

        <div style="
          background-color: #ffffff;
          padding: 16px 24px;
          border-radius: 8px;
          display: inline-block;
          border: 1px solid #cbd5e1;
          margin: 12px 0;
        ">
          <h1 style="
            color: #10b981;
            letter-spacing: 6px;
            margin: 0;
            font-size: 36px;
          ">
            ${otp}
          </h1>
        </div>

        <p style="color: #64748b; font-size: 14px;">
          This OTP will expire in 5 minutes.
        </p>
      </div>
    `,
  });

  console.log(`✅ OTP email delivered to ${email}`);
};