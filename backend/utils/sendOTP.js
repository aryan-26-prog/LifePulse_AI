const nodemailer = require("nodemailer");

module.exports = async (email, otp) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  console.log(`🔑 [OTP GENERATED] For ${email}: ${otp}`);

  if (!user || !pass) {
    console.warn("⚠️ EMAIL_USER or EMAIL_PASS missing. OTP logged to console.");
    return;
  }

  const cleanUser = user.trim();
  const cleanPass = pass.trim();

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: cleanUser,
        pass: cleanPass
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000
    });

    await transporter.sendMail({
      from: `"LifePulse AI" <${cleanUser}>`,
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

    console.log(`✅ OTP email sent successfully to ${email}`);

  } catch (err) {
    console.error("⚠️ SMTP Email Failed / Blocked by Cloud Host:", err.message);

    // Render Free Tier blocks outbound SMTP ports 25, 465, 587.
    // Fallback: Log OTP to console and allow registration to complete cleanly.
    if (process.env.RENDER || process.env.NODE_ENV === "production") {
      console.log(`🔑 [RENDER FALLBACK OTP] For ${email} -> OTP: ${otp}`);
      return;
    }

    throw err;
  }
};
