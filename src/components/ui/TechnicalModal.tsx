import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  TrendingUp,
  Target,
  Shield,
  AlertTriangle,
  BarChart3,
  Activity,
} from "lucide-react";
import Button from "./Button";

interface TechnicalModalProps {
  isOpen: boolean;
  onClose: () => void;
  indicatorType: string;
  indicatorValue: string | number;
  indicatorData?: any;
  stockData?: any;
}

const TechnicalModal: React.FC<TechnicalModalProps> = ({
  isOpen,
  onClose,
  indicatorType,
  indicatorValue,
  indicatorData,
  stockData,
}) => {
  // Tamil explanations for technical indicators
  const getTechnicalExplanation = (
    type: string,
    value: string | number,
    data?: any
  ) => {
    const explanations: Record<string, any> = {
      "Stochastic RSI": {
        title: "Stochastic RSI (வலுவினை அளவி காட்டி)",
        definition:
          "பங்கு விலை அதன் recent high மற்றும் low களுடன் ஒப்பிடும்போது எந்த நிலையில் உள்ளது என்பதை காட்டும் momentum oscillator. இது 0 முதல் 100 வரை அளவிடப்படுகிறது.",
        calculation:
          "Stochastic RSI = (RSI - Lowest Low RSI) / (Highest High RSI - Lowest Low RSI) × 100",
        importance:
          "பங்கு overbought (அதிக விலை) அல்லது oversold (குறைந்த விலை) நிலையில் உள்ளதா என்பதை அறிய மிக முக்கிய காட்டி. வாங்குதல் மற்றும் விற்பனை சமிக்ஞைகளை கண்டறிய உதவுகிறது.",
        interpretation: getStochRSIInterpretation(parseFloat(value.toString())),
        signals: getStochRSISignals(parseFloat(value.toString())),
        tradingStrategy: `
• 80+ மேல் = Overbought (விற்பனை பரிசீலனை)
• 20 கீழ் = Oversold (வாங்குதல் பரிசீலனை)  
• Mean reversion strategy க்கு சிறந்தது
• Volume confirmation கூடவே பாருங்கள்`,
        tips: `• எப்போதும் trend direction உடன் trade செய்யுங்கள்
• False signals அதிகம், மற்ற indicators உடன் confirm செய்யுங்கள்
• Divergence patterns கவனிக்கவும்
• 14 period standard setting, volatile stocks க்கு குறைக்கலாம்`,
      },

      "Connors RSI": {
        title: "Connors RSI (கன்னர்ஸ் RSI குடும்பம்)",
        definition:
          "Larry Connors உருவாக்கிய advanced momentum indicator. Traditional RSI, Price streak, மற்றும் Percent rank ஆகியவற்றை combine செய்து short-term mean reversion opportunities கண்டறியும்.",
        calculation: "Connors RSI = (RSI + UpDown Length RSI + ROC RSI) / 3",
        importance:
          "Short-term trading க்கு மிகவும் powerful indicator. Quick reversals மற்றும் counter-trend moves கண்டறிய specialized tool. Traditional RSI விட sensitive.",
        interpretation: getConnorsRSIInterpretation(
          parseFloat(value.toString())
        ),
        signals: getConnorsRSISignals(parseFloat(value.toString())),
        tradingStrategy: `
• 90+ மேல் = Extreme overbought (short entry)
• 10 கீழ் = Extreme oversold (long entry)
• 1-3 days hold period க்கு optimized
• Mean reversion strategy க்கு specifically designed`,
        tips: `• Short-term trading க்கு மட்டும் பயன்படுத்தவும்
• Position size குறைவாக வைக்கவும் (volatile indicator)
• Stop losses அருகில் வைக்கவும்
• High frequency trading environments ல் effective`,
      },

      MACD: {
        title: "MACD (வணிக வழிகாட்டி)",
        definition:
          "Moving Average Convergence Divergence - இரண்டு moving averages அடிப்படையில் momentum மற்றும் trend changes கண்டறியும் indicator. Signal line மற்றும் histogram உடன்.",
        calculation:
          "MACD = 12-day EMA - 26-day EMA, Signal = 9-day EMA of MACD, Histogram = MACD - Signal",
        importance:
          "மிகவும் popular momentum indicator. Trend changes, buy/sell signals, மற்றும் momentum strength அனைத்தையும் ஒரே indicator ல் காட்டுகிறது. எல்லா time frames ல் பயன்படும்.",
        interpretation: getMACDInterpretation(parseFloat(value.toString())),
        signals: getMACDSignals(data),
        tradingStrategy: `
• MACD signal line க்கு மேல் cross = Buy signal
• MACD signal line க்கு கீழ் cross = Sell signal
• Zero line க்கு மேல் = Bullish momentum
• Histogram increasing = Momentum strengthening`,
        tips: `• Lagging indicator - confirmation க்கு பயன்படுத்தவும்
• Divergences மிக முக்கியம் (price vs MACD direction)
• Choppy markets ல் false signals அதிகம்
• Trending markets ல் மிகச்சிறந்தது`,
      },

      "Pattern Analysis": {
        title: "Pattern Analysis (வடிவ பகுப்பாய்வு)",
        definition:
          "Chart patterns மற்றும் price action அடிப்படையில் market behavior predict செய்யும் technique. Historical patterns மற்றும் market psychology study செய்தல்.",
        calculation:
          "Technical patterns = Support/Resistance levels + Volume + Price action + Market structure analysis",
        importance:
          "Market psychology மற்றும் crowd behavior understand செய்ய மிக powerful tool. Price targets மற்றும் risk levels clearly define செய்ய உதவுகிறது.",
        interpretation: getPatternInterpretation(parseFloat(value.toString())),
        signals: getPatternSignals(data),
        tradingStrategy: `
• 3 consecutive down closes = Mean reversion setup
• Above 200-DMA = Trend filter (bullish bias)
• Exit on 5-DMA = Quick profit taking
• Volume confirmation முக்கியம்`,
        tips: `• Pattern completion க்கு wait செய்யுங்கள்
• False breakouts அதிகம் - volume confirm செய்யுங்கள்
• Risk:reward ratio clear ஆக define செய்யுங்கள்
• Market context (trend/range) கவனிக்கவும்`,
      },

      "Support Level": {
        title: "Support Level (துணை மட்டம்)",
        definition:
          "பங்கு விலை கீழே வரும்போது buyers வந்து price bounce ஆக செய்யும் price level. Demand zone என்றும் அழைக்கப்படுகிறது.",
        calculation:
          "Support = Previous lows + Volume analysis + Moving averages + Fibonacci levels",
        importance:
          "Risk management க்கு மிக முக்கியம். Entry points கண்டறிய மற்றும் stop loss levels set செய்ய பயன்படுகிறது. Market psychology समझने க்கு உதவுகிறது.",
        interpretation: getSupportInterpretation(
          parseFloat(value.toString().replace(/[₹,]/g, ""))
        ),
        signals: `Support level மிக வலுவானது. இந்த level அருகில் buying opportunities கிடைக்கலாம். Volume ஆதரவுடன் bounce expect செய்யலாம்.`,
        tradingStrategy: `
• Support அருகில் buy orders வைக்கலாம்
• Support break ஆனால் immediate exit
• Multiple touches = Support வலுவானது
• Volume spike உடன் support test = Good entry`,
        tips: `• Support exact ஆக act செய்யாது - zone ஆக consider செய்யுங்கள்
• Time frame different levels different support
• Round numbers அடிக்கடி support ஆக act செய்யும்
• Breaking support = Next support level வரை fall possible`,
      },

      "Resistance Level": {
        title: "Resistance Level (எதிர்ப்பு மட்டம்)",
        definition:
          "பங்கு விலை மேலே வரும்போது sellers வந்து price தடுக்கும் price level. Supply zone என்றும் அழைக்கப்படுகிறது.",
        calculation:
          "Resistance = Previous highs + Volume analysis + Moving averages + Psychological levels",
        importance:
          "Profit booking levels கண்டறிய மிக முக்கியம். Breakout opportunities identify செய்ய மற்றும் selling points decide செய்ய பயன்படுகிறது.",
        interpretation: getResistanceInterpretation(
          parseFloat(value.toString().replace(/[₹,]/g, ""))
        ),
        signals: `Resistance level வலுவானது. இந்த level அருகில் profit booking consider செய்யலாம். Breaking resistance ல் momentum பெறலாம்.`,
        tradingStrategy: `
• Resistance அருகில் partial profit booking
• Clear breakout wait செய்யுங்கள்
• Volume spike உடன் breakout = Strong move possible
• Failed breakout = Short opportunity`,
        tips: `• Resistance levels psychological barriers ஆக act செய்யும்
• Multiple rejections = Resistance வலுவானது
• Break and retest pattern powerful
• False breakouts trap வாய்ப்பு அதிகம்`,
      },

      "Risk Reward Ratio": {
        title: "Risk:Reward Ratio (அபாய:வருமான விகிதம்)",
        definition:
          "ஒரு trade ல் நீங்கள் risk செய்யும் amount vs profit செய்ய expect செய்யும் amount இன் விகிதம். Trading success க்கு மிக முக்கிய metric.",
        calculation:
          "Risk:Reward = (Target Price - Entry Price) / (Entry Price - Stop Loss)",
        importance:
          "Long-term trading success க்கு critical factor. Good risk management இல்லாமல் consistent profits impossible. Win rate க்கு compensate செய்ய உதவுகிறது.",
        interpretation: getRiskRewardInterpretation(value.toString()),
        signals: getRiskRewardSignals(value.toString()),
        tradingStrategy: `
• Minimum 1:2 ratio maintain செய்யுங்கள்
• Higher win rate இருந்தால் lower ratio acceptable
• Risk amount total capital ன் 1-2% மட்டும்
• Multiple positions ல் overall portfolio risk பாருங்கள்`,
        tips: `• Emotional trading greatest enemy
• Pre-define entry, target, stop loss levels
• Stick to plan regardless of market noise
• Position sizing risk ratio அடிப்படையில் decide செய்யுங்கள்`,
      },

      Volume: {
        title: "Volume (வொல்யூம்)",
        definition:
          "குறிப்பிட்ட நேரத்தில் trade ஆன shares இன் எண்ணிக்கை. Price movement confirmation செய்ய மிக முக்கிய indicator.",
        calculation: "Volume = Total shares traded in given time period",
        importance:
          "Price movement genuine ஆ அல்லது fake ஆ என்பதை confirm செய்ய volume analysis அவசியம். Breakouts மற்றும் breakdowns authenticate செய்ய பயன்படுகிறது.",
        interpretation: getVolumeInterpretation(
          parseFloat(value.toString().replace(/[,]/g, ""))
        ),
        signals: `Volume analysis அடிப்படையில் current market sentiment மற்றும் price move strength analyze செய்யலாம்.`,
        tradingStrategy: `
• High volume breakouts = Strong moves
• Low volume moves = Suspect moves  
• Volume spike = Attention required
• Volume drying up = Consolidation possible`,
        tips: `• Volume always price க்கு முன் lead செய்யும்
• Unusual volume spikes investigate செய்யுங்கள்
• Relative volume (vs average) முக்கியம்
• Volume patterns price patterns confirm செய்ய வேண்டும்`,
      },
    };

    return (
      explanations[type] || {
        title: "தகவல் கிடைக்கவில்லை",
        definition:
          "இந்த technical indicator பற்றிய விளக்கம் தற்போது கிடைக்கவில்லை.",
        calculation: "கணக்கீட்டு முறை கிடைக்கவில்லை",
        importance: "முக்கியத்துவம் பற்றிய தகவல் கிடைக்கவில்லை",
        interpretation: "தற்போதைய மதிப்பின் பகுப்பாய்வு கிடைக்கவில்லை",
        signals: "வர்த்தக சமிக்ஞைகள் கிடைக்கவில்லை",
        tradingStrategy: "வர்த்தக உத்தி குறிப்புகள் கிடைக்கவில்லை",
        tips: "குறிப்புகள் கிடைக்கவில்லை",
      }
    );
  };

  // Helper functions for interpretations
  function getStochRSIInterpretation(value: number): string {
    if (value >= 80)
      return `${value} - Overbought zone! பங்கு அதிக விலையில் உள்ளது. Selling pressure வரக்கூடும். Reversal signals கவனிக்கவும்.`;
    if (value >= 70)
      return `${value} - Strong bullish momentum ஆனால் overbought நெருங்குகிறது. Partial profit booking consider செய்யலாம்.`;
    if (value >= 30)
      return `${value} - Normal range ல் உள்ளது. Trend direction follow செய்யுங்கள். Clear signals க்காக wait செய்யுங்கள்.`;
    if (value >= 20)
      return `${value} - Oversold நெருங்குகிறது. Buying interest உருவாகலாம். Volume confirmation பாருங்கள்.`;
    return `${value} - Extreme oversold! Excellent buying opportunity கிடைக்கலாம். Mean reversion expect செய்யலாம்.`;
  }

  function getStochRSISignals(value: number): string {
    if (value >= 80)
      return "🔴 Sell Signal: Overbought zone, reversal possible";
    if (value <= 20) return "🟢 Buy Signal: Oversold zone, bounce expected";
    return "🟡 Neutral: Wait for clear signals";
  }

  function getConnorsRSIInterpretation(value: number): string {
    if (value >= 90)
      return `${value} - Extreme overbought! Short-term reversal மிக likely. Mean reversion trade excellent opportunity.`;
    if (value >= 80)
      return `${value} - Highly overbought. Counter-trend position consider செய்யலாம். 1-3 days hold period optimal.`;
    if (value >= 20)
      return `${value} - Normal range. Strong directional bias இல்லை. Patience required for clear setup.`;
    if (value >= 10)
      return `${value} - Highly oversold. Long position consider செய்யலாம். Quick bounce possible.`;
    return `${value} - Extreme oversold! Excellent long opportunity. Mean reversion high probability.`;
  }

  function getConnorsRSISignals(value: number): string {
    if (value >= 90) return "🔴 Strong Sell: Extreme mean reversion setup";
    if (value <= 10) return "🟢 Strong Buy: Extreme mean reversion setup";
    if (value >= 80) return "🟠 Sell Signal: Counter-trend opportunity";
    if (value <= 20) return "🟠 Buy Signal: Counter-trend opportunity";
    return "🟡 Neutral: No clear mean reversion setup";
  }

  function getMACDInterpretation(value: number): string {
    if (value > 2)
      return `${value} - Strong bullish momentum! Trend வலுவானது. Continue holding or add positions on dips.`;
    if (value > 0)
      return `${value} - Positive momentum. Bullish bias maintain செய்யுங்கள். Signal line cross கவனிக்கவும்.`;
    if (value > -2)
      return `${value} - Weak momentum. Consolidation possible. Clear breakout க்காக wait செய்யுங்கள்.`;
    return `${value} - Negative momentum. Bearish bias. Exit long positions consider செய்யுங்கள்.`;
  }

  function getMACDSignals(data: any): string {
    if (!data) return "Signal analysis க்கு data தேவை";
    return "MACD signal line analysis மற்றும் histogram divergence patterns based signals";
  }

  function getPatternInterpretation(value: number): string {
    if (value >= 0.8)
      return `${value} - Very strong pattern! High conviction setup. Good risk:reward ratio expected.`;
    if (value >= 0.6)
      return `${value} - Good pattern strength. Moderate confidence level. Position size accordingly.`;
    if (value >= 0.4)
      return `${value} - Weak pattern. Low confidence. Paper trade or avoid until clear setup.`;
    return `${value} - No clear pattern. Random market noise. Wait for better setup.`;
  }

  function getPatternSignals(data: any): string {
    return "Pattern completion மற்றும் volume confirmation based signals. 3 down closes pattern active.";
  }

  function getSupportInterpretation(level: number): string {
    const currentPrice = 2474; // This should come from props
    const distance = (((currentPrice - level) / level) * 100) || 0;
    return `Support level ₹${level.toLocaleString()}. Current price இலிருந்து ${distance.toFixed(1)}% distance. Strong support zone.`;
  }

  function getResistanceInterpretation(level: number): string {
    const currentPrice = 2474; // This should come from props
    const distance = (((level - currentPrice) / currentPrice) * 100) || 0;
    return `Resistance level ₹${level.toLocaleString()}. Current price இலிருந்து ${distance.toFixed(1)}% மேலே. Strong selling zone.`;
  }

  function getRiskRewardInterpretation(ratio: string): string {
    const numRatio = parseFloat(ratio.replace(/[^\d.]/g, ""));
    if (numRatio >= 3)
      return `${ratio} - Excellent risk:reward! Very attractive trade setup. High profit potential vs risk.`;
    if (numRatio >= 2)
      return `${ratio} - Good risk:reward. Acceptable trade setup. Profitable long-term strategy.`;
    if (numRatio >= 1.5)
      return `${ratio} - Marginal risk:reward. Need high win rate for profitability. Consider better setup.`;
    return `${ratio} - Poor risk:reward. Avoid this trade. Find better opportunity.`;
  }

  function getRiskRewardSignals(ratio: string): string {
    const numRatio = parseFloat(ratio.replace(/[^\d.]/g, ""));
    if (numRatio >= 2) return "🟢 Good Trade: Proceed with confidence";
    if (numRatio >= 1.5) return "🟡 Marginal Trade: Require high accuracy";
    return "🔴 Poor Trade: Avoid or find better setup";
  }

  function getVolumeInterpretation(volume: number): string {
    if (volume > 1000000)
      return `${volume.toLocaleString()} - Very high volume! Strong interest. Price moves significant ஆக இருக்கும்.`;
    if (volume > 500000)
      return `${volume.toLocaleString()} - Above average volume. Good participation. Moves sustained ஆக இருக்கும்.`;
    if (volume > 100000)
      return `${volume.toLocaleString()} - Normal volume. Average participation. Regular market activity.`;
    return `${volume.toLocaleString()} - Low volume. Caution required. Moves unreliable ஆக இருக்கலாம்.`;
  }

  const explanation = getTechnicalExplanation(
    indicatorType,
    indicatorValue,
    indicatorData
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {explanation.title}
                </h2>
                <p className="text-lg font-semibold text-purple-600 mt-1">
                  தற்போதைய மதிப்பு: {indicatorValue}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Definition */}
              <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  இது என்ன?
                </h3>
                <p className="text-purple-700 leading-relaxed text-base">
                  {explanation.definition}
                </p>
              </div>

              {/* Calculation */}
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  எப்படி கணக்கிடுகிறார்கள்?
                </h3>
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <code className="text-blue-700 font-mono text-sm">
                    {explanation.calculation}
                  </code>
                </div>
              </div>

              {/* Importance */}
              <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  ஏன் இது முக்கியம்?
                </h3>
                <p className="text-green-700 leading-relaxed text-base">
                  {explanation.importance}
                </p>
              </div>

              {/* Current Value Interpretation */}
              <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
                <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  தற்போதைய மதிப்பு என்ன சொல்கிறது?
                </h3>
                <p className="text-orange-700 leading-relaxed text-base font-medium">
                  {explanation.interpretation}
                </p>
              </div>

              {/* Trading Signals */}
              <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-200">
                <h3 className="text-lg font-semibold text-indigo-800 mb-3">
                  வர்த்தக சமிக்ஞைகள்
                </h3>
                <p className="text-indigo-700 font-semibold">
                  {explanation.signals}
                </p>
              </div>

              {/* Trading Strategy */}
              <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  வர்த்தக உத்தி
                </h3>
                <pre className="text-yellow-700 text-sm whitespace-pre-line font-sans leading-relaxed">
                  {explanation.tradingStrategy}
                </pre>
              </div>

              {/* Tips & Warnings */}
              <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  முக்கிய குறிப்புகள் மற்றும் எச்சரிக்கைகள்
                </h3>
                <pre className="text-red-700 text-sm whitespace-pre-line font-sans leading-relaxed">
                  {explanation.tips}
                </pre>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <p className="text-xs text-gray-600 text-center">
                📈 Technical analysis கல்வி நோக்கத்திற்காக மட்டுமே. Trading
                decisions க்கு முன் முழுமையான ஆராய்ச்சி செய்யுங்கள். Past
                performance எதிர்கால results guarantee செய்யாது.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TechnicalModal;
