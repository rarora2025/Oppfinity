const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin (you'll need to add your service account key)
let serviceAccount;
try {
  serviceAccount = require('../../firebase-service-account.json');
} catch (error) {
  // If service account file doesn't exist, we'll use environment variables
  serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
  };
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Email configuration using Formspree
const EMAIL_ENDPOINT = 'https://formspree.io/f/xpzgwqzg'; // Replace with your Formspree endpoint

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { paymentIntentId, plan, userEmail, userName, userId } = JSON.parse(event.body);

    // Plan details
    const planDetails = {
      basic: { name: 'Basic', price: 5, features: ['Well-known professors', 'Basic response rate', 'Up to 6 professors'] },
      pro: { name: 'Pro', price: 15, features: ['Custom database of 100+ professors', 'Higher response rate', 'Send up to 50 emails'] },
      elite: { name: 'Elite', price: 50, features: ['Database of unlimited topics', 'Highest response rate', 'Unlimited email sending'] }
    };

    const selectedPlan = planDetails[plan];
    if (!selectedPlan) {
      throw new Error('Invalid plan selected');
    }

    // 1. Update Firebase with user's plan information
    if (userId) {
      try {
        await db.collection('users').doc(userId).update({
          activePlan: plan,
          planName: selectedPlan.name,
          planPrice: selectedPlan.price,
          planFeatures: selectedPlan.features,
          paymentIntentId: paymentIntentId,
          paymentDate: admin.firestore.FieldValue.serverTimestamp(),
          planStatus: 'active'
        });
        console.log('✅ Firebase updated successfully for user:', userId);
      } catch (firebaseError) {
        console.error('❌ Firebase update failed:', firebaseError);
        // Continue with email even if Firebase fails
      }
    }

    // 2. Send email notification using Formspree
    const emailData = {
      _subject: `🎉 New Payment Received - ${selectedPlan.name} Plan`,
      _replyto: userEmail || 'customer@oppfinity.com',
      customerName: userName || 'Valued Customer',
      customerEmail: userEmail || 'customer@oppfinity.com',
      planName: selectedPlan.name,
      planPrice: `$${selectedPlan.price}`,
      planFeatures: selectedPlan.features.join(', '),
      paymentIntentId: paymentIntentId,
      paymentDate: new Date().toLocaleString(),
      message: `
        A new payment has been received for the ${selectedPlan.name} plan.
        
        Customer Details:
        - Name: ${userName || 'Not provided'}
        - Email: ${userEmail || 'Not provided'}
        - Plan: ${selectedPlan.name}
        - Price: $${selectedPlan.price}
        - Payment ID: ${paymentIntentId}
        
        Plan Features:
        ${selectedPlan.features.map(feature => `• ${feature}`).join('\n')}
        
        This customer now has access to the ${selectedPlan.name} features.
      `
    };

    const emailResponse = await fetch(EMAIL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    if (!emailResponse.ok) {
      throw new Error(`Email notification failed: ${emailResponse.statusText}`);
    }

    console.log('✅ Email notification sent successfully');

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Payment processed successfully',
        plan: selectedPlan.name,
        firebaseUpdated: !!userId,
        emailSent: true
      })
    };

  } catch (error) {
    console.error('❌ Payment processing error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to process payment success',
        details: error.message
      })
    };
  }
}; 