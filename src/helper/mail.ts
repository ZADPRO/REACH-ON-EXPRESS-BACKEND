import nodemailer from "nodemailer";

interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  logger: true, // Enable internal logging
  debug: true, // Show debug output
});

/**
 * Sends an email using Nodemailer.
 * @param {MailOptions} mailOptions - Options for the email.
 */
export const sendEmail = async (mailOptions: MailOptions): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      ...mailOptions,
    });
    return true; // success
  } catch (error) {
    console.error("Error sending email:", error);
    return false; // failure
  }
};
