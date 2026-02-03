# 🚀 Quick Deployment Checklist

Follow these steps to get your automated system running in **15 minutes**.

---

## ✅ Step 1: Get Gmail App Password (5 minutes)

### Click by Click:

1. **Open**: https://myaccount.google.com/security
2. **Scroll down** to "2-Step Verification"
3. **If not enabled**: Click "Get Started" and follow setup
4. **Once enabled**: Go to https://myaccount.google.com/apppasswords
5. **Select app**: Mail
6. **Select device**: Other (Custom name)
7. **Type**: "AKATRON Webhook"
8. **Click**: Generate
9. **Copy** the 16-character password (format: xxxx xxxx xxxx xxxx)
10. **Save it** - you'll need it in Step 3

---

## ✅ Step 2: Deploy to Vercel (3 minutes)

### Option A: Deploy via GitHub (Recommended)

1. **Go to**: https://vercel.com/new
2. **Sign in** with GitHub
3. **Import** this repository: `akatron-ai/akatron-webhook`
4. **Click**: Deploy
5. **Wait** for deployment to complete
6. **Copy** your deployment URL: `https://akatron-webhook-xxxxx.vercel.app`

### Option B: Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project
cd akatron-webhook

# Deploy
vercel --prod
```

---

## ✅ Step 3: Add Environment Variables (3 minutes)

### In Vercel Dashboard:

1. **Go to**: https://vercel.com/dashboard
2. **Select**: akatron-webhook project
3. **Click**: Settings → Environment Variables
4. **Add these variables**:

```
Name: GMAIL_USER
Value: arpitkatiayar261@gmail.com

Name: GMAIL_APP_PASSWORD
Value: [paste the 16-char password from Step 1]

Name: LEAKCHECK_API_KEY
Value: a37579091795e7ff808a10dba05bec9e28762d15

Name: RAZORPAY_WEBHOOK_SECRET
Value: [leave empty for now - will add in Step 4]
```

5. **Click**: Save for each variable

---

## ✅ Step 4: Configure Razorpay Webhook (4 minutes)

### In Razorpay Dashboard:

1. **Go to**: https://dashboard.razorpay.com/
2. **Navigate to**: Settings → Webhooks
3. **Click**: "Add New Webhook"
4. **Fill in**:
   - **Webhook URL**: `https://your-vercel-url.vercel.app/api/webhook`
   - **Active Events**: Check these boxes:
     - ✅ payment.captured
     - ✅ payment.failed
   - **Alert Email**: arpitkatiayar261@gmail.com
5. **Click**: "Create Webhook"
6. **Copy the Secret** (shown after creation)
7. **Go back to Vercel** → Settings → Environment Variables
8. **Update** `RAZORPAY_WEBHOOK_SECRET` with the copied secret
9. **Save**

---

## ✅ Step 5: Redeploy (1 minute)

### Trigger Redeployment:

**Option A: Via Vercel Dashboard**
1. Go to: Deployments tab
2. Click: "..." menu on latest deployment
3. Click: "Redeploy"

**Option B: Via CLI**
```bash
vercel --prod
```

---

## 🧪 Step 6: Test the System

### Test Payment Flow:

1. **Go to**: https://razorpay.me/@akatronai
2. **Enter amount**: ₹499
3. **Enter your email**: (use your own email for testing)
4. **Complete payment** (use test card if in test mode)
5. **Check your email** - you should receive the PDF report within 1-2 minutes

### Verify in Logs:

1. **Vercel Dashboard** → Deployments → Latest → Logs
2. **Look for**:
   ```
   ✅ Received webhook event: payment.captured
   📊 Generating email risk report for: [email]
   ✅ Report generated
   ✅ Email sent successfully
   🎉 AUTOMATION COMPLETE
   ```

---

## ✅ Deployment Complete!

### What Happens Now:

```
Customer pays ₹499
    ↓ (instant)
Razorpay webhook triggers
    ↓ (5 seconds)
PDF report generated
    ↓ (10 seconds)
Email sent to customer
    ↓ (total: ~15 seconds)
Customer receives report ✅
```

---

## 🔍 Monitoring

### Check Webhook Deliveries:

**Razorpay Dashboard**:
- Settings → Webhooks → Your webhook → Recent Deliveries
- Green checkmark = Success
- Red X = Failed (check logs)

### View Real-time Logs:

```bash
vercel logs --follow
```

Or in Vercel Dashboard → Deployments → Logs

---

## ⚠️ Troubleshooting

### Webhook Not Triggering:

1. ✅ Check webhook URL is correct in Razorpay
2. ✅ Verify webhook is "Active" in Razorpay
3. ✅ Check Razorpay webhook logs for delivery errors
4. ✅ Verify Vercel deployment is successful

### Email Not Sending:

1. ✅ Verify Gmail App Password is correct
2. ✅ Check GMAIL_USER is correct
3. ✅ View Vercel logs for email errors
4. ✅ Check Gmail "Sent" folder

### PDF Not Generating:

1. ✅ Check LeakCheck API key is valid
2. ✅ Verify API quota not exceeded
3. ✅ View Vercel logs for generation errors

---

## 🎉 Success Indicators

You'll know it's working when:

- ✅ Razorpay webhook shows "200 OK" status
- ✅ Vercel logs show "AUTOMATION COMPLETE"
- ✅ Customer receives email with PDF attachment
- ✅ PDF contains breach analysis and recommendations

---

## 📞 Need Help?

If you encounter issues:

1. **Check Vercel logs** first
2. **Check Razorpay webhook logs**
3. **Review environment variables**
4. **Test Gmail credentials** manually

---

## 🚀 You're Live!

Your automated payment and report system is now running 24/7!

Every payment automatically:
1. Generates detailed PDF report
2. Sends email to customer
3. You earn ₹499

**No manual work required!** 🎉
