/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const { onRequest } = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

// Configure the email transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "turfinvestor006@gmail.com",
    pass: "Turfinvestor@123",
  },
});

// Cloud Function to send an email when a new withdrawal request is created
exports.sendWithdrawalEmail = functions.firestore
    .document("withdrawRequests/{docId}")
    .onCreate((snap, context) => {
      const data = snap.data();

      const mailOptions = {
        from: "turfinvestor006@gmail.com",
        to: "shamilshamzshz000@gmail.com", // replace with admin's email
        subject: "New Withdrawal Request",
        html: `
            <p><strong>Name:</strong> ${data.user.name}</p>
            <p><strong>Phone:</strong> ${data.user.phoneNumber}</p>
            <p><strong>Amount:</strong> ₹${data.amount.toFixed(2)}</p>
            <p><strong>Account Details:</strong></p>
            <p>Account number: ${data.user.accountNumber || "-"}</p>
            <p>IFSC code: ${data.user.ifsc || "-"}</p>
            <p>Google pay: ${data.user.googlePay || "-"}</p>
        `,
      };

      // Send email
      return transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });
    });
