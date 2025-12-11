import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
    // You can use Gmail, Outlook, or any SMTP service
    // For Gmail, you'll need to use an App Password (not your regular password)
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER, // Your email
            pass: process.env.SMTP_PASSWORD, // Your email password or app password
        },
    });
};

// Contact form submission endpoint
router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, message } = req.body;

        // Validate required fields
        if (!email || !message) {
            return res.status(400).json({ 
                error: 'Email and message are required fields.' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Please provide a valid email address.' 
            });
        }

        // Check if SMTP credentials are configured
        if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            console.error('SMTP credentials not configured');
            return res.status(500).json({ 
                error: 'Email service is not configured. Please contact the administrator.' 
            });
        }

        const transporter = createTransporter();

        // Email content
        const mailOptions = {
            from: `"${firstName || 'Contact'} ${lastName || 'Form'}" <${process.env.SMTP_USER}>`,
            replyTo: email, // So you can reply directly to the sender
            to: process.env.CONTACT_EMAIL || process.env.SMTP_USER, // Your email address
            subject: `New Contact Form Submission from ${firstName || 'Unknown'} ${lastName || ''}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
                        New Contact Form Submission
                    </h2>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <p><strong style="color: #555;">Name:</strong> ${firstName || 'Not provided'} ${lastName || ''}</p>
                        <p><strong style="color: #555;">Email:</strong> <a href="mailto:${email}">${email}</a></p>
                        ${phone ? `<p><strong style="color: #555;">Phone:</strong> ${phone}</p>` : ''}
                    </div>
                    
                    <div style="background-color: #fff; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Message:</h3>
                        <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
                        <p>This email was sent from the Contact Us form on your website.</p>
                        <p>You can reply directly to this email to respond to ${firstName || 'the sender'}.</p>
                    </div>
                </div>
            `,
            text: `
New Contact Form Submission

Name: ${firstName || 'Not provided'} ${lastName || ''}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}

Message:
${message}

---
This email was sent from the Contact Us form on your website.
You can reply directly to this email to respond to ${firstName || 'the sender'}.
            `,
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        
        console.log('Contact form email sent:', info.messageId);

        res.json({ 
            success: true, 
            message: 'Thank you for your message! We will get back to you soon.',
            messageId: info.messageId 
        });

    } catch (error) {
        console.error('Error sending contact form email:', error);
        res.status(500).json({ 
            error: 'Failed to send your message. Please try again later or contact us directly.' 
        });
    }
});

export default router;

