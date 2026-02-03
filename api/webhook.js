/**
 * AKATRON Razorpay Webhook Handler
 * Processes payment notifications and triggers report generation
 */

const crypto = require('crypto');

// Razorpay webhook secret (will be set in Vercel environment)
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret_here';

/**
 * Verify Razorpay webhook signature
 * This ensures the webhook is genuinely from Razorpay
 */
function verifyWebhookSignature(body, signature) {
    const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(body))
        .digest('hex');
    
    return expectedSignature === signature;
}

/**
 * Main webhook handler
 */
module.exports = async (req, res) => {
    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            message: 'This endpoint only accepts POST requests'
        });
    }

    try {
        // Get webhook signature from headers
        const signature = req.headers['x-razorpay-signature'];
        
        if (!signature) {
            console.error('Missing webhook signature');
            return res.status(400).json({ 
                error: 'Missing signature',
                message: 'Webhook signature not found in headers'
            });
        }

        // Verify webhook authenticity
        const isValid = verifyWebhookSignature(req.body, signature);
        
        if (!isValid) {
            console.error('Invalid webhook signature');
            return res.status(401).json({ 
                error: 'Invalid signature',
                message: 'Webhook signature verification failed'
            });
        }

        // Parse webhook event
        const event = req.body.event;
        const payload = req.body.payload;

        console.log('Received webhook event:', event);
        console.log('Payload:', JSON.stringify(payload, null, 2));

        // Handle different webhook events
        switch (event) {
            case 'payment.captured':
                await handlePaymentCaptured(payload.payment.entity);
                break;
            
            case 'payment.failed':
                await handlePaymentFailed(payload.payment.entity);
                break;
            
            default:
                console.log('Unhandled event type:', event);
        }

        // Acknowledge receipt
        return res.status(200).json({ 
            success: true,
            message: 'Webhook processed successfully'
        });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message
        });
    }
};

/**
 * Handle successful payment
 */
async function handlePaymentCaptured(payment) {
    console.log('Payment captured:', payment.id);
    console.log('Amount:', payment.amount / 100, 'INR');
    console.log('Customer email:', payment.email);
    console.log('Customer contact:', payment.contact);

    // Extract customer details
    const customerEmail = payment.email;
    const amount = payment.amount / 100; // Convert paise to rupees
    const paymentId = payment.id;
    const paymentMethod = payment.method;

    // TODO: Generate and send report
    // This will be implemented in the next file
    console.log('TODO: Generate report for', customerEmail);
    
    // For now, just log the payment
    console.log('Payment processed successfully:', {
        email: customerEmail,
        amount: amount,
        paymentId: paymentId,
        method: paymentMethod
    });
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(payment) {
    console.log('Payment failed:', payment.id);
    console.log('Error:', payment.error_description);
    
    // TODO: Send failure notification email
    console.log('TODO: Notify customer about payment failure');
}
