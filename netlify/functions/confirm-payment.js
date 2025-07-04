const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed'
        };
    }

    try {
        const { paymentIntentId, plan } = JSON.parse(event.body);

        // Retrieve the payment intent to check its status
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            // Payment was successful, you can add additional logic here
            // like updating user subscription, sending confirmation emails, etc.
            
            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    message: 'Payment confirmed successfully',
                    plan: plan
                })
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Payment not completed'
                })
            };
        }
    } catch (error) {
        console.error('Payment confirmation error:', error);
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: error.message
            })
        };
    }
}; 