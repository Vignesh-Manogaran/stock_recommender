# OpenRouter API Setup Guide

## Overview

This application uses OpenRouter API to generate comprehensive stock analysis using AI models like Claude 3.5 Sonnet.

## Setup Instructions

1. **Get an OpenRouter API Key**

   - Visit [OpenRouter.ai](https://openrouter.ai/)
   - Create an account or sign in
   - Generate an API key from your dashboard

2. **Set up Environment Variables**
   Create a `.env` file in the project root with:

   ```bash
   REACT_APP_OPENROUTER_API_KEY=your_actual_api_key_here
   ```

3. **Example .env file**
   ```bash
   # OpenRouter API Configuration
   REACT_APP_OPENROUTER_API_KEY=sk-or-v1-abcd1234efgh5678ijkl9012mnop3456qrst7890
   ```

## Features

### Without API Key

- The app will work with mock data
- All features are functional for demo purposes
- Realistic sample analysis is provided

### With API Key

- Real AI-powered stock analysis
- Comprehensive fundamental analysis
- Technical indicator analysis
- Personalized recommendations
- Up-to-date market insights

## Usage

Once set up, the detailed stock analysis will include:

1. **About & Key Points** - AI-generated company overview
2. **Financial Health Assessment** - 10 comprehensive categories
3. **Technical Analysis** - 4 advanced indicator systems
4. **Support & Resistance Levels** - AI-identified price levels
5. **Pros & Cons** - Balanced risk assessment
6. **Trading Recommendations** - Entry, target, and stop-loss levels

## Cost Considerations

- OpenRouter charges per token used
- Claude 3.5 Sonnet: ~$3-15 per 1M tokens
- Each stock analysis uses approximately 3,000-4,000 tokens
- Estimated cost: $0.01-0.06 per analysis
- Results are cached for 2 hours to minimize costs

## Security

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- API keys are only used client-side for this demo app
- Consider using environment variables in production

## Troubleshooting

- Ensure your API key starts with `sk-or-v1-`
- Check your OpenRouter account balance
- Monitor the browser console for API errors
- The app will gracefully fall back to mock data if the API fails
