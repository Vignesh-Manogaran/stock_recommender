// Debug endpoint to check environment variables
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
    const envInfo = {
      // Check different possible environment variable names
      openrouter_keys: {
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? "SET" : "NOT SET",
        VITE_OPENROUTER_API_KEY: process.env.VITE_OPENROUTER_API_KEY
          ? "SET"
          : "NOT SET",
      },
      alpha_vantage_keys: {
        ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY
          ? "SET"
          : "NOT SET",
        VITE_ALPHA_VANTAGE_API_KEY: process.env.VITE_ALPHA_VANTAGE_API_KEY
          ? "SET"
          : "NOT SET",
      },
      // Show all environment variables that contain these keywords (without values for security)
      available_env_keys: Object.keys(process.env).filter(
        (k) =>
          k.includes("OPENROUTER") ||
          k.includes("ALPHA") ||
          k.includes("VANTAGE") ||
          k.includes("API_KEY")
      ),
      total_env_count: Object.keys(process.env).length,
      vercel_env: process.env.VERCEL_ENV,
      node_env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };

    console.log("🔍 Environment Debug Info:", envInfo);

    res.status(200).json({
      success: true,
      environment_info: envInfo,
    });
  } catch (error) {
    console.error("❌ Debug endpoint error:", error);
    res.status(500).json({
      error: "Debug endpoint failed",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
