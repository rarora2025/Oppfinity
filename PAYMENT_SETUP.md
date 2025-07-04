# Oppfinity Payment Setup Guide

This guide will help you set up real payment processing using Stripe for the Oppfinity application.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Node.js installed on your system
3. The Oppfinity application files

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Stripe

1. **Create a Stripe Account**
   - Go to https://stripe.com and create an account
   - Complete the verification process

2. **Get Your API Keys**
   - In your Stripe Dashboard, go to Developers > API keys
   - Copy your **Publishable key** and **Secret key**

3. **Set Environment Variables**
   Create a `.env` file in the root directory:
   ```
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   PORT=3000
   ```

### 3. Update Frontend Configuration

In `checkout.html`, replace the test publishable key with your actual key:

```javascript
// Replace this line in checkout.html
stripe = Stripe('pk_test_51ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890EFG');

// With your actual publishable key
stripe = Stripe('pk_test_your_publishable_key_here');
```

### 4. Start the Server

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Testing Payments

### Test Card Numbers

Use these test card numbers for testing:

- **Successful Payment**: `4242 4242 4242 4242`
- **Declined Payment**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### Test Data

- **Expiry Date**: Any future date (e.g., `12/25`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP Code**: Any 5 digits (e.g., `12345`)

## Production Deployment

### 1. Switch to Live Keys

When ready for production:

1. Replace test keys with live keys in your environment
2. Update the publishable key in `checkout.html`
3. Ensure your domain is added to Stripe's allowed domains

### 2. Security Considerations

- Never expose your secret key in frontend code
- Always use HTTPS in production
- Implement proper error handling
- Add webhook handling for payment confirmations

### 3. Additional Payment Methods

To add PayPal and Apple Pay:

1. **PayPal**: Integrate with PayPal Checkout API
2. **Apple Pay**: Use Stripe's Apple Pay integration

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Check that your API keys are correct
   - Ensure you're using test keys for testing

2. **Payment fails**
   - Check the browser console for errors
   - Verify the server is running
   - Check Stripe Dashboard for payment attempts

3. **CORS errors**
   - Ensure the server is running on the correct port
   - Check that CORS is properly configured

### Getting Help

- Check Stripe documentation: https://stripe.com/docs
- Review server logs for error messages
- Test with Stripe's test mode first

## File Structure

```
oppfinity/
├── server.js              # Payment server
├── checkout.html          # Payment form
├── package.json           # Dependencies
├── .env                   # Environment variables (create this)
└── PAYMENT_SETUP.md       # This file
```

## Next Steps

1. Test the payment flow thoroughly
2. Add webhook handling for payment confirmations
3. Implement user account management
4. Add payment history and receipts
5. Consider adding subscription support for recurring payments 