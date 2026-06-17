import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const sendOtpEmail = async (to: string, otp: string) => {
  if (env.NODE_ENV === 'development') {
    console.log(`📧 [DEV] OTP for ${to}: ${otp}`);
    return;
  }

  if (!env.SMTP_USER || !env.SMTP_PASS) {
    throw new Error('SMTP credentials not configured. Cannot send email.');
  }

  const mailOptions = {
    from: `"ClipForge" <${env.SMTP_USER}>`,
    to,
    subject: 'Your ClipForge Verification Code',
    text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #7c3aed;">Verify your email</h2>
        <p>Welcome to ClipForge! Use the code below to verify your account:</p>
        <div style="background: #f4f4f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #18181b;">${otp}</span>
        </div>
        <p style="color: #71717a; font-size: 14px;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
