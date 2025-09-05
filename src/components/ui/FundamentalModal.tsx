import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calculator, TrendingUp, Info, Target } from "lucide-react";
import Button from "./Button";
import { HealthStatus } from "@/types";

interface FundamentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricType: string;
  metricValue: string | number;
  metricHealth?: HealthStatus;
  stockData?: any;
}

const FundamentalModal: React.FC<FundamentalModalProps> = ({
  isOpen,
  onClose,
  metricType,
  metricValue,
  metricHealth,
  stockData,
}) => {
  // Tamil explanations for each fundamental metric
  const getFundamentalExplanation = (
    type: string,
    value: string | number,
    health?: HealthStatus
  ) => {
    const explanations: Record<string, any> = {
      // Financial Statements
      "Revenue Growth": {
        title: "Revenue Growth (வருமான வளர்ச்சி)",
        definition:
          "கடந்த வருடத்துடன் ஒப்பிடும்போது நிறுவனத்தின் மொத்த வருமானம் எவ்வளவு அதிகரித்துள்ளது என்பதை குறிக்கும் சதவீதம்.",
        calculation:
          "Revenue Growth = ((இந்த ஆண்டு வருமானம் - கடந்த ஆண்டு வருமானம்) / கடந்த ஆண்டு வருமானம்) × 100",
        importance:
          "நிறுவனத்தின் வணிகம் எவ்வளவு வேகமாக வளர்ந்து வருகிறது என்பதை அறிய இது மிக முக்கிய அளவுகோல். வருமான வளர்ச்சி அதிகமாக இருந்தால் நிறுவனம் நல்ல நிலையில் உள்ளது.",
        interpretation: getGrowthInterpretation(
          parseFloat(value.toString().replace("%", ""))
        ),
        goodRange: "15% அல்லது அதற்கு மேல் - மிகச்சிறந்தது",
        tips: "• நிலையான வருமான வளர்ச்சி முக்கியம்\n• 20%+ வளர்ச்சி மிகவும் நல்லது\n• எதிர்மறை வளர்ச்சி எச்சரிக்கை\n• தொழில்துறை சராசரியுடன் ஒப்பிடவும்",
      },

      "Net Profit Margin": {
        title: "Net Profit Margin (நிகர லாப விகிதம்)",
        definition:
          "நிறுவனத்தின் மொத்த வருமானத்தில் எவ்வளவு சதவீதம் நிகர லாபமாக மிஞ்சுகிறது என்பதை குறிக்கும் விகிதம்.",
        calculation: "Net Profit Margin = (நிகர லாபம் / மொத்த வருமானம்) × 100",
        importance:
          "நிறுவனம் எவ்வளவு திறமையாக செலவுகளை கட்டுப்படுத்தி லாபம் ஈட்டுகிறது என்பதை காட்டுகிறது. அதிக நிகர லாப விகிதம் நிறுவனத்தின் வலுவான நிர்வாகத்தை குறிக்கிறது.",
        interpretation: getMarginInterpretation(
          parseFloat(value.toString().replace("%", ""))
        ),
        goodRange: "10% அல்லது அதற்கு மேல் - நல்லது",
        tips: "• நிலையான அல்லது அதிகரிக்கும் விகிதம் நல்லது\n• தொழில்துறை சராசரியுடன் ஒப்பிடவும்\n• செலவு கட்டுப்பாட்டின் அறிகுறி\n• போட்டியாளர்களுடன் ஒப்பிடுங்கள்",
      },

      "Operating Margin": {
        title: "Operating Margin (இயக்க லாப விகிதம்)",
        definition:
          "நிறுவனத்தின் முக்கிய வணிக செயல்பாடுகளிலிருந்து கிடைக்கும் லாபத்தின் சதவீதம். வட்டி மற்றும் வரிகளுக்கு முன்பான லாபம்.",
        calculation: "Operating Margin = (இயக்க லாபம் / மொத்த வருமானம்) × 100",
        importance:
          "நிறுவனத்தின் முக்கிய வணிகம் எவ்வளவு லாபகரமானது என்பதை காட்டுகிறது. நிதி செலவுகளைத் தவிர்த்து அடிப்படை வணிகத்தின் திறமையை அளவிடுகிறது.",
        interpretation: getMarginInterpretation(
          parseFloat(value.toString().replace("%", ""))
        ),
        goodRange: "15% அல்லது அதற்கு மேல் - நல்லது",
        tips: "• அடிப்படை வணிகத்தின் ஆரோக்கியம்\n• நிலையான விகிதம் முக்கியம்\n• போட்டியாளர்களுடன் ஒப்பிடுங்கள்\n• செலவு மேலாண்மையின் குறிகாட்டி",
      },

      // Profitability Ratios
      ROE: {
        title: "ROE - Return on Equity (பங்குதாரர் மூலதன வருமானம்)",
        definition:
          "பங்குதாரர்கள் முதலீடு செய்த ஒவ்வொரு ரூபாய்க்கும் நிறுவனம் எவ்வளவு லாபம் ஈட்டுகிறது என்பதை குறிக்கும் சதவீதம்.",
        calculation: "ROE = (நிகர லாபம் / பங்குதாரர்களின் மூலதனம்) × 100",
        importance:
          "முதலீட்டாளர்களுக்கு மிக முக்கிய அளவுகோல். நிறுவனம் பங்குதாரர்களின் பணத்தை எவ்வளவு திறமையாக பயன்படுத்துகிறது என்பதை காட்டுகிறது.",
        interpretation: getROEInterpretation(
          parseFloat(value.toString().replace("%", ""))
        ),
        goodRange: "15% அல்லது அதற்கு மேல் - மிகச்சிறந்தது",
        tips: "• Warren Buffett இன் விருப்பமான அளவுகோல்\n• 20%+ ROE மிகவும் அரிதானது\n• நீண்ட கால நிலைத்தன்மை முக்கியம்\n• கடன் அதிகரிப்பால் தற்காலிக ROE உயர்வு",
      },

      ROA: {
        title: "ROA - Return on Assets (சொத்து வருமானம்)",
        definition:
          "நிறுவனத்தின் மொத்த சொத்துக்களிலிருந்து எவ்வளவு லாபம் ஈட்டுகிறது என்பதை குறிக்கும் விகிதம்.",
        calculation: "ROA = (நிகர லாபம் / மொத்த சொத்துக்கள்) × 100",
        importance:
          "நிறுவனம் தனது சொத்துக்களை எவ்வளவு திறமையாக பயன்படுத்தி லாபம் ஈட்டுகிறது என்பதை காட்டுகிறது. நிர்வாகத்தின் திறமையின் அளவுகோல்.",
        interpretation: getROAInterpretation(
          parseFloat(value.toString().replace("%", ""))
        ),
        goodRange: "5% அல்லது அதற்கு மேல் - நல்லது",
        tips: "• சொத்து பயன்பாட்டின் திறமை\n• தொழில்துறை வேறுபாடுகள் உண்டு\n• சேவைத் துறை பொதுவாக அதிக ROA\n• சொத்து அதிக துறைகள் குறைந்த ROA",
      },

      ROCE: {
        title:
          "ROCE - Return on Capital Employed (பயன்படுத்தப்பட்ட மூலதன வருமானம்)",
        definition:
          "நிறுவனம் தனது முக்கிய வணிகத்திற்காக பயன்படுத்திய மூலதனத்திலிருந்து எவ்வளவு லாபம் ஈட்டுகிறது என்பதை குறிக்கும் விகிதம்.",
        calculation:
          "ROCE = (வட்டி மற்றும் வரிக்கு முன் லாபம் / பயன்படுத்தப்பட்ட மூலதனம்) × 100",
        importance:
          "நிறுவனத்தின் ஒட்டுமொத்த லாபகரத்தன்மை மற்றும் திறமையை அளவிடும் மிகச்சிறந்த அளவுகோல். Warren Buffett இன் விருப்பமான metric.",
        interpretation: getROCEInterpretation(
          parseFloat(value.toString().replace("%", ""))
        ),
        goodRange: "15% அல்லது அதற்கு மேல் - மிகச்சிறந்தது",
        tips: "• முதலீட்டு முடிவுகளுக்கு மிக முக்கியம்\n• நீண்ட கால நிலைத்தன்மை பாருங்கள்\n• 20%+ ROCE அரிதானது\n• தொழில்துறை தலைவர்கள் அதிக ROCE",
      },

      "Gross Margin": {
        title: "Gross Margin (மொத்த லாப விகிதம்)",
        definition:
          "விற்பனை வருமானத்திலிருந்து நேரடி உற்பத்தி செலவுகளை கழித்த பின் மிஞ்சும் லாபத்தின் சதவீதம்.",
        calculation:
          "Gross Margin = ((வருமானம் - விற்பனைக்கான செலவு) / வருமானம்) × 100",
        importance:
          "நிறுவனத்தின் முக்கிய தயாரிப்பு அல்லது சேவையின் லாபகரத்தன்மையை காட்டுகிறது. விலை நிர்ணய சக்தியின் அறிகுறி.",
        interpretation: getMarginInterpretation(
          parseFloat(value.toString().replace("%", ""))
        ),
        goodRange: "40% அல்லது அதற்கு மேல் - மிகச்சிறந்தது",
        tips: "• பொருட்களின் விலை நிர்ணய சக்தி\n• போட்டியின் தீவிரத்தை காட்டுகிறது\n• அதிக Gross Margin நல்ல moat\n• தொழில்துறை சராசரியுடன் ஒப்பிடுங்கள்",
      },

      "Net Margin": {
        title: "Net Margin (நிகர லாப விகிதம்)",
        definition:
          "அனைத்து செலவுகளையும் கழித்த பின் நிறுவனத்திற்கு மிஞ்சும் நிகர லாபத்தின் சதவீதம்.",
        calculation: "Net Margin = (நிகர லாபம் / மொத்த வருமானம்) × 100",
        importance:
          "நிறுவனத்தின் ஒட்டுமொத்த லாபகரத்தன்மையின் இறுதி அளவுகோல். அனைத்து செலவுகளையும் கழித்த பின்னான உண்மையான லாபம்.",
        interpretation: getMarginInterpretation(
          parseFloat(value.toString().replace("%", ""))
        ),
        goodRange: "10% அல்லது அதற்கு மேல் - நல்லது",
        tips: "• இறுதியான லாபகரத்தன்மை\n• செலவு கட்டுப்பாட்டின் அறிகுறி\n• வரி திறமையின் குறிகாட்டி\n• நீண்ட கால நிலைத்தன்மை முக்கியம்",
      },

      // Liquidity & Solvency Ratios
      "Current Ratio": {
        title: "Current Ratio (நடப்பு விகிதம்)",
        definition:
          "நிறுவனம் ஒரு வருடத்திற்குள் செலுத்த வேண்டிய கடன்களை தனது நடப்பு சொத்துக்களால் எவ்வளவு முறை செலுத்த முடியும் என்பதை குறிக்கும் விகிதம்.",
        calculation: "Current Ratio = நடப்பு சொத்துக்கள் / நடப்பு பொறுப்புகள்",
        importance:
          "நிறுவனத்தின் குறுகிய கால நிதி நிலைமையை அளவிடுகிறது. கடன் செலுத்தும் திறனின் அளவுகோல்.",
        interpretation: getCurrentRatioInterpretation(
          parseFloat(value.toString())
        ),
        goodRange: "1.5 - 3.0 இடையில் - ஆரோக்கியமானது",
        tips: "• 2.0 சிறந்த விகிதம்\n• 1.0 க்கும் குறைவு ஆபத்தானது\n• 3.0 க்கும் மேல் பணம் வீணானது\n• தொழில்துறை வேறுபாடுகள் உண்டு",
      },

      "Quick Ratio": {
        title: "Quick Ratio (விரைவு விகிதம்)",
        definition:
          "இன்வென்டரியை தவிர்த்த மற்ற நடப்பு சொத்துக்களால் குறுகிய கால கடன்களை செலுத்தும் திறனை அளவிடும் விகிதம்.",
        calculation:
          "Quick Ratio = (நடப்பு சொத்துக்கள் - இன்வென்டரி) / நடப்பு பொறுப்புகள்",
        importance:
          "Current Ratio விட கடுமையான அளவுகோல். உடனடியாக பணமாக மாற்றக்கூடிய சொத்துக்களின் அடிப்படையில் கடன் செலுத்தும் திறன்.",
        interpretation: getQuickRatioInterpretation(
          parseFloat(value.toString())
        ),
        goodRange: "1.0 - 1.5 இடையில் - ஆரோக்கியமானது",
        tips: "• Current Ratio விட துல்லியமானது\n• இன்வென்டரி பிரச்சனைகளை தவிர்க்கிறது\n• 1.0 க்கும் மேல் பாதுகாப்பானது\n• சேவைத் துறைக்கு குறைவாக இருக்கும்",
      },

      "Debt-to-Equity": {
        title: "Debt-to-Equity Ratio (கடன்-மூலதன விகிதம்)",
        definition:
          "நிறுவனத்தின் மொத்த கடனை பங்குதாரர்களின் மூலதனத்துடன் ஒப்பிடும் விகிதம். நிதி leverage-ன் அளவுகோல்.",
        calculation: "Debt-to-Equity = மொத்த கடன் / பங்குதாரர் மூலதனம்",
        importance:
          "நிறுவனம் எவ்வளவு கடனை நம்பி இருக்கிறது என்பதை காட்டுகிறது. அதிக கடன் அதிக ரிஸ்க் ஆனால் அதிக வருமான சாத்தியம்.",
        interpretation: getDebtEquityInterpretation(
          parseFloat(value.toString())
        ),
        goodRange: "0.3 க்கும் குறைவு - பாதுகாப்பானது",
        tips: "• குறைந்த விகிதம் பாதுகாப்பானது\n• 0.5 க்கும் மேல் எச்சரிக்கை\n• தொழில்துறை வேறுபாடுகள் உண்டு\n• நிலையான cash flow முக்கியம்",
      },

      "Interest Coverage": {
        title: "Interest Coverage Ratio (வட்டி கவரேஜ் விகிதம்)",
        definition:
          "நிறுவனம் தனது வட்டி செலவுகளை எவ்வளவு முறை செலுத்த முடியும் என்பதை குறிக்கும் விகிதம்.",
        calculation:
          "Interest Coverage = வட்டி மற்றும் வரிக்கு முன் லாபம் / வட்டி செலவு",
        importance:
          "கடன் செலுத்தும் திறனின் மிக முக்கிய அளவுகோல். நிறுவனம் நிதி நெருக்கடியில் இருக்கிறதா என்பதை அறிய உதவுகிறது.",
        interpretation: getInterestCoverageInterpretation(
          parseFloat(value.toString().replace("x", ""))
        ),
        goodRange: "5x அல்லது அதற்கு மேல் - பாதுகாப்பானது",
        tips: "• 2.5x க்கும் குறைவு ஆபத்தானது\n• அதிக விகிதம் நல்லது\n• நிலையான cash flow முக்கியம்\n• பொருளாதார மந்தநிலையில் முக்கியம்",
      },

      // Valuation Metrics
      "P/E Ratio": {
        title: "P/E Ratio - Price to Earnings (விலை-வருமான விகிதம்)",
        definition:
          "ஒரு பங்கின் தற்போதைய விலையை ஒரு பங்குக்கான வருடாந்திர வருமானத்தால் வகுத்த விகிதம். பங்கு எவ்வளவு மலிவு/விலை என்பதின் அளவுகோல்.",
        calculation: "P/E Ratio = பங்கு விலை / ஒரு பங்குக்கான வருமானம் (EPS)",
        importance:
          "மிக முக்கிய valuation metric. பங்கு அதிக விலை அல்லது மலிவு என்பதை அறிய உதவுகிறது. முதலீட்டாளர்கள் ஒவ்வொரு ரூபாய் வருமானத்திற்கு எவ்வளவு செலுத்த தயாராக உள்ளனர்.",
        interpretation: getPEInterpretation(parseFloat(value.toString())),
        goodRange: "15-25 இடையில் - நியாயமான மதிப்பீடு",
        tips: "• குறைந்த P/E = மலிவான மதிப்பீடு\n• அதிக P/E = அதிக வளர்ச்சி எதிர்பார்ப்பு\n• தொழில்துறை சராசரியுடன் ஒப்பிடுங்கள்\n• வளர்ச்சி விகிதத்துடன் ஒப்பிடுங்கள்",
      },

      "P/B Ratio": {
        title: "P/B Ratio - Price to Book (விலை-புத்தக மதிப்பு விகிதம்)",
        definition:
          "பங்கின் சந்தை விலையை ஒரு பங்குக்கான புத்தக மதிப்புடன் ஒப்பிடும் விகிதம். சொத்து அடிப்படையிலான மதிப்பீடு.",
        calculation: "P/B Ratio = பங்கு விலை / ஒரு பங்குக்கான புத்தக மதிப்பு",
        importance:
          "நிறுவனத்தின் சொத்துக்களின் அடிப்படையில் பங்கு அதிக விலை அல்லது மலிவு என்பதை அறிய உதவுகிறது. சொத்து அதிக நிறுவனங்களுக்கு முக்கியம்.",
        interpretation: getPBInterpretation(parseFloat(value.toString())),
        goodRange: "1.0-3.0 இடையில் - நியாயமான மதிப்பீடு",
        tips: "• 1.0 க்கும் குறைவு - சொத்து மதிப்பை விட குறைவு\n• அதிக ROE நிறுவனங்களுக்கு அதிக P/B\n• வங்கிகளுக்கு மிக முக்கியம்\n• சொத்து அதிக துறைகளுக்கு பயனுள்ளது",
      },

      "P/S Ratio": {
        title: "P/S Ratio - Price to Sales (விலை-விற்பனை விகிதம்)",
        definition:
          "பங்கின் சந்தை விலையை ஒரு பங்குக்கான வருடாந்திர விற்பனையுடன் ஒப்பிடும் விகிதம்.",
        calculation: "P/S Ratio = பங்கு விலை / ஒரு பங்குக்கான விற்பனை",
        importance:
          "லாபம் இல்லாத அல்லது நஷ்டத்தில் இயங்கும் நிறுவனங்களை மதிப்பிட உதவுகிறது. வருமான அடிப்படையிலான மதிப்பீடு.",
        interpretation: getPSInterpretation(parseFloat(value.toString())),
        goodRange: "1.0-3.0 இடையில் - நியாயமான மதிப்பீடு",
        tips: "• வளர்ச்சி நிறுவனங்களுக்கு பயனுள்ளது\n• தொழில்நுட்ப நிறுவனங்களுக்கு முக்கியம்\n• லாப விகிதத்துடன் இணைத்து பாருங்கள்\n• வருமான வளர்ச்சியுடன் ஒப்பிடுங்கள்",
      },

      "EV/EBITDA": {
        title: "EV/EBITDA - Enterprise Value to EBITDA",
        definition:
          "நிறுவனத்தின் மொத்த மதிப்பை (கடன் உட்பட) EBITDA (வட்டி, வரி, தேய்மானம், amortization க்கு முன் வருமானம்) உடன் ஒப்பிடும் விகிதம்.",
        calculation:
          "EV/EBITDA = (மார்க்கெட் கேப் + மொத்த கடன் - பணம்) / EBITDA",
        importance:
          "மிகவும் comprehensive valuation metric. கடன் மற்றும் வரி வேறுபாடுகளை நீக்கி நிறுவனங்களை ஒப்பிட உதவுகிறது.",
        interpretation: getEVEBITDAInterpretation(parseFloat(value.toString())),
        goodRange: "8-15 இடையில் - நியாயமான மதிப்பீடு",
        tips: "• கடன் நிறுவனங்களை ஒப்பிட சிறந்தது\n• cash flow அடிப்படையிலான மதிப்பீடு\n• தொழில்துறை ஒப்பீட்டிற்கு சிறந்தது\n• M&A விலை நிர்ணயத்தில் பயன்படும்",
      },

      "Dividend Yield": {
        title: "Dividend Yield (டிவிடெண்ட் ஈல்ட்)",
        definition:
          "நிறுவனம் ஆண்டுக்கு வழங்கும் டிவிடெண்டை தற்போதைய பங்கு விலையால் வகுத்த சதவீதம். வருடாந்திர வருமான விகிதம்.",
        calculation:
          "Dividend Yield = (ஆண்டுக்கான டிவிடெண்ட் / பங்கு விலை) × 100",
        importance:
          "முதலீட்டாளர்களுக்கு வருடாந்திர cash வருமானம். ஓய்வுகால முதலீட்டாளர்களுக்கு மிக முக்கியம். நிலையான வருமான ஆதாரம்.",
        interpretation: getDividendYieldInterpretation(
          parseFloat(value.toString().replace("%", ""))
        ),
        goodRange: "2-6% இடையில் - நல்ல வருமானம்",
        tips: "• நிலையான டிவிடெண்ட் முக்கியம்\n• அதிக yield சில நேரம் ஆபத்தானது\n• டிவிடெண்ட் வளர்ச்சி பாருங்கள்\n• payout ratio கவனிக்கவும்",
      },

      // Growth Indicators
      "Revenue CAGR": {
        title:
          "Revenue CAGR - Compound Annual Growth Rate (கூட்டு வருடாந்திர வளர்ச்சி விகிதம்)",
        definition:
          "பல ஆண்டுகளாக நிறுவனத்தின் வருமானம் சராசரியாக எவ்வளவு சதவீதம் வளர்ந்துள்ளது என்பதை குறிக்கும் விகிதம்.",
        calculation:
          "CAGR = ((கடைசி ஆண்டு வருமானம் / முதல் ஆண்டு வருமானம்)^(1/ஆண்டுகள்)) - 1",
        importance:
          "நீண்ட கால வளர்ச்சியின் மிகச்சிறந்த அளவுகோல். ஆண்டுக்கு ஆண்டு ஏற்ற இறக்கங்களை சமன் செய்து உண்மையான வளர்ச்சியை காட்டுகிறது.",
        interpretation: getCAGRInterpretation(
          parseFloat(value.toString().replace("%", ""))
        ),
        goodRange: "15%+ CAGR - மிகச்சிறந்த வளர்ச்சி",
        tips: "• 3-5 ஆண்டு CAGR பாருங்கள்\n• நிலையான வளர்ச்சி முக்கியம்\n• தொழில்துறை வளர்ச்சியுடன் ஒப்பிடுங்கள்\n• எதிர்கால நிலைத்தன்மை கருதுங்கள்",
      },

      "EPS Growth": {
        title:
          "EPS Growth - Earnings Per Share Growth (ஒரு பங்குக்கான வருமான வளர்ச்சி)",
        definition:
          "ஒரு பங்குக்கான வருமானம் கடந்த காலங்களில் எவ்வளவு வளர்ந்துள்ளது என்பதை குறிக்கும் சதவீதம்.",
        calculation:
          "EPS Growth = ((இந்த ஆண்டு EPS - கடந்த ஆண்டு EPS) / கடந்த ஆண்டு EPS) × 100",
        importance:
          "பங்குதாரர்களுக்கான வருமான வளர்ச்சியின் நேரடி அளவுகோல். பங்கு விலை வளர்ச்சியின் முக்கிய காரணி.",
        interpretation: getGrowthInterpretation(
          parseFloat(value.toString().replace("%", ""))
        ),
        goodRange: "15%+ வளர்ச்சி - மிகச்சிறந்தது",
        tips: "• நிலையான EPS வளர்ச்சி முக்கியம்\n• பங்கு விலை வளர்ச்சியின் அடிப்படை\n• quality of earnings பாருங்கள்\n• one-time gains தவிர்த்து பாருங்கள்",
      },

      "Market Share Growth": {
        title: "Market Share Growth (சந்தைப் பங்கு வளர்ச்சி)",
        definition:
          "தொழில்துறையில் நிறுவனத்தின் சந்தைப் பங்கு எவ்வளவு அதிகரித்துள்ளது என்பதை குறிக்கும் சதவீதம்.",
        calculation:
          "Market Share Growth = ((தற்போதைய சந்தைப் பங்கு - முந்தைய சந்தைப் பங்கு) / முந்தைய சந்தைப் பங்கு) × 100",
        importance:
          "நிறுவனம் போட்டியாளர்களை விட வேகமாக வளர்கிறதா என்பதை காட்டுகிறது. தொழில்துறையில் நிறுவனத்தின் வலிமையின் அறிகுறி.",
        interpretation: getMarketShareInterpretation(
          parseFloat(value.toString().replace("%", ""))
        ),
        goodRange: "உலக சராசரியை விட அதிகம் - நல்லது",
        tips: "• தொழில்துறை வளர்ச்சியுடன் ஒப்பிடுங்கள்\n• போட்டி நிலவரம் கருதுங்கள்\n• brand strength மற்றும் moat\n• எதிர்கால நிலைத்தன்மை",
      },
    };

    return (
      explanations[type] || {
        title: "தகவல் கிடைக்கவில்லை",
        definition: "இந்த அளவுருவின் விளக்கம் தற்போது கிடைக்கவில்லை.",
        calculation: "கணக்கீட்டு முறை கிடைக்கவில்லை",
        importance: "முக்கியத்துவம் பற்றிய தகவல் கிடைக்கவில்லை",
        interpretation: "தற்போதைய மதிப்பின் பகுப்பாய்வு கிடைக்கவில்லை",
        goodRange: "நல்ல வரம்பு தகவல் கிடைக்கவில்லை",
        tips: "குறிப்புகள் கிடைக்கவில்லை",
      }
    );
  };

  // Helper functions for interpretations
  function getGrowthInterpretation(growth: number): string {
    if (growth >= 25)
      return `${growth}% வளர்ச்சி அற்புதமானது! இது அதிவேக வளர்ச்சி நிறுவனத்தின் அறிகுறி.`;
    if (growth >= 15)
      return `${growth}% வளர்ச்சி மிகவும் நல்லது. நிலையான உயர் வளர்ச்சி.`;
    if (growth >= 10)
      return `${growth}% வளர்ச்சி நல்லது. சராசரியை விட அதிகமான வளர்ச்சி.`;
    if (growth >= 5)
      return `${growth}% வளர்ச்சி மிதமானது. பொருளாதார வளர்ச்சியுடன் இணைந்து.`;
    if (growth > 0) return `${growth}% வளர்ச்சி மெதுவானது. கூடுதல் கவனம் தேவை.`;
    return `${growth}% எதிர்மறை வளர்ச்சி கவலைக்குரியது. உடனடி திருத்த நடவடிக்கை தேவை.`;
  }

  function getMarginInterpretation(margin: number): string {
    if (margin >= 20)
      return `${margin}% விகிதம் அற்புதமானது! மிகவும் லாபகரமான நிறுவனம்.`;
    if (margin >= 15)
      return `${margin}% விகிதம் மிகவும் நல்லது. வலுவான லாபகரத்தன்மை.`;
    if (margin >= 10) return `${margin}% விகிதம் நல்லது. ஆரோக்கியமான லாப நிலை.`;
    if (margin >= 5)
      return `${margin}% விகிதம் சராசரி. மேம்பாட்டிற்கு வாய்ப்பு உண்டு.`;
    if (margin > 0) return `${margin}% விகிதம் குறைவு. செலவு கட்டுப்பாடு தேவை.`;
    return `${margin}% எதிர்மறை விகிதம் கவலைக்குரியது. நஷ்ட நிலையில் உள்ளது.`;
  }

  function getROEInterpretation(roe: number): string {
    if (roe >= 25)
      return `${roe}% ROE அசாதாரணமானது! Warren Buffett கூட வியக்கும் அளவு.`;
    if (roe >= 20)
      return `${roe}% ROE அற்புதமானது! உலகத்தரம் வாய்ந்த நிறுவனம்.`;
    if (roe >= 15)
      return `${roe}% ROE மிகவும் நல்லது. முதலீட்டிற்கு ஏற்ற நிறுவனம்.`;
    if (roe >= 10) return `${roe}% ROE நல்லது. சராசரியை விட மேல்.`;
    if (roe >= 5) return `${roe}% ROE சராசரி. மேம்பாட்டிற்கு வாய்ப்பு உண்டு.`;
    return `${roe}% ROE குறைவு. முதலீட்டாளர்களுக்கு குறைந்த வருமானம்.`;
  }

  function getROAInterpretation(roa: number): string {
    if (roa >= 15)
      return `${roa}% ROA அற்புதமானது! சொத்து பயன்பாட்டில் மிகச்சிறந்த திறமை.`;
    if (roa >= 10)
      return `${roa}% ROA மிகவும் நல்லது. திறமையான சொத்து மேலாண்மை.`;
    if (roa >= 5) return `${roa}% ROA நல்லது. ஆரோக்கியமான சொத்து பயன்பாடு.`;
    if (roa >= 2) return `${roa}% ROA சராசரி. மேம்பாட்டிற்கு இடம் உண்டு.`;
    return `${roa}% ROA குறைவு. சொத்து பயன்பாட்டில் பலவீனம்.`;
  }

  function getROCEInterpretation(roce: number): string {
    if (roce >= 25)
      return `${roce}% ROCE அசாதாரணமானது! Exceptional business model.`;
    if (roce >= 20) return `${roce}% ROCE அற்புதமானது! மிகச்சிறந்த நிறுவனம்.`;
    if (roce >= 15)
      return `${roce}% ROCE மிகவும் நல்லது. முதலீட்டிற்கு சிறந்த தேர்வு.`;
    if (roce >= 10) return `${roce}% ROCE நல்லது. திறமையான மூலதன பயன்பாடு.`;
    return `${roce}% ROCE மேம்பாடு தேவை. மூலதன பயன்பாட்டில் பலவீனம்.`;
  }

  function getCurrentRatioInterpretation(ratio: number): string {
    if (ratio >= 3)
      return `${ratio} விகிதம் அதிகமாக உள்ளது. பணம் திறமையாக பயன்படுத்தப்படவில்லை.`;
    if (ratio >= 2)
      return `${ratio} விகிதம் மிகவும் நல்லது. சிறந்த குறுகிய கால நிதி நிலை.`;
    if (ratio >= 1.5) return `${ratio} விகிதம் நல்லது. ஆரோக்கியமான liquidity.`;
    if (ratio >= 1) return `${ratio} விகிதம் சரியானது. குறைந்தபட்ச பாதுகாப்பு.`;
    return `${ratio} விகிதம் ஆபத்தானது. குறுகிய கால நிதி நெருக்கடி சாத்தியம்.`;
  }

  function getQuickRatioInterpretation(ratio: number): string {
    if (ratio >= 1.5)
      return `${ratio} விகிதம் மிகவும் நல்லது. வலுவான உடனடி liquidity.`;
    if (ratio >= 1) return `${ratio} விகிதம் நல்லது. போதுமான உடனடி liquidity.`;
    if (ratio >= 0.5)
      return `${ratio} விகிதம் எச்சரிக்கை. உடனடி liquidity பற்றாக்குறை.`;
    return `${ratio} விகிதம் ஆபத்தானது. உடனடி பணப் பற்றாக்குறை.`;
  }

  function getDebtEquityInterpretation(ratio: number): string {
    if (ratio <= 0.3)
      return `${ratio} விகிதம் மிகவும் பாதுகாப்பானது. குறைந்த நிதி ரிஸ்க்.`;
    if (ratio <= 0.5)
      return `${ratio} விகிதம் நல்லது. ஏற்றுக்கொள்ளக்கூடிய கடன் நிலை.`;
    if (ratio <= 1) return `${ratio} விகிதம் எச்சரிக்கை. அதிக கடன் சுமை.`;
    return `${ratio} விகிதம் ஆபத்தானது. மிக அதிக நிதி leverage.`;
  }

  function getInterestCoverageInterpretation(coverage: number): string {
    if (coverage >= 10)
      return `${coverage}x கவரேஜ் அற்புதமானது. வட்டி செலுத்துவதில் எந்த பிரச்சனையும் இல்லை.`;
    if (coverage >= 5)
      return `${coverage}x கவரேஜ் நல்லது. வட்டி செலுத்தும் திறன் வலுவானது.`;
    if (coverage >= 2.5)
      return `${coverage}x கவரேஜ் போதுமானது. குறைந்தபட்ச பாதுகாப்பு.`;
    return `${coverage}x கவரேஜ் ஆபத்தானது. வட்டி செலுத்துவதில் சிரமம்.`;
  }

  function getPEInterpretation(pe: number): string {
    if (pe <= 10)
      return `${pe} P/E மிகவும் மலிவானது. அல்லது வளர்ச்சி பிரச்சனைகள் இருக்கலாம்.`;
    if (pe <= 15) return `${pe} P/E மலிவான மதிப்பீடு. நல்ல முதலீட்டு வாய்ப்பு.`;
    if (pe <= 25)
      return `${pe} P/E நியாயமான மதிப்பீடு. சராசரி வளர்ச்சி எதிர்பார்ப்பு.`;
    if (pe <= 40)
      return `${pe} P/E அதிக மதிப்பீடு. உயர் வளர்ச்சி எதிர்பார்ப்பு.`;
    return `${pe} P/E மிக அதிக மதிப்பீடு. அதிக ரிஸ்க் எச்சரிக்கை.`;
  }

  function getPBInterpretation(pb: number): string {
    if (pb <= 1)
      return `${pb} P/B சொத்து மதிப்பை விட குறைவு. மலிவான மதிப்பீடு.`;
    if (pb <= 2) return `${pb} P/B நியாயமான மதிப்பீடு. ஆரோக்கியமான premia.`;
    if (pb <= 4)
      return `${pb} P/B சற்று அதிக மதிப்பீடு. உயர் ROE எதிர்பார்ப்பு.`;
    return `${pb} P/B மிக அதிக மதிப்பீடு. சொத்து மதிப்பை விட பல மடங்கு.`;
  }

  function getPSInterpretation(ps: number): string {
    if (ps <= 1) return `${ps} P/S மலிவான மதிப்பீடு. Revenue multiple குறைவு.`;
    if (ps <= 3) return `${ps} P/S நியாயமான மதிப்பீடு. சராசரி premium.`;
    if (ps <= 6)
      return `${ps} P/S அதிக மதிப்பீடு. உயர் வளர்ச்சி எதிர்பார்ப்பு.`;
    return `${ps} P/S மிக அதிக மதிப்பீடு. Revenue growth நியாயப்படுத்த வேண்டும்.`;
  }

  function getEVEBITDAInterpretation(ev: number): string {
    if (ev <= 8)
      return `${ev} EV/EBITDA மலிவான மதிப்பீடு. நல்ல value opportunity.`;
    if (ev <= 15)
      return `${ev} EV/EBITDA நியாயமான மதிப்பீடு. சராசரி valuation.`;
    if (ev <= 25) return `${ev} EV/EBITDA அதிக மதிப்பீடு. Premium valuation.`;
    return `${ev} EV/EBITDA மிக அதிக மதிப்பீடு. எச்சரிக்கை தேவை.`;
  }

  function getDividendYieldInterpretation(yield_: number): string {
    if (yield_ >= 6)
      return `${yield_}% மிக அதிக yield. ஆனால் sustainability கேள்விக்குறி.`;
    if (yield_ >= 4) return `${yield_}% நல்ல yield. ஆரோக்கியமான வருமான ஆதாரம்.`;
    if (yield_ >= 2) return `${yield_}% மிதமான yield. வளர்ச்சியுடன் சமநிலை.`;
    if (yield_ >= 1) return `${yield_}% குறைந்த yield. வளர்ச்சி கவனம் அதிகம்.`;
    return `${yield_}% மிகக் குறைந்த yield. நிறுவனம் வளர்ச்சியில் கவனம்.`;
  }

  function getCAGRInterpretation(cagr: number): string {
    if (cagr >= 25) return `${cagr}% CAGR அற்புதமானது! Hypergrowth company.`;
    if (cagr >= 15) return `${cagr}% CAGR மிகவும் நல்லது. வலுவான வளர்ச்சி.`;
    if (cagr >= 10) return `${cagr}% CAGR நல்லது. ஆரோக்கியமான வளர்ச்சி.`;
    if (cagr >= 5)
      return `${cagr}% CAGR மிதமானது. பொருளாதார வளர்ச்சியுடன் இணைந்து.`;
    return `${cagr}% CAGR குறைவு அல்லது எதிர்மறை. வளர்ச்சி சவால்கள்.`;
  }

  function getMarketShareInterpretation(growth: number): string {
    if (growth >= 10)
      return `${growth}% சந்தைப் பங்கு வளர்ச்சி அற்புதமானது! போட்டியாளர்களை மிஞ்சுகிறது.`;
    if (growth >= 5)
      return `${growth}% சந்தைப் பங்கு வளர்ச்சி நல்லது. வலுவான போட்டி நிலை.`;
    if (growth >= 0)
      return `${growth}% சந்தைப் பங்கு வளர்ச்சி நிலையானது. தொழில்துறையுடன் இணைந்து.`;
    return `${growth}% சந்தைப் பங்கு இழப்பு கவலைக்குரியது. போட்டி அழுத்தம்.`;
  }

  const explanation = getFundamentalExplanation(
    metricType,
    metricValue,
    metricHealth
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
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {explanation.title}
                </h2>
                <p className="text-lg font-semibold text-blue-600 mt-1">
                  தற்போதைய மதிப்பு: {metricValue}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Definition */}
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  இது என்ன?
                </h3>
                <p className="text-blue-700 leading-relaxed text-base">
                  {explanation.definition}
                </p>
              </div>

              {/* Calculation */}
              <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  எப்படி கணக்கிடுகிறார்கள்?
                </h3>
                <div className="bg-white rounded-lg p-4 border border-purple-100">
                  <code className="text-purple-700 font-mono text-sm">
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

              {/* Good Range */}
              <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-200">
                <h3 className="text-lg font-semibold text-indigo-800 mb-3">
                  நல்ல வரம்பு
                </h3>
                <p className="text-indigo-700 font-semibold">
                  {explanation.goodRange}
                </p>
              </div>

              {/* Tips */}
              <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                  முக்கிய குறிப்புகள் மற்றும் எச்சரிக்கைகள்
                </h3>
                <pre className="text-yellow-700 text-sm whitespace-pre-line font-sans leading-relaxed">
                  {explanation.tips}
                </pre>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <p className="text-xs text-gray-600 text-center">
                📊 இந்த தகவல்கள் கல்வி நோக்கத்திற்காக மட்டுமே. முதலீட்டு
                முடிவுகளுக்கு முன் நிதி ஆலோசகரை அணுகவும். எந்த நிதி முடிவும்
                எடுக்கும் முன் முழுமையான ஆராய்ச்சி செய்யுங்கள்.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FundamentalModal;
