#!/bin/bash

echo "🔧 SETTING UP VERCEL ENVIRONMENT VARIABLES"
echo ""

echo "Adding SUPABASE_SERVICE_ROLE_KEY..."
vercel env add SUPABASE_SERVICE_ROLE_KEY production

echo "Adding ADMIN_SECRET_KEY..."
vercel env add ADMIN_SECRET_KEY production

echo "Adding NEXT_PUBLIC_ADMIN_EMAIL..."
vercel env add NEXT_PUBLIC_ADMIN_EMAIL production

echo "Adding NVIDIA_API_KEY..."
vercel env add NVIDIA_API_KEY production

echo "Adding NVIDIA_BASE_URL..."
vercel env add NVIDIA_BASE_URL production

echo "Adding NVIDIA_MODEL..."
vercel env add NVIDIA_MODEL production

echo "Adding DEEPSEEK_API_KEY..."
vercel env add DEEPSEEK_API_KEY production

echo "Adding DEEPSEEK_BASE_URL..."
vercel env add DEEPSEEK_BASE_URL production

echo "Adding DEEPSEEK_MODEL..."
vercel env add DEEPSEEK_MODEL production

echo ""
echo "✅ Environment variables added!"
echo "🚀 Redeploying to apply changes..."
vercel --prod

echo ""
echo "🎉 Setup complete! Test admin dashboard at:"
echo "https://nexagent-one.vercel.app/admin"
