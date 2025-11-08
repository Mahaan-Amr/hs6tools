# 🔒 Cloudflare SSL Setup Guide for HS6Tools

## Current Issue

Your Cloudflare DNS records are set to **"DNS only"** (grey cloud), which means:
- ❌ Cloudflare is NOT proxying your traffic
- ❌ Cloudflare's free SSL is NOT active
- ❌ HTTPS requests go directly to your server (which doesn't have SSL)
- ✅ HTTP works because it goes directly to your server

## Solution: Enable Cloudflare Proxying

### Step 1: Enable Proxying for DNS Records

1. **Go to Cloudflare Dashboard:**
   - Navigate to: https://dash.cloudflare.com
   - Select your domain: `hs6tools.com`

2. **Go to DNS Records:**
   - Click on "DNS" → "Records" in the sidebar

3. **Enable Proxying for A Records:**
   - Find the `A` record for `hs6tools.com` (points to `87.107.73.10`)
   - Click the **grey cloud icon** next to it
   - It should turn **orange** (proxied)
   - Repeat for the `www` A record (also points to `87.107.73.10`)
   - Click "Save" if prompted

   **Before:** 🟦 DNS only (grey cloud)
   **After:** 🟠 Proxied (orange cloud)

### Step 2: Configure SSL/TLS Settings

1. **Go to SSL/TLS Settings:**
   - Click on "SSL/TLS" in the sidebar
   - Select "Overview" tab

2. **Set SSL/TLS Encryption Mode:**
   - Change from "Off" or "Full" to **"Flexible"**
   - **Why "Flexible"?**
     - Your origin server (87.107.73.10) only has HTTP (port 80)
     - Cloudflare will handle HTTPS (encrypted connection to users)
     - Cloudflare will connect to your server via HTTP (unencrypted between Cloudflare and your server)
     - This is the easiest setup and works immediately

3. **SSL/TLS Modes Explained:**
   - **Off:** No encryption (not recommended)
   - **Flexible:** ✅ HTTPS between user ↔ Cloudflare, HTTP between Cloudflare ↔ your server (use this)
   - **Full:** HTTPS both ways, but requires valid SSL on your server
   - **Full (strict):** HTTPS both ways, requires valid SSL certificate on your server

### Step 3: Wait for DNS Propagation

- DNS changes can take a few minutes to propagate
- Cloudflare SSL certificate is usually issued within 1-5 minutes
- You can check status in Cloudflare dashboard

### Step 4: Verify SSL is Working

1. **Check SSL Certificate:**
   - Go to SSL/TLS → Overview
   - You should see "Active Certificate" with a green checkmark

2. **Test HTTPS:**
   - Visit: `https://hs6tools.com/fa`
   - Should show a padlock icon (secure connection)
   - No more "Not secure" warning

## Expected Result

After enabling proxying:
- ✅ `https://hs6tools.com` will work
- ✅ `https://www.hs6tools.com` will work
- ✅ Cloudflare provides free SSL certificate automatically
- ✅ All traffic is encrypted between users and Cloudflare
- ✅ Your server continues to serve HTTP (no changes needed)

## Important Notes

### Why "Flexible" Mode?

Since your origin server doesn't have SSL configured:
- **Flexible mode** = Users get HTTPS, but Cloudflare talks to your server via HTTP
- This is secure for end users (encrypted connection)
- This is the easiest setup (no server SSL needed)

### If You Want "Full" Mode Later:

If you want end-to-end encryption (Full mode), you would need to:
1. Set up SSL on your server (using Let's Encrypt)
2. Configure Nginx to serve HTTPS
3. Change Cloudflare SSL mode to "Full"

But for now, **Flexible mode is perfect** and requires no server changes!

## Troubleshooting

### If HTTPS Still Doesn't Work:

1. **Wait 5-10 minutes** for DNS/SSL propagation
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Check Cloudflare SSL status:**
   - SSL/TLS → Overview
   - Should show "Active Certificate"
4. **Check DNS propagation:**
   - Use: https://dnschecker.org
   - Search for `hs6tools.com`
   - Should show Cloudflare IPs (not your server IP)

### Common Issues:

- **"ERR_CONNECTION_REFUSED"** → Wait for DNS propagation (5-10 min)
- **"Not secure" warning** → SSL certificate still issuing (wait a few minutes)
- **Mixed content errors** → Some resources still loading via HTTP (check page source)

## Summary

**Quick Steps:**
1. ✅ Enable proxying (orange cloud) for both A records
2. ✅ Set SSL/TLS mode to "Flexible"
3. ✅ Wait 5-10 minutes
4. ✅ Test `https://hs6tools.com/fa`

That's it! Cloudflare will handle everything else automatically.

