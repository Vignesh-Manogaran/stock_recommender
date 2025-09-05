// Test OpenRouter API directly to debug the issue
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    console.log(`🔑 API Key Status: ${apiKey ? "FOUND" : "NOT FOUND"}`);

    if (!apiKey) {
      return res.status(400).json({ error: "API key not found" });
    }

    // Test with a simple request
    const testPayload = {
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages: [
        {
          role: "user",
          content: "Say hello",
        },
      ],
      temperature: 0.3,
      max_tokens: 50,
    };

    console.log(`🚀 Testing OpenRouter with key: ${apiKey.substring(0, 8)}...`);

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://finance.moneybond.in",
          "X-Title": "Stock Recommender Test",
        },
        body: JSON.stringify(testPayload),
      }
    );

    console.log(`📊 OpenRouter Response Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ OpenRouter Error Response: ${errorText}`);

      return res.status(500).json({
        error: "OpenRouter API failed",
        status: response.status,
        response: errorText,
        api_key_prefix: apiKey.substring(0, 8),
        timestamp: new Date().toISOString(),
      });
    }

    const data = await response.json();
    console.log(`✅ OpenRouter Success!`);

    res.status(200).json({
      success: true,
      test_response: data,
      api_key_prefix: apiKey.substring(0, 8),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Test endpoint error:", error);
    res.status(500).json({
      error: "Test endpoint failed",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
