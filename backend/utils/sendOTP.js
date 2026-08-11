const nodemailer = require("nodemailer");
const dns = require("dns");

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

let transporter = null;

const getTransporter = () => {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();

  if (!user || !pass) {
    console.warn("⚠️ EMAIL_USER or EMAIL_PASS missing on server");
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000
  });
};

module.exports = async (email, otp) => {
  const mailer = getTransporter();

  if (!mailer) {
    console.warn(`⚠️ EMAIL_USER/EMAIL_PASS missing. Logged OTP for ${email}: ${otp}`);
    return;
  }

  const user = process.env.EMAIL_USER.trim();

  try {
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
  } catch (err) {
    console.error(`⚠️ [SMTP CLOUD TIMEOUT] Mail server error: ${err.message}`);
    console.log(`🔑 [FALLBACK OTP LOGGED]: Email: ${email} | OTP: ${otp}`);
    // Gracefully handle cloud provider SMTP rate limits so user registration flow succeeds
  }
};