import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Button from "./Button";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  statType: string;
  statValue: string;
  stockData: any;
}

const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  statType,
  statValue,
  stockData,
}) => {
  // Tamil explanations for each stat type
  const getStatExplanation = (type: string, value: string, data: any) => {
    const explanations: Record<string, any> = {
      "Market Cap": {
        title: "சந்தை மூலதனம் (Market Capitalization)",
        definition:
          "ஒரு நிறுவனத்தின் மொத்த சந்தை மதிப்பு. இது நிறுவனத்தின் மொத்த பங்குகளின் எண்ணிக்கையை தற்போதைய பங்கு விலையுடன் பெருக்கி கணக்கிடப்படுகிறது.",
        currentState: `தற்போதைய சந்தை மூலதனம்: ${value}`,
        analysis: value.includes("T")
          ? "இது ஒரு பெரிய நிறுவனம் (Large Cap) ஆகும். பொதுவாக நிலையான மற்றும் நம்பகமான முதலீடாக கருதப்படுகிறது."
          : value.includes("B") && parseFloat(value.replace(/[₹B,]/g, "")) > 100
          ? "இது ஒரு நடுத்தர நிறுவனம் (Mid Cap) ஆகும். நல்ல வளர்ச்சி சாத்தியங்களுடன் இருக்கலாம்."
          : "இது ஒரு சிறிய நிறுவனம் (Small Cap) ஆகும். அதிக ரிஸ்க் மற்றும் அதிக ரிட்டர்ன் சாத்தியம் உள்ளது.",
        inference:
          "சந்தை மூலதனம் அதிகமாக இருந்தால், நிறுவனம் நிலையானதாகவும், குறைவாக இருந்தால் வளர்ச்சி சாத்தியம் அதிகமாகவும் இருக்கலாம்.",
        tips: "• பெரிய நிறுவனங்கள் பாதுகாப்பான முதலீடு\n• சிறிய நிறுவனங்கள் அதிக வளர்ச்சி சாத்தியம்\n• நடுத்தர நிறுவனங்கள் சமநிலையான தேர்வு",
      },
      "Current Price": {
        title: "தற்போதைய விலை (Current Market Price)",
        definition:
          "பங்குச்சந்தையில் இந்த நேரத்தில் ஒரு பங்கின் விலை. இது வாங்குபவர்கள் மற்றும் விற்பவர்களின் தேவை மற்றும் விநியோகத்தின் அடிப்படையில் தீர்மானிக்கப்படுகிறது.",
        currentState: `தற்போதைய பங்கு விலை: ${value}`,
        analysis:
          "விலை தினசரி வர்த்தகத்தின் அடிப்படையில் மாறுகிறது. நிறுவனத்தின் செயல்திறன் மற்றும் சந்தை நிலவரத்தை பிரதிபலிக்கிறது.",
        inference:
          "விலை அதிகரிப்பு நல்ல செய்திகளையும், குறைவு எதிர்மறை செய்திகளையும் குறிக்கலாம்.",
        tips: "• தினசரி விலை மாற்றங்களை கவனித்து வாருங்கள்\n• நீண்ட கால போக்குகளை கவனிக்கவும்\n• செய்திகள் மற்றும் அறிவிப்புகளின் தாக்கம்",
      },
      "High / Low": {
        title: "உயர்ந்த / குறைந்த விலை (52-Week High/Low)",
        definition:
          "கடந்த 52 வாரங்களில் (ஒரு வருடம்) இந்த பங்கு எட்டிய மிக உயர்ந்த மற்றும் மிக குறைந்த விலைகள்.",
        currentState: `52 வார இடைவெளி: ${value}`,
        analysis: data?.currentPrice
          ? `தற்போதைய விலை ₹${data.currentPrice} இந்த இடைவெளியில் ${
              data.currentPrice >
              (data.currentPrice * 1.15 + data.currentPrice * 0.85) / 2
                ? "மேல் பகுதியில்"
                : "கீழ் பகுதியில்"
            } உள்ளது.`
          : "விலை இடைவெளியில் நிறுவனத்தின் செயல்திறனை காட்டுகிறது.",
        inference:
          "உயர்ந்த விலைக்கு அருகில் இருந்தால் வலுவான செயல்திறன், குறைந்த விலைக்கு அருகில் இருந்தால் அதிக வாங்கும் வாய்ப்பு இருக்கலாம்.",
        tips: "• 52-வார உயர்ந்த விலைக்கு அருகில் வாங்குவதில் எச்சரிக்கை\n• குறைந்த விலைக்கு அருகில் வாங்கும் வாய்ப்பு\n• சராசரி விலையில் நல்ல நுழைவு புள்ளி",
      },
      "Stock P/E": {
        title: "பி/ஈ விகிதம் (Price to Earnings Ratio)",
        definition:
          "பங்கு விலையை ஒரு பங்குக்கான வருமானத்தால் வகுத்தால் கிடைக்கும் விகிதம். இது பங்கின் மதிப்பீட்டை குறிக்கிறது.",
        currentState: `தற்போதைய P/E விகிதம்: ${value}`,
        analysis: (() => {
          const peValue = parseFloat(value);
          if (isNaN(peValue)) return "P/E விகிதம் கிடைக்கவில்லை.";
          if (peValue < 15) return "குறைந்த P/E - மலிவான மதிப்பீடு";
          if (peValue < 25) return "நடுத்தர P/E - நியாயமான மதிப்பீடு";
          return "உயர்ந்த P/E - அதிக மதிப்பீடு அல்லது வளர்ச்சி எதிர்பார்ப்பு";
        })(),
        inference:
          "குறைந்த P/E நல்ல வாங்கும் வாய்ப்பாகவும், உயர்ந்த P/E அதிக வளர்ச்சி எதிர்பார்ப்பாகவும் இருக்கலாம்.",
        tips: "• P/E < 15: மலிவான மதிப்பீடு\n• P/E 15-25: நியாயமான மதிப்பீடு\n• P/E > 25: அதிக மதிப்பீடு\n• தொழில்துறை சராசரியுடன் ஒப்பிடவும்",
      },
      "Book Value": {
        title: "புத்தக மதிப்பு (Book Value)",
        definition:
          "நிறுவனத்தின் மொத்த சொத்துகளிலிருந்து கடன்களை கழித்து மீதமுள்ள மதிப்பை மொத்த பங்குகளால் வகுத்தால் கிடைக்கும் தொகை.",
        currentState: `ஒரு பங்குக்கான புத்தக மதிப்பு: ${value}`,
        analysis: data?.currentPrice
          ? `சந்தை விலை ${
              data.currentPrice > parseFloat(value.replace(/[₹,]/g, ""))
                ? "புத்தக மதிப்பை விட அதிகம்"
                : "புத்தக மதிப்பை விட குறைவு"
            }`
          : "புத்தக மதிப்பு நிறுவனத்தின் உண்மையான சொத்து மதிப்பை குறிக்கிறது.",
        inference:
          "சந்தை விலை புத்தக மதிப்பை விட குறைவாக இருந்தால் அது நல்ல வாங்கும் வாய்ப்பாக இருக்கலாம்.",
        tips: "• P/B விகிதம் < 1: குறைமதிப்பீடு\n• P/B விகிதம் 1-3: நியாயமான மதிப்பீடு\n• P/B விகிதம் > 3: அதிக மதிப்பீடு\n• சொத்து அடிப்படையிலான நிறுவனங்களுக்கு முக்கியம்",
      },
      "Dividend Yield": {
        title: "டிவிடெண்ட் ஈல்ட் (Dividend Yield)",
        definition:
          "நிறுவனம் ஆண்டுக்கு வழங்கும் டிவிடெண்டை தற்போதைய பங்கு விலையால் வகுத்தால் கிடைக்கும் சதவீதம்.",
        currentState: `வருடாந்திர டிவிடெண்ட் ஈல்ட்: ${value}`,
        analysis: (() => {
          const yieldValue = parseFloat(value.replace("%", ""));
          if (isNaN(yieldValue)) return "டிவிடெண்ட் தகவல் கிடைக்கவில்லை.";
          if (yieldValue < 1) return "குறைந்த டிவிடெண்ட் - வளர்ச்சி கவனம்";
          if (yieldValue < 3) return "நடுத்தர டிவிடெண்ட் - சமநிலையான அணுகுமுறை";
          return "உயர்ந்த டிவிடெண்ட் - வருமான கவனம்";
        })(),
        inference:
          "அதிக டிவிடெண்ட் ஈல்ட் வருடாந்திர வருமானத்திற்கு நல்லது, குறைந்த ஈல்ட் வளர்ச்சி கவனத்தை குறிக்கிறது.",
        tips: "• 0-1%: வளர்ச்சி நிறுவனங்கள்\n• 1-3%: சமநிலையான நிறுவனங்கள்\n• 3%+: வருமான கவனம்\n• நிலையான டிவிடெண்ட் வரலாறு முக்கியம்",
      },
      ROCE: {
        title: "முதலீட்டு மூலதன வருமானம் (Return on Capital Employed)",
        definition:
          "நிறுவனம் தனது மொத்த மூலதனத்தில் எவ்வளவு திறமையாக வருமானம் ஈட்டுகிறது என்பதை குறிக்கும் சதவீதம்.",
        currentState: `தற்போதைய ROCE: ${value}`,
        analysis: (() => {
          const roceValue = parseFloat(value.replace("%", ""));
          if (isNaN(roceValue)) return "ROCE தகவல் கிடைக்கவில்லை.";
          if (roceValue < 10)
            return "குறைந்த ROCE - மூலதன பயன்பாட்டில் பலவீனம்";
          if (roceValue < 20) return "நல்ல ROCE - திறமையான மூலதன பயன்பாடு";
          return "மிகச்சிறந்த ROCE - மிகவும் திறமையான நிறுவனம்";
        })(),
        inference:
          "அதிக ROCE நிறுவனம் தனது மூலதனத்தை திறமையாக பயன்படுத்துவதையும், லாபகரமான வணிகத்தையும் குறிக்கிறது.",
        tips: "• ROCE > 15%: மிகச்சிறந்த\n• ROCE 10-15%: நல்லது\n• ROCE < 10%: மேம்பாடு தேவை\n• தொழில்துறை சராசரியுடன் ஒப்பிடவும்",
      },
      ROE: {
        title: "பங்குதாரர் மூலதன வருமானம் (Return on Equity)",
        definition:
          "நிறுவனம் பங்குதாரர்களின் மூலதனத்தில் எவ்வளவு வருமானம் ஈட்டுகிறது என்பதை குறிக்கும் சதவீதம்.",
        currentState: `தற்போதைய ROE: ${value}`,
        analysis: (() => {
          const roeValue = parseFloat(value.replace("%", ""));
          if (isNaN(roeValue)) return "ROE தகவல் கிடைக்கவில்லை.";
          if (roeValue < 10)
            return "குறைந்த ROE - பங்குதாரர் மூலதன பயன்பாட்டில் பலவீனம்";
          if (roeValue < 20)
            return "நல்ல ROE - பங்குதாரர்களுக்கு நல்ல வருமானம்";
          return "மிகச்சிறந்த ROE - மிகவும் லாபகரமான நிறுவனம்";
        })(),
        inference:
          "அதிக ROE நிறுவனம் பங்குதாரர்களின் பணத்தை திறமையாக பயன்படுத்தி அதிக லாபம் ஈட்டுவதை குறிக்கிறது.",
        tips: "• ROE > 15%: மிகச்சிறந்த\n• ROE 10-15%: நல்லது\n• ROE < 10%: கவனம் தேவை\n• நீண்ட கால ROE போக்கு முக்கியம்",
      },
      Sector: {
        title: "தொழில்துறை (Business Sector)",
        definition:
          "நிறுவனம் எந்த தொழில்துறையில் செயல்படுகிறது என்பதை குறிக்கிறது. ஒவ்வொரு துறையும் வெவ்வேறு வளர்ச்சி சாத்தியங்களையும் ரிஸ்க்குகளையும் கொண்டுள்ளது.",
        currentState: `தொழில்துறை: ${value}`,
        analysis: (() => {
          const sectorAnalysis: Record<string, string> = {
            Technology:
              "தொழில்நுட்பத் துறை - அதிக வளர்ச்சி சாத்தியம், நவீனமயமாக்கல் நன்மை",
            Banking: "வங்கித் துறை - பொருளாதார வளர்ச்சியுடன் இணைந்த செயல்பாடு",
            Pharmaceuticals:
              "மருந்துத் துறை - நிலையான தேவை, ஆராய்ச்சி முதலீடு முக்கியம்",
            Energy: "எரிசக்தித் துறை - பொருட்களின் விலை ஏற்ற இறக்கம் பாதிப்பு",
            FMCG: "நுகர்வோர் பொருட்கள் - நிலையான தேவை, மக்கள்தொகை வளர்ச்சி நன்மை",
            Automobile: "வாகனத் துறை - பொருளாதார சுழற்சி சார்ந்த துறை",
          };
          return (
            sectorAnalysis[value] ||
            "இந்த தொழில்துறையின் சிறப்பு பண்புகளை ஆராயுங்கள்"
          );
        })(),
        inference:
          "தொழில்துறை செயல்திறன் ஒட்டுமொத்த பொருளாதாரம், அரசு கொள்கைகள் மற்றும் உலகளாவிய போக்குகளால் பாதிக்கப்படுகிறது.",
        tips: "• துறை வளர்ச்சி போக்குகளை ஆராயுங்கள்\n• அரசு கொள்கைகளின் தாக்கம்\n• உலகளாவிய போட்டி நிலவரம்\n• தொழில்நுட்ப மாற்றங்களின் பாதிப்பு",
      },
      "Face Value": {
        title: "முக மதிப்பு (Face Value)",
        definition:
          "பங்கு சான்றிதழில் அச்சிடப்பட்ட அசல் மதிப்பு. இது பங்கு பிரிப்பு மற்றும் டிவிடெண்ட் கணக்கீட்டிற்கு பயன்படுகிறது.",
        currentState: `முக மதிப்பு: ${value}`,
        analysis:
          "இந்தியாவில் பெரும்பாலான பங்குகளின் முக மதிப்பு ₹1, ₹2, ₹5 அல்லது ₹10 ஆக இருக்கும். இது சந்தை விலையை பாதிக்காது.",
        inference:
          "முக மதிப்பு முதலீட்டு முடிவுகளில் நேரடி பாதிப்பு இல்லை, ஆனால் நிறுவன கட்டமைப்பு மற்றும் டிவிடெண்ட் கணக்கீட்டில் பயன்படுகிறது.",
        tips: "• முக மதிப்பு vs சந்தை விலை வேறுபாடு\n• பங்கு பிரிப்பின் போது முக்கியம்\n• டிவிடெண்ட் கணக்கீட்டில் பயன்பாடு\n• நிறுவன கட்டமைப்பின் ஒரு பகுதி",
      },
    };

    return (
      explanations[type] || {
        title: "தகவல் கிடைக்கவில்லை",
        definition: "இந்த அளவுருவின் விளக்கம் தற்போது கிடைக்கவில்லை.",
        currentState: `மதிப்பு: ${value}`,
        analysis: "விரிவான பகுப்பாய்வு தற்போது கிடைக்கவில்லை.",
        inference: "மேலும் ஆராய்ச்சி தேவை.",
        tips: "நிதி ஆலோசகரை அணுகவும்.",
      }
    );
  };

  const explanation = getStatExplanation(statType, statValue, stockData);

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
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {explanation.title}
              </h2>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Definition */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  இது என்ன?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {explanation.definition}
                </p>
              </div>

              {/* Current State */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  தற்போதைய நிலவரம்
                </h3>
                <p className="text-blue-700 font-medium">
                  {explanation.currentState}
                </p>
              </div>

              {/* Analysis */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                  பகுப்பாய்வு
                </h3>
                <p className="text-green-700">{explanation.analysis}</p>
              </div>

              {/* Inference */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-800 mb-2 flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                  இதிலிருந்து என்ன புரியும்?
                </h3>
                <p className="text-purple-700">{explanation.inference}</p>
              </div>

              {/* Tips */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h3 className="text-lg font-semibold text-orange-800 mb-2 flex items-center">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mr-2"></div>
                  முக்கிய குறிப்புகள்
                </h3>
                <pre className="text-orange-700 text-sm whitespace-pre-line font-sans">
                  {explanation.tips}
                </pre>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <p className="text-xs text-gray-600 text-center">
                💡 இந்த தகவல்கள் கல்வி நோக்கத்திற்காக மட்டுமே. முதலீட்டு
                முடிவுகளுக்கு நிதி ஆலோசகரை அணுகவும்.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatsModal;
