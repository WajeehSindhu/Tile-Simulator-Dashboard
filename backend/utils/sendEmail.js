const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,       // Your Gmail
      pass: process.env.EMAIL_PASS        // App password
    }
  });

  await transporter.sendMail({
    from: `"Wajeeh Auth" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
