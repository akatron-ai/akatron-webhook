# AKATRON Webhook Server

Automated payment processing and report generation system for AKATRON Email Risk Analysis service.

## 🚀 Features

- ✅ **Razorpay Webhook Integration** - Receives payment notifications
- ✅ **Automated Report Generation** - Creates detailed PDF reports
- ✅ **Email Delivery** - Sends reports to customers automatically
- ✅ **Payment Verification** - Validates webhook signatures
- ✅ **Error Handling** - Graceful failure management

## 📋 How It Works

```
Customer pays ₹499
    ↓
Razorpay sends webhook → This server
    ↓
Generate PDF report (LeakCheck API)
    ↓
Email report to customer (Gmail)
    ↓
100% Automated ✅
```

## 🛠️ Setup Instructions

### Step 1: Deploy to Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Clone this repository**:
   ```bash
   git clone https://github.com/akatron-ai/akatron-webhook.git
   cd akatron-webhook
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? **Your account**
   - Link to existing project? **N**
   - Project name? **akatron-webhook**
   - Directory? **./  (just press Enter)**
   - Override settings? **N**

4. **Note your deployment URL**:
   ```
   https://akatron-webhook.vercel.app
   ```

### Step 2: Configure Environment Variables

Set these in Vercel Dashboard (Settings → Environment Variables):

```bash
# Razorpay Webhook Secret (get from Razorpay dashboard)
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# LeakCheck API Key
LEAKCHECK_API_KEY=a37579091795e7ff808a10dba05bec9e28762d15

# Gmail Configuration
GMAIL_USER=arpitkatiayar261@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password_here
```

### Step 3: Get Gmail App Password

1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already enabled)
3. Go to: https://myaccount.google.com/apppasswords
4. Create new app password:
   - App: **Mail**
   - Device: **Other (Custom name)** → "AKATRON Webhook"
5. Copy the 16-character password
6. Add to Vercel environment variables as `GMAIL_APP_PASSWORD`

### Step 4: Configure Razorpay Webhook

1. **Go to Razorpay Dashboard**: https://dashboard.razorpay.com/
2. **Navigate to**: Settings → Webhooks
3. **Click**: "Add New Webhook"
4. **Enter Details**:
   - Webhook URL: `https://akatron-webhook.vercel.app/api/webhook`
   - Active Events: Select **payment.captured** and **payment.failed**
   - Secret: (Razorpay will generate this - copy it)
5. **Click**: "Create Webhook"
6. **Copy the Secret** and add to Vercel environment variables

### Step 5: Redeploy with Environment Variables

```bash
vercel --prod
```

## 🧪 Testing

### Test Webhook Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run locally**:
   ```bash
   vercel dev
   ```

3. **Test with curl**:
   ```bash
   curl -X POST http://localhost:3000/api/webhook \
     -H "Content-Type: application/json" \
     -H "x-razorpay-signature: test" \
     -d '{
       "event": "payment.captured",
       "payload": {
         "payment": {
           "entity": {
             "id": "pay_test123",
             "amount": 49900,
             "email": "test@example.com",
             "method": "card"
           }
         }
       }
     }'
   ```

### Test with Real Payment

1. Make a test payment via: https://razorpay.me/@akatronai
2. Check Vercel logs for webhook processing
3. Verify email received with PDF report

## 📊 Monitoring

### View Logs

**Vercel Dashboard**:
1. Go to: https://vercel.com/dashboard
2. Select: **akatron-webhook** project
3. Click: **Deployments** → Latest deployment → **Logs**

**Real-time logs**:
```bash
vercel logs --follow
```

### Check Webhook Status

**Razorpay Dashboard**:
1. Go to: Settings → Webhooks
2. Click on your webhook
3. View: **Recent Deliveries** tab
4. Check: Success/Failure status

## 🔧 Troubleshooting

### Webhook Not Receiving Events

1. **Check Razorpay webhook URL** is correct
2. **Verify webhook is active** in Razorpay dashboard
3. **Check Vercel deployment** is successful
4. **View Razorpay webhook logs** for delivery errors

### Email Not Sending

1. **Verify Gmail App Password** is correct
2. **Check Gmail account** allows less secure apps
3. **View Vercel logs** for email errors
4. **Test Gmail credentials** manually

### PDF Generation Failing

1. **Check LeakCheck API key** is valid
2. **Verify API quota** not exceeded
3. **View Vercel logs** for generation errors

## 📁 Project Structure

```
akatron-webhook/
├── api/
│   └── webhook.js          # Main webhook handler
├── lib/
│   ├── reportGenerator.js  # PDF report generation
│   └── emailSender.js      # Email delivery
├── package.json            # Dependencies
├── vercel.json            # Vercel configuration
└── README.md              # This file
```

## 🔐 Security

- ✅ Webhook signature verification
- ✅ Environment variable encryption
- ✅ HTTPS-only communication
- ✅ No sensitive data in logs

## 📝 License

MIT License - © 2025 AKATRON

## 🆘 Support

For issues or questions:
- Email: arpitkatiayar261@gmail.com
- GitHub Issues: https://github.com/akatron-ai/akatron-webhook/issues
