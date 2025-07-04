const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed'
        };
    }

    try {
        const { paymentMethodId, amount } = JSON.parse(event.body);

        // Create a PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            payment_method: paymentMethodId,
            confirm: true,
            return_url: 'https://oppfinity.com/success.html'
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                clientSecret: paymentIntent.client_secret
            })
        };
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: error.message
            })
        };
    }
}; 