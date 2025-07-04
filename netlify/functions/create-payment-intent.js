const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed'
        };
    }

    try {
        const { plan, amount } = JSON.parse(event.body);

        // Create a PaymentIntent without immediate confirmation
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            // Don't confirm immediately - let the frontend handle confirmation
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                plan: plan
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                clientSecret: paymentIntent.client_secret
            })
        };
    } catch (error) {
        console.error('Stripe error:', error);
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: error.message
            })
        };
    }
}; 