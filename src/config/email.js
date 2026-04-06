const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
});

const sendEmail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || 'ShopFlow'}" <${process.env.EMAIL_FROM}>`,
    to, subject, html,
  });
};

module.exports = { sendEmail };
