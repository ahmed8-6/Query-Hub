import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (to: string, subject: string, text: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const info = await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    text: `${text} ${otp}. This code will expire in 5 minutes.`,
  });
  console.log(`Message sent: ${info.messageId}`);
  return otp;
};
