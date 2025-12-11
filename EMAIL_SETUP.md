# Email Configuration Setup

To enable email functionality for the contact form, you need to configure SMTP settings in your `.env` file.

## Required Environment Variables

Add these variables to your `backend/.env` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Contact email (where contact form emails will be sent)
CONTACT_EMAIL=your-email@gmail.com
```

## Gmail Setup (Recommended)

### Step 1: Enable 2-Step Verification
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to Google Account → Security
2. Under "2-Step Verification", click "App passwords"
3. Select "Mail" and "Other (Custom name)"
4. Enter "Contact Form" as the name
5. Click "Generate"
6. Copy the 16-character password (no spaces)

### Step 3: Add to .env
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
CONTACT_EMAIL=your-email@gmail.com
```

## Outlook/Hotmail Setup

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
CONTACT_EMAIL=your-email@outlook.com
```

## Other SMTP Providers

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
CONTACT_EMAIL=your-email@example.com
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASSWORD=your-mailgun-password
CONTACT_EMAIL=your-email@example.com
```

## Testing

After configuring, restart your backend server:
```bash
cd backend
npm run dev
```

Then test the contact form. If emails aren't sending, check:
1. Environment variables are set correctly
2. SMTP credentials are valid
3. Firewall/security settings allow SMTP connections
4. Check server logs for error messages

## Security Notes

- Never commit your `.env` file to version control
- Use App Passwords for Gmail (not your regular password)
- Consider using environment-specific email addresses for testing
- For production, consider using a dedicated email service like SendGrid or Mailgun

