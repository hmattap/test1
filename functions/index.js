const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Configure Nodemailer with your email service credentials
// Use Firebase Environment Configuration for secure storage
const transporter = nodemailer.createTransport({
  service: "outlook", // Replace with your email service (e.g., 'SendGrid')
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password,
  },
});

const sendMailFunction = async (snap, context) => {
  const mail = snap.data();
  const mailOptions = {
    from: "Your App Name Pruebita", // Replace with your sender email
    to: mail.to,
    subject: mail.template.subject,
    text: mail.template.text,
    // You can also add html: mail.template.html if you have HTML content
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", mail.to);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

exports.sendMail = functions.firestore
    .document("mail/{mailId}")
    .onCreate((snap, context) => {
    // Your function code here
      return sendMailFunction(snap, context);
    });

/* const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});
*/
