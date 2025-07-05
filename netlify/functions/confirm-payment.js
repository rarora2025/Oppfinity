const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed'
        };
    }

    try {
        const { paymentIntentId, plan, userEmail, userName, userId } = JSON.parse(event.body);

        // Retrieve the payment intent to check its status
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            // Call the process-payment-success function to handle email and Firebase updates
            try {
                const processResponse = await fetch(`${process.env.URL}/.netlify/functions/process-payment-success`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        paymentIntentId: paymentIntentId,
                        plan: plan,
                        userEmail: userEmail || paymentIntent.receipt_email || paymentIntent.customer_details?.email,
                        userName: userName || paymentIntent.customer_details?.name,
                        userId: userId || paymentIntent.metadata?.userId
                    })
                });

                const processResult = await processResponse.json();
                console.log('Payment processing result:', processResult);
            } catch (processError) {
                console.error('Failed to process payment success:', processError);
                // Continue even if processing fails
            }
            
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