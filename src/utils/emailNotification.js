require("dotenv").config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.TRANSPORTER_EMAIL,
    pass: process.env.TRANSPORTER_EMAIL_PASS,
  },
});

module.exports = async function(messageOptions){
  await transporter.sendMail(messageOptions)
}
