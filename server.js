const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

// Stripe configuration
let stripe;
let stripePublishableKey;

// Function to initialize Stripe with fetched keys
async function initializeStripe() {
    try {
        // Fetch secret key from your API
        const secretKeyResponse = await fetch('https://api.npoint.io/fa7eb3de97c1f5c746a5/api_keys/stripe/secret');
        const secretKey = (await secretKeyResponse.text()).replace(/"/g, '');
        
        // Fetch publishable key from your API
        const publishableKeyResponse = await fetch('https://api.npoint.io/fa7eb3de97c1f5c746a5/api_keys/stripe/publishable');
        stripePublishableKey = (await publishableKeyResponse.text()).replace(/"/g, '');
        
        // Initialize Stripe
        stripe = require('stripe')(secretKey);
        
        console.log('✅ Stripe initialized successfully');
        console.log('📝 Publishable key available for frontend');
        
    } catch (error) {
        console.error('❌ Failed to initialize Stripe:', error);
        process.exit(1);
    }
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Endpoint to get publishable key
app.get('/api/stripe-key', (req, res) => {
    res.json({ publishableKey: stripePublishableKey });
});

// Stripe payment endpoint
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { plan, amount } = req.body;
    
    // Validate plan and amount
    const planDetails = {
      basic: { amount: 500, name: 'Basic Plan' }, // $5.00 in cents
      pro: { amount: 1500, name: 'Pro Plan' },    // $15.00 in cents
      elite: { amount: 5000, name: 'Elite Plan' } // $50.00 in cents
    };
    
    const planInfo = planDetails[plan];
    if (!planInfo || planInfo.amount !== amount) {
      return res.status(400).json({ error: 'Invalid plan or amount' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: {
        plan: plan,
        planName: planInfo.name
      },
      description: `Oppfinity ${planInfo.name} - Research Opportunity Platform`
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent creation failed:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Payment confirmation endpoint
app.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, plan } = req.body;
    
    // Retrieve the payment intent to confirm it was successful
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Payment was successful - you could store this in a database
      console.log(`Payment successful for ${plan} plan: ${paymentIntentId}`);
      
      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        plan: plan,
        paymentId: paymentIntentId
      });
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Payment confirmation failed:', error);
    res.status(500).json({ error: 'Payment confirmation failed' });
  }
});

// Serve the main HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'checkout.html'));
});

app.get('/checkout.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'checkout.html'));
});

app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'success.html'));
});

app.get('/success.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'success.html'));
});

// Initialize Stripe and start server
async function startServer() {
    await initializeStripe();
    
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`💳 Stripe integration ready for production!`);
        console.log(`🌐 Access your app at: http://localhost:${PORT}`);
    });
}

startServer().catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
}); 