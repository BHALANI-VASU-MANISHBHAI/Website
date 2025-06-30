import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

async function sendOtpEmail(toEmail, otp) {
  // Create a Nodemailer transporter

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'vasubhalani2005@gmail.com'
,  // fixed email address
        pass: 'ipng fusn yntl kmhb', // replace with your actual password or use environment variable
    },
  });

  let mailOptions = {
    from: '"Forever" <vasubhalani2005@gmail.com>', // fixed email address
    to: toEmail,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
  };

  let info = await transporter.sendMail(mailOptions);
  console.log('Message sent: %s', info.messageId);
}

export {
  sendOtpEmail
};
