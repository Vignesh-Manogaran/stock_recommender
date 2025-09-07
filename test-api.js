// Test script to check RapidAPI response structure
import dotenv from 'dotenv';
dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const BASE_URL = 'https://yahoo-finance15.p.rapidapi.com/api/v1/markets';

async function testQuoteAPI() {
  try {
    const symbol = 'RELIANCE.NS'; // Reliance stock on NSE
    const response = await fetch(`${BASE_URL}/stock/modules?ticker=${symbol}&module=price,summaryDetail,defaultKeyStatistics`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
      }
    });
    
    const data = await response.json();
    console.log('🔍 Full API Response:', JSON.stringify(data, null, 2));
    
    // Check different paths
    if (data.body) {
      console.log('📊 Body keys:', Object.keys(data.body));
    }
    
  } catch (error) {
    console.error('❌ API Test failed:', error);
  }
}

testQuoteAPI();
