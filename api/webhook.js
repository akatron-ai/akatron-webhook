/**
 * AKATRON Razorpay Webhook Handler
 * Processes payment notifications and triggers automated report generation
 */

const crypto = require('crypto');
const { createEmailRiskReport } = require('../lib/reportGenerator');
const { sendReportEmail, sendPaymentFailureEmail } = require('../lib/emailSender');

// Razorpay webhook secret (will be set in Vercel environment)
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

/**
 * Verify Razorpay webhook signature
 * This ensures the webhook is genuinely from Razorpay
 */
function verifyWebhookSignature(body, signature) {
    if (!RAZORPAY_WEBHOOK_SECRET) {
        console.warn('WARNING: RAZORPAY_WEBHOOK_SECRET not set - skipping signature verification');
        return true; // Allow in development
    }
    
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
        
        if (!signature && RAZORPAY_WEBHOOK_SECRET) {
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

        console.log('✅ Received webhook event:', event);
        console.log('📦 Payload:', JSON.stringify(payload, null, 2));

        // Handle different webhook events
        switch (event) {
            case 'payment.captured':
                await handlePaymentCaptured(payload.payment.entity);
                break;
            
            case 'payment.failed':
                await handlePaymentFailed(payload.payment.entity);
                break;
            
            default:
                console.log('ℹ️ Unhandled event type:', event);
        }

        // Acknowledge receipt
        return res.status(200).json({ 
            success: true,
            message: 'Webhook processed successfully',
            event: event
        });

    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message
        });
    }
};

/**
 * Handle successful payment - Generate and send report
 */
async function handlePaymentCaptured(payment) {
    console.log('💰 Payment captured:', payment.id);
    console.log('💵 Amount:', payment.amount / 100, 'INR');
    console.log('📧 Customer email:', payment.email);
    console.log('📱 Customer contact:', payment.contact);

    try {
        // Extract customer details
        const customerEmail = payment.email;
        const amount = payment.amount / 100; // Convert paise to rupees
        const paymentId = payment.id;
        const paymentMethod = payment.method;

        // Validate customer email
        if (!customerEmail) {
            console.error('❌ No customer email found in payment data');
            return;
        }

        console.log('📊 Generating email risk report for:', customerEmail);

        // Step 1: Generate PDF report
        const reportResult = await createEmailRiskReport(customerEmail);
        console.log('✅ Report generated:', reportResult.reportPath);
        console.log('🔍 Breaches found:', reportResult.breachCount);

        // Step 2: Send email with report
        console.log('📧 Sending report email to:', customerEmail);
        const emailResult = await sendReportEmail(
            customerEmail,
            reportResult.reportPath,
            reportResult.breachCount,
            paymentId
        );
        console.log('✅ Email sent successfully:', emailResult.messageId);

        // Step 3: Log success
        console.log('🎉 AUTOMATION COMPLETE:', {
            email: customerEmail,
            amount: amount,
            paymentId: paymentId,
            method: paymentMethod,
            breachCount: reportResult.breachCount,
            emailSent: true,
            messageId: emailResult.messageId
        });

        // TODO: Store in database for record keeping
        // This can be added later for analytics and customer history

    } catch (error) {
        console.error('❌ Error processing payment:', error);
        
        // Try to notify customer about the error
        try {
            // TODO: Send error notification email
            console.log('⚠️ TODO: Send error notification to customer');
        } catch (notifyError) {
            console.error('❌ Failed to send error notification:', notifyError);
        }
    }
}

/**
 * Handle failed payment - Send notification
 */
async function handlePaymentFailed(payment) {
    console.log('❌ Payment failed:', payment.id);
    console.log('⚠️ Error:', payment.error_description);
    
    try {
        const customerEmail = payment.email;
        
        if (customerEmail) {
            console.log('📧 Sending payment failure notification to:', customerEmail);
            await sendPaymentFailureEmail(customerEmail, payment.error_description);
            console.log('✅ Failure notification sent');
        }
    } catch (error) {
        console.error('❌ Error handling payment failure:', error);
    }
}
