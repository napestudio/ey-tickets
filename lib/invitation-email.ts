import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export const sendEmail = async (buyer: string, subject: string, html: string) => {
  const mailOptions: any = {
    from: process.env.GMAIL_USER,
    to: [buyer, process.env.EMAIL],
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};
