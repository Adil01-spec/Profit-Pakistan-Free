
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v1");
const logger = require("firebase-functions/logger");
const fetch = require("node-fetch");

setGlobalOptions({ maxInstances: 10 });

exports.sendVerifiedUserToProApp = onDocumentUpdated("paymentRequests/{requestId}", async (event) => {
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();

  // Check if the status was changed from 'pending' to 'verified'
  if (beforeData.status === "pending" && afterData.status === "verified") {
    logger.info(`Payment verified for ${afterData.email}. Initiating transfer to Pro App.`);

    const proAppUrl = "https://profit-pakistan-pro.vercel.app/api/createProUser";
    const secretKey = process.env.PRO_APP_SECRET_KEY;

    if (!secretKey || secretKey === 'your_secure_secret_here') {
      logger.error("PRO_APP_SECRET_KEY is not configured. Cannot send data to Pro App.");
      return;
    }

    const payload = {
      name: afterData.name,
      email: afterData.email,
      phone: afterData.phone,
    };

    try {
      const response = await fetch(proAppUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + secretKey,
        },
        body: JSON.stringify(payload),
      });

      const responseBody = await response.json();

      if (response.ok) {
        logger.info(`Successfully sent user ${afterData.email} to Pro App.`, { response: responseBody });
      } else {
        logger.error(`Failed to send user ${afterData.email} to Pro App.`, {
          status: response.status,
          error: responseBody,
        });
      }
    } catch (error) {
      logger.error(`Error calling Pro App API for user ${afterData.email}:`, error);
    }
  }
});
