# 🔧 FIX VERCEL ENVIRONMENT VARIABLES

## 🚨 MISSING ENVIRONMENT VARIABLES IN PRODUCTION

The admin dashboard is failing because these environment variables are missing in Vercel:

### ❌ Missing Variables:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZW9reWZsZW1oYWJldXJtcHZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDI2OTY1NSwiZXhwIjoyMDg5ODQ1NjU1fQ.kpSiuS_icV5IXwZfKXSGuIDf0uACU8xe-rCXB3SstLY

ADMIN_SECRET_KEY=nexagent-admin-2024

NEXT_PUBLIC_ADMIN_EMAIL=abdalrahimmakkawi@gmail.com

NVIDIA_API_KEY=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

NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1

NVIDIA_MODEL=qwen/qwen3-next-80b-a3b-thinking

DEEPSEEK_API_KEY=sk-60976e21d9264698b8dcf27341dd5863

DEEPSEEK_BASE_URL=https://api.deepseek.com

DEEPSEEK_MODEL=deepseek-chat
```

## 📋 HOW TO ADD TO VERCEL:

### Method 1: Vercel Dashboard
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project: `nexagent`
3. Go to **Settings** → **Environment Variables**
4. Add each variable from the list above

### Method 2: Vercel CLI
```bash
# Set environment variables
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add ADMIN_SECRET_KEY production
vercel env add NEXT_PUBLIC_ADMIN_EMAIL production
vercel env add NVIDIA_API_KEY production
vercel env add NVIDIA_BASE_URL production
vercel env add NVIDIA_MODEL production
vercel env add DEEPSEEK_API_KEY production
vercel env add DEEPSEEK_BASE_URL production
vercel env add DEEPSEEK_MODEL production

# Redeploy to apply changes
vercel --prod
```

### Method 3: Copy-Paste Values
Copy each value from the list above and paste into Vercel dashboard.

## ✅ VERIFICATION:

After adding the variables, test:
1. Go to: https://nexagent-one.vercel.app/admin
2. Check browser console - should NOT show:
   - `⚠️ [SUPABASE] SUPABASE_SERVICE_ROLE_KEY: ❌ Missing`
   - `⚠️ [SUPABASE] Admin environment variables not available`

3. Test admin approve endpoint - should NOT show 401 errors

## 🎯 EXPECTED RESULT:

After fixing, you should see:
```
✅ [SUPABASE] NEXT_PUBLIC_SUPABASE_URL: ✅
✅ [SUPABASE] SUPABASE_SERVICE_ROLE_KEY: ✅
✅ Admin features enabled
```

## 🚨 IMPORTANT:

- Use **production** environment for all variables
- **SUPABASE_SERVICE_ROLE_KEY** is critical for admin features
- **ADMIN_SECRET_KEY** is required for admin API protection
- NVIDIA/DeepSeek keys are needed for AI functionality

## 🔄 AFTER FIXING:

1. Deploy: `vercel --prod`
2. Test admin dashboard
3. Test agent approval functionality
4. Verify AI assistant works
