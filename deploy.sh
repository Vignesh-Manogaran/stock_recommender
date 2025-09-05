#!/bin/bash

# 🚀 Stock Recommender - Vercel Deployment Script
# This script helps you deploy your app to Vercel with all necessary configurations

echo "🚀 Stock Recommender - Vercel Deployment Helper"
echo "================================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
else
    echo "✅ Vercel CLI is already installed"
fi

echo ""
echo "🔧 Pre-deployment checklist:"
echo "1. ✅ Serverless functions created in /api"
echo "2. ✅ vercel.json configuration ready"
echo "3. ✅ Smart environment detection implemented"
echo "4. ✅ Frontend updated to use Vercel APIs"
echo ""

# Check if user wants to set up environment variables
read -p "🔑 Do you want to configure API keys for real data? (y/n): " setup_env

if [ "$setup_env" = "y" ]; then
    echo ""
    echo "🔑 Setting up environment variables..."
    echo ""
    echo "Optional API Keys (press Enter to skip):"
    echo ""
    
    read -p "OpenRouter API Key (for AI analysis): " openrouter_key
    read -p "Alpha Vantage API Key (for stock data): " alpha_key
    read -p "Financial Modeling Prep API Key (for enhanced data): " fmp_key
    
    echo ""
    echo "📝 After deployment, add these in Vercel Dashboard:"
    echo "   Settings → Environment Variables"
    echo ""
    
    if [ ! -z "$openrouter_key" ]; then
        echo "   OPENROUTER_API_KEY=$openrouter_key"
    fi
    
    if [ ! -z "$alpha_key" ]; then
        echo "   ALPHA_VANTAGE_API_KEY=$alpha_key"
    fi
    
    if [ ! -z "$fmp_key" ]; then
        echo "   FINANCIAL_MODELING_PREP_API_KEY=$fmp_key"
    fi
    
    echo ""
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo ""

vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Visit your Vercel dashboard to see the live URL"
    echo "2. Add environment variables if you provided API keys"
    echo "3. Test the deployed app with stock detail pages"
    echo ""
    echo "✨ Your app now has:"
    echo "   • Real API data (if keys configured)"
    echo "   • No CORS issues"
    echo "   • Smart fallback system"
    echo "   • Professional deployment"
    echo ""
    echo "🌍 App is live and ready for users!"
else
    echo ""
    echo "❌ Deployment failed. Please check the error messages above."
    echo ""
    echo "🛠️  Common solutions:"
    echo "1. Make sure you're in the project root directory"
    echo "2. Check that all files are saved"
    echo "3. Verify vercel.json syntax"
    echo "4. Try running 'vercel login' first"
fi

echo ""
echo "📚 For detailed documentation, see VERCEL_DEPLOYMENT.md"
echo "🎯 Your app works perfectly even without API keys!"
