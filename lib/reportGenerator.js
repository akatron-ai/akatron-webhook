/**
 * AKATRON Email Risk Report Generator
 * Generates detailed PDF reports for email breach analysis
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');

// LeakCheck API configuration
const LEAKCHECK_API_KEY = process.env.LEAKCHECK_API_KEY || 'a37579091795e7ff808a10dba05bec9e28762d15';
const LEAKCHECK_API_URL = 'https://leakcheck.io/api/public';

/**
 * Fetch breach data from LeakCheck API
 */
async function fetchBreachData(email) {
    try {
        const response = await fetch(`${LEAKCHECK_API_URL}?check=${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: {
                'X-API-Key': LEAKCHECK_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`LeakCheck API error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching breach data:', error);
        throw error;
    }
}

/**
 * Generate PDF report
 */
async function generateReport(email, breachData, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            // Create PDF document
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });

            // Pipe to file
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // Colors
            const goldColor = '#DAA520';
            const redColor = '#EF4444';
            const greenColor = '#22C55E';
            const grayColor = '#8A8F98';

            // Header
            doc.fontSize(28)
               .fillColor(goldColor)
               .text('AKATRON', { align: 'center' });
            
            doc.fontSize(12)
               .fillColor(grayColor)
               .text('Elite Cybersecurity & OSINT Intelligence', { align: 'center' });
            
            doc.moveDown(2);

            // Report Title
            doc.fontSize(20)
               .fillColor('#000000')
               .text('Email Risk Analysis Report', { align: 'center' });
            
            doc.moveDown(0.5);
            doc.fontSize(10)
               .fillColor(grayColor)
               .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
            
            doc.moveDown(2);

            // Email Address Section
            doc.fontSize(14)
               .fillColor(goldColor)
               .text('Analyzed Email Address:');
            
            doc.fontSize(12)
               .fillColor('#000000')
               .text(email);
            
            doc.moveDown(1.5);

            // Breach Summary
            const breachCount = breachData.found || 0;
            const sources = breachData.sources || [];

            doc.fontSize(14)
               .fillColor(goldColor)
               .text('Breach Summary:');
            
            doc.moveDown(0.5);

            if (breachCount > 0) {
                // Breached
                doc.fontSize(12)
                   .fillColor(redColor)
                   .text(`⚠️ ALERT: This email was found in ${breachCount} data breach${breachCount > 1 ? 'es' : ''}`);
                
                doc.moveDown(0.5);
                doc.fontSize(10)
                   .fillColor('#000000')
                   .text('Your email and associated data may have been exposed in the following breaches:');
            } else {
                // Safe
                doc.fontSize(12)
                   .fillColor(greenColor)
                   .text('✅ GOOD NEWS: No breaches found in our database');
                
                doc.moveDown(0.5);
                doc.fontSize(10)
                   .fillColor('#000000')
                   .text('Your email was not found in any known data breaches at this time.');
            }

            doc.moveDown(2);

            // Detailed Breach Information
            if (sources.length > 0) {
                doc.fontSize(14)
                   .fillColor(goldColor)
                   .text('Detailed Breach Information:');
                
                doc.moveDown(1);

                sources.forEach((source, index) => {
                    // Breach box
                    const boxY = doc.y;
                    
                    doc.fontSize(12)
                       .fillColor(redColor)
                       .text(`${index + 1}. ${source.name || 'Unknown Source'}`);
                    
                    doc.fontSize(10)
                       .fillColor(grayColor)
                       .text(`Date: ${source.date || 'Unknown'}`);
                    
                    if (source.fields && source.fields.length > 0) {
                        doc.text(`Exposed Data: ${source.fields.join(', ')}`);
                    }
                    
                    doc.moveDown(1);

                    // Add page break if needed
                    if (doc.y > 700) {
                        doc.addPage();
                    }
                });
            }

            // Recommendations Section
            doc.addPage();
            
            doc.fontSize(16)
               .fillColor(goldColor)
               .text('Security Recommendations', { align: 'center' });
            
            doc.moveDown(1.5);

            const recommendations = [
                {
                    title: '1. Change Your Passwords Immediately',
                    text: 'Update passwords on all accounts associated with this email. Use strong, unique passwords for each service.'
                },
                {
                    title: '2. Enable Two-Factor Authentication (2FA)',
                    text: 'Add an extra layer of security by enabling 2FA on all important accounts (email, banking, social media).'
                },
                {
                    title: '3. Monitor Your Accounts',
                    text: 'Regularly check your financial statements and account activity for any suspicious transactions or unauthorized access.'
                },
                {
                    title: '4. Use a Password Manager',
                    text: 'Consider using a reputable password manager to generate and store strong, unique passwords for all your accounts.'
                },
                {
                    title: '5. Be Cautious of Phishing',
                    text: 'Be extra vigilant about phishing emails and suspicious links, especially if your data has been compromised.'
                },
                {
                    title: '6. Consider Dark Web Monitoring',
                    text: 'Sign up for continuous monitoring services to get alerts if your information appears in new breaches.'
                }
            ];

            recommendations.forEach(rec => {
                doc.fontSize(12)
                   .fillColor('#000000')
                   .text(rec.title, { continued: false });
                
                doc.fontSize(10)
                   .fillColor(grayColor)
                   .text(rec.text);
                
                doc.moveDown(1);
            });

            // Footer
            doc.moveDown(2);
            doc.fontSize(8)
               .fillColor(grayColor)
               .text('This report is confidential and intended solely for the recipient.', { align: 'center' });
            
            doc.text('AKATRON provides cybersecurity intelligence for defensive, ethical, and lawful purposes only.', { align: 'center' });
            
            doc.moveDown(0.5);
            doc.fillColor(goldColor)
               .text('© 2025 AKATRON. All rights reserved.', { align: 'center' });

            // Finalize PDF
            doc.end();

            // Wait for stream to finish
            stream.on('finish', () => {
                console.log('PDF report generated successfully:', outputPath);
                resolve(outputPath);
            });

            stream.on('error', (error) => {
                console.error('Error writing PDF:', error);
                reject(error);
            });

        } catch (error) {
            console.error('Error generating PDF:', error);
            reject(error);
        }
    });
}

/**
 * Main function to generate complete report
 */
async function createEmailRiskReport(email) {
    try {
        console.log('Generating report for:', email);

        // Fetch breach data
        const breachData = await fetchBreachData(email);
        console.log('Breach data fetched:', breachData);

        // Generate PDF
        const timestamp = Date.now();
        const outputPath = `/tmp/email-risk-report-${timestamp}.pdf`;
        
        await generateReport(email, breachData, outputPath);

        return {
            success: true,
            reportPath: outputPath,
            breachCount: breachData.found || 0,
            email: email
        };

    } catch (error) {
        console.error('Error creating report:', error);
        throw error;
    }
}

module.exports = {
    createEmailRiskReport,
    fetchBreachData,
    generateReport
};
