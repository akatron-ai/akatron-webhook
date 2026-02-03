/**
 * AKATRON Email Sender
 * Sends email reports to customers using Gmail
 */

const nodemailer = require('nodemailer');
const fs = require('fs');

// Gmail configuration
const GMAIL_USER = process.env.GMAIL_USER || 'arpitkatiayar261@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';

/**
 * Create email transporter
 */
function createTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_APP_PASSWORD
        }
    });
}

/**
 * Send email with PDF attachment
 */
async function sendReportEmail(customerEmail, reportPath, breachCount, paymentId) {
    try {
        const transporter = createTransporter();

        // Read PDF file
        const pdfBuffer = fs.readFileSync(reportPath);

        // Email subject based on breach status
        const subject = breachCount > 0 
            ? `⚠️ URGENT: Your Email Risk Analysis Report - ${breachCount} Breach${breachCount > 1 ? 'es' : ''} Found`
            : `✅ Your Email Risk Analysis Report - No Breaches Found`;

        // Email body
        const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #DAA520 0%, #B8860B 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .alert-box {
            background: ${breachCount > 0 ? '#FEE2E2' : '#D1FAE5'};
            border-left: 4px solid ${breachCount > 0 ? '#EF4444' : '#22C55E'};
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .alert-box h2 {
            margin: 0 0 10px 0;
            color: ${breachCount > 0 ? '#EF4444' : '#22C55E'};
        }
        .button {
            display: inline-block;
            background: #DAA520;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
        }
        .recommendations {
            background: white;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .recommendations h3 {
            color: #DAA520;
            margin-top: 0;
        }
        .recommendations ul {
            padding-left: 20px;
        }
        .recommendations li {
            margin: 10px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>AKATRON</h1>
        <p>Elite Cybersecurity & OSINT Intelligence</p>
    </div>
    
    <div class="content">
        <h2>Your Email Risk Analysis Report is Ready</h2>
        
        <p>Dear Customer,</p>
        
        <p>Thank you for using AKATRON's Email Risk Analysis service. We've completed a comprehensive scan of your email address against our database of known data breaches.</p>
        
        <div class="alert-box">
            <h2>${breachCount > 0 ? '⚠️ Breaches Detected' : '✅ No Breaches Found'}</h2>
            <p>
                ${breachCount > 0 
                    ? `Your email was found in <strong>${breachCount} data breach${breachCount > 1 ? 'es' : ''}</strong>. Please review the attached report immediately and take the recommended security actions.`
                    : 'Good news! Your email was not found in any known data breaches in our database. However, we recommend staying vigilant and following security best practices.'
                }
            </p>
        </div>
        
        <p><strong>📎 Your detailed report is attached to this email as a PDF.</strong></p>
        
        ${breachCount > 0 ? `
        <div class="recommendations">
            <h3>🔒 Immediate Actions Required:</h3>
            <ul>
                <li><strong>Change your passwords</strong> on all accounts using this email</li>
                <li><strong>Enable two-factor authentication (2FA)</strong> wherever possible</li>
                <li><strong>Monitor your accounts</strong> for suspicious activity</li>
                <li><strong>Review the detailed report</strong> to see what data was exposed</li>
            </ul>
        </div>
        ` : `
        <div class="recommendations">
            <h3>🛡️ Stay Protected:</h3>
            <ul>
                <li>Use strong, unique passwords for each account</li>
                <li>Enable two-factor authentication (2FA)</li>
                <li>Regularly monitor your email for suspicious activity</li>
                <li>Consider dark web monitoring for ongoing protection</li>
            </ul>
        </div>
        `}
        
        <p><strong>Payment Confirmation:</strong><br>
        Payment ID: ${paymentId}<br>
        Amount: ₹499</p>
        
        <p>If you have any questions or need further assistance, please don't hesitate to contact us.</p>
        
        <p>Stay safe online,<br>
        <strong>The AKATRON Team</strong></p>
    </div>
    
    <div class="footer">
        <p>This report is confidential and intended solely for the recipient.</p>
        <p>AKATRON provides cybersecurity intelligence for defensive, ethical, and lawful purposes only.</p>
        <p>© 2025 AKATRON. All rights reserved.</p>
    </div>
</body>
</html>
        `;

        // Email options
        const mailOptions = {
            from: `AKATRON <${GMAIL_USER}>`,
            to: customerEmail,
            subject: subject,
            html: htmlBody,
            attachments: [
                {
                    filename: `AKATRON-Email-Risk-Report-${Date.now()}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        
        console.log('Email sent successfully:', info.messageId);
        console.log('Recipient:', customerEmail);

        return {
            success: true,
            messageId: info.messageId,
            recipient: customerEmail
        };

    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

/**
 * Send payment failure notification
 */
async function sendPaymentFailureEmail(customerEmail, errorDescription) {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `AKATRON <${GMAIL_USER}>`,
            to: customerEmail,
            subject: '❌ Payment Failed - AKATRON Email Risk Analysis',
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: #EF4444;
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .button {
            display: inline-block;
            background: #DAA520;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Payment Failed</h1>
    </div>
    
    <div class="content">
        <p>Dear Customer,</p>
        
        <p>We're sorry, but your payment for the AKATRON Email Risk Analysis service could not be processed.</p>
        
        <p><strong>Error:</strong> ${errorDescription || 'Payment processing failed'}</p>
        
        <p>Please try again or contact your bank if the issue persists.</p>
        
        <a href="https://razorpay.me/@akatronai" class="button">Try Again</a>
        
        <p>If you need assistance, please contact us at ${GMAIL_USER}</p>
        
        <p>Best regards,<br>
        <strong>The AKATRON Team</strong></p>
    </div>
</body>
</html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Payment failure email sent:', info.messageId);

        return {
            success: true,
            messageId: info.messageId
        };

    } catch (error) {
        console.error('Error sending payment failure email:', error);
        throw error;
    }
}

module.exports = {
    sendReportEmail,
    sendPaymentFailureEmail
};
