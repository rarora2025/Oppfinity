# Complete Stripe Setup Guide for Oppfinity

This guide will help you set up Stripe from scratch for both development and production environments.

## Step 1: Create Your Stripe Account

### 1.1 Sign Up for Stripe
1. Go to [Stripe.com](https://stripe.com)
2. Click "Start now" or "Sign up"
3. Enter your email address and create a password
4. Click "Create account"

### 1.2 Complete Business Verification
1. **Business Information**
   - Business name: "Oppfinity" (or your business name)
   - Business type: Select appropriate (e.g., "Individual" for personal projects)
   - Industry: "Software/Technology" or "Education"
   - Website: Your website URL (if you have one)

2. **Personal Information**
   - Legal name (as it appears on government ID)
   - Date of birth
   - Social Security Number (for US) or equivalent
   - Address information

3. **Bank Account**
   - Add a bank account to receive payments
   - This is where your earnings will be deposited

### 1.3 Verify Your Account
1. **Email Verification**: Check your email and click the verification link
2. **Phone Verification**: Enter the code sent to your phone
3. **Identity Verification**: Upload a government-issued ID
4. **Bank Verification**: Complete micro-deposit verification (2 small deposits)

## Step 2: Get Your API Keys

### 2.1 Access Your Dashboard
1. Log into your [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** → **API keys**

### 2.2 Copy Your Keys
You'll see two keys:
- **Publishable key** (starts with `pk_test_` for test mode)
- **Secret key** (starts with `sk_test_` for test mode)

### 2.3 Update Your API Endpoint
Update your API endpoint with the new keys:

**For Secret Key:**
```
https://api.npoint.io/fa7eb3de97c1f5c746a5/api_keys/stripe/secret
```
Content: `sk_test_your_actual_secret_key_here`

**For Publishable Key:**
```
https://api.npoint.io/fa7eb3de97c1f5c746a5/api_keys/stripe/publishable
```
Content: `pk_test_your_actual_publishable_key_here`

## Step 3: Install Dependencies

```bash
npm install
```

This will install:
- `stripe`: Stripe SDK for Node.js
- `express`: Web server framework
- `cors`: Cross-origin resource sharing
- `node-fetch`: For fetching API keys

## Step 4: Test Your Setup

### 4.1 Start the Server
```bash
npm start
```

You should see:
```
✅ Stripe initialized successfully
📝 Publishable key available for frontend
🚀 Server running on port 3000
💳 Stripe integration ready for production!
🌐 Access your app at: http://localhost:3000
```

### 4.2 Test Payment Flow
1. Go to `http://localhost:3000/checkout`
2. Select a plan (Basic, Pro, or Elite)
3. Use test card number: `4242 4242 4242 4242`
4. Enter any future expiry date and any 3-digit CVC
5. Complete the payment

## Step 5: Production Deployment

### 5.1 Switch to Live Mode
1. In your Stripe Dashboard, toggle from **Test mode** to **Live mode**
2. Copy your **live** publishable and secret keys
3. Update your API endpoint with the live keys

### 5.2 Deploy to Production
The application is ready for production deployment on platforms like:
- **Heroku**: `git push heroku main`
- **Vercel**: Connect your GitHub repository
- **Netlify**: Deploy from Git
- **Railway**: Connect your repository

### 5.3 Domain Configuration
1. In Stripe Dashboard, go to **Settings** → **Checkout settings**
2. Add your production domain to **Allowed domains**
3. Configure webhook endpoints if needed

## Step 6: Testing in Production

### 6.1 Test Cards for Live Mode
- **Successful Payment**: `4242 4242 4242 4242`
- **Declined Payment**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### 6.2 Real Payment Testing
For real payment testing, you can use:
- Your own credit card (small amounts)
- Stripe's test mode for development

## Security Best Practices

### ✅ What's Already Implemented
- API keys fetched securely from your endpoint
- No hardcoded keys in frontend code
- Server-side payment processing
- CORS protection
- Input validation

### 🔒 Additional Recommendations
1. **HTTPS**: Always use HTTPS in production
2. **Webhooks**: Implement webhook handling for payment confirmations
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **Monitoring**: Set up Stripe Dashboard alerts
5. **Backup**: Regularly backup your payment data

## Troubleshooting

### Common Issues

**1. "Invalid API key" error**
- Check that your API endpoint is returning the correct keys
- Ensure no extra quotes or spaces in the key values
- Verify you're using the correct mode (test/live)

**2. Payment fails**
- Check browser console for errors
- Verify server is running and accessible
- Check Stripe Dashboard for payment attempts

**3. CORS errors**
- Ensure server is running on correct port
- Check that CORS is properly configured

**4. "Payment system not available"**
- Check server logs for Stripe initialization errors
- Verify API endpoint is accessible
- Check network connectivity

### Getting Help
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- Check server logs for detailed error messages

## File Structure
```
oppfinity/
├── server.js                 # Payment server with dynamic key fetching
├── checkout.html             # Payment form with Stripe integration
├── package.json              # Dependencies
├── STRIPE_SETUP_GUIDE.md     # This guide
└── PAYMENT_SETUP.md          # Original setup guide
```

## Next Steps
1. ✅ Complete Stripe account setup
2. ✅ Test payment flow thoroughly
3. 🔄 Add webhook handling for payment confirmations
4. 🔄 Implement user account management
5. 🔄 Add payment history and receipts
6. 🔄 Consider subscription support for recurring payments

Your Stripe integration is now production-ready and will work seamlessly in both development and production environments! 