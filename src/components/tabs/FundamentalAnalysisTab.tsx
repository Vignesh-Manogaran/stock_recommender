import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Users,
  Building,
  AlertTriangle,
  Target,
  FileText,
  Briefcase,
  Shield,
  Activity,
} from "lucide-react";
import { DetailedStockAnalysis, HealthStatus } from "@/types";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";

interface FundamentalAnalysisTabProps {
  stockAnalysis: DetailedStockAnalysis;
  getHealthColor: (health: HealthStatus) => string;
}

const FundamentalAnalysisTab: React.FC<FundamentalAnalysisTabProps> = ({
  stockAnalysis,
  getHealthColor,
}) => {
  // Helper function to get health icon
  const getHealthIcon = (health: HealthStatus) => {
    switch (health) {
      case HealthStatus.BEST:
      case HealthStatus.GOOD:
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case HealthStatus.NORMAL:
        return <Activity className="w-4 h-4 text-gray-600" />;
      case HealthStatus.BAD:
      case HealthStatus.WORSE:
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  // Format percentage
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Format number with commas
  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  return (
    <div className="space-y-8">
      {/* 1. Financial Statements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader
            title="Financial Statements"
            action={<FileText className="w-6 h-6 text-blue-600" />}
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Income Statement */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                    Income Statement
                  </h4>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${getHealthColor(
                      stockAnalysis.financialHealth.statements.incomeStatement
                    )}`}
                  >
                    {stockAnalysis.financialHealth.statements.incomeStatement}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue Growth</span>
                    <span className="font-medium text-gray-900">
                      {formatPercent(
                        stockAnalysis.financialHealth.growth[
                          "Revenue CAGR (3Y)"
                        ].value
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Net Profit Margin</span>
                    <span className="font-medium text-gray-900">
                      {formatPercent(
                        stockAnalysis.financialHealth.profitability[
                          "Net Margin"
                        ].value
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Operating Margin</span>
                    <span className="font-medium text-gray-900">
                      {formatPercent(
                        stockAnalysis.financialHealth.profitability[
                          "Operating Margin"
                        ].value
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Balance Sheet */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                    <Building className="w-4 h-4 text-blue-600 mr-2" />
                    Balance Sheet
                  </h4>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${getHealthColor(
                      stockAnalysis.financialHealth.statements.balanceSheet
                    )}`}
                  >
                    {stockAnalysis.financialHealth.statements.balanceSheet}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Debt-to-Equity</span>
                    <span className="font-medium text-gray-900">
                      {stockAnalysis.financialHealth.liquidity[
                        "Debt-to-Equity"
                      ].value.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Ratio</span>
                    <span className="font-medium text-gray-900">
                      {stockAnalysis.financialHealth.liquidity[
                        "Current Ratio"
                      ].value.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Working Capital</span>
                    <span className="font-medium text-gray-900">Strong</span>
                  </div>
                </div>
              </div>

              {/* Cash Flow */}
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                    <DollarSign className="w-4 h-4 text-purple-600 mr-2" />
                    Cash Flow Statement
                  </h4>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${getHealthColor(
                      stockAnalysis.financialHealth.statements.cashFlow
                    )}`}
                  >
                    {stockAnalysis.financialHealth.statements.cashFlow}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Operating Cash Flow</span>
                    <span className="font-medium text-green-600">Strong</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Free Cash Flow</span>
                    <span className="font-medium text-green-600">Positive</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capex Trends</span>
                    <span className="font-medium text-gray-900">Stable</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 2. Profitability Ratios */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader
            title="Profitability Ratios"
            action={<TrendingUp className="w-6 h-6 text-green-600" />}
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stockAnalysis.financialHealth.profitability).map(
                ([key, metric]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {key}
                      </h4>
                      {getHealthIcon(metric.health)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {key.includes("Margin") ||
                        key === "ROE" ||
                        key === "ROA" ||
                        key === "ROCE"
                          ? formatPercent(metric.value)
                          : metric.value.toFixed(1)}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getHealthColor(
                          metric.health
                        )}`}
                      >
                        {metric.health}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 3. Liquidity & Solvency Ratios */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader
            title="Liquidity & Solvency Ratios"
            action={<Shield className="w-6 h-6 text-blue-600" />}
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(stockAnalysis.financialHealth.liquidity).map(
                ([key, metric]) => (
                  <div
                    key={key}
                    className="bg-blue-50 rounded-lg p-4 border border-blue-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {key}
                      </h4>
                      {getHealthIcon(metric.health)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-blue-600">
                        {metric.value.toFixed(1)}
                        {key === "Interest Coverage" ? "x" : ""}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getHealthColor(
                          metric.health
                        )}`}
                      >
                        {metric.health}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 4. Valuation Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader
            title="Valuation Metrics"
            action={<BarChart3 className="w-6 h-6 text-purple-600" />}
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(stockAnalysis.financialHealth.valuation).map(
                ([key, metric]) => (
                  <div
                    key={key}
                    className="bg-purple-50 rounded-lg p-4 border border-purple-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {key}
                      </h4>
                      {getHealthIcon(metric.health)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-purple-600">
                        {key === "Dividend Yield"
                          ? formatPercent(metric.value)
                          : metric.value.toFixed(1)}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getHealthColor(
                          metric.health
                        )}`}
                      >
                        {metric.health}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 5. Growth Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader
            title="Growth Indicators"
            action={<TrendingUp className="w-6 h-6 text-green-600" />}
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(stockAnalysis.financialHealth.growth).map(
                ([key, metric]) => (
                  <div
                    key={key}
                    className="bg-green-50 rounded-lg p-4 border border-green-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {key}
                      </h4>
                      {getHealthIcon(metric.health)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">
                        {formatPercent(metric.value)}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getHealthColor(
                          metric.health
                        )}`}
                      >
                        {metric.health}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {key.includes("CAGR")
                        ? "3-Year Compound Annual Growth"
                        : "Year-over-Year Growth"}
                    </p>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 6. Industry & Competitive Position */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader
              title="Industry Position"
              action={<Briefcase className="w-6 h-6 text-indigo-600" />}
            />
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">
                    Industry Health
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${getHealthColor(
                      stockAnalysis.financialHealth.industry
                    )}`}
                  >
                    {stockAnalysis.financialHealth.industry}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Growth Potential
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      High
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Entry Barriers
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      Strong
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Competitive Moat
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      Brand & Technology
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Market Position
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      Market Leader
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Management Quality"
              action={<Users className="w-6 h-6 text-orange-600" />}
            />
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">
                    Overall Rating
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${getHealthColor(
                      stockAnalysis.financialHealth.management
                    )}`}
                  >
                    {stockAnalysis.financialHealth.management}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Promoter Holding
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      68.5%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pledge Status</span>
                    <span className="text-sm font-medium text-green-600">
                      No Pledge
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Track Record</span>
                    <span className="text-sm font-medium text-green-600">
                      Excellent
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Governance</span>
                    <span className="text-sm font-medium text-green-600">
                      Strong
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* 7. Economic & Market Factors + Risk Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader
              title="Risk Analysis"
              action={<AlertTriangle className="w-6 h-6 text-red-600" />}
            />
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">
                    Overall Risk
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${getHealthColor(
                      stockAnalysis.financialHealth.risks
                    )}`}
                  >
                    {stockAnalysis.financialHealth.risks}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Debt Burden</span>
                    <span className="text-sm font-medium text-green-600">
                      Low
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Customer Concentration
                    </span>
                    <span className="text-sm font-medium text-yellow-600">
                      Moderate
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Raw Material Risk
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      Low
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Regulatory Risk
                    </span>
                    <span className="text-sm font-medium text-yellow-600">
                      Moderate
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Future Outlook"
              action={<Target className="w-6 h-6 text-blue-600" />}
            />
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">
                    Outlook Rating
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${getHealthColor(
                      stockAnalysis.financialHealth.outlook
                    )}`}
                  >
                    {stockAnalysis.financialHealth.outlook}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Revenue Guidance
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      15-20% YoY
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Analyst Consensus
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      Strong Buy
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Upcoming Catalysts
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      New Product Launch
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Market Expansion
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      International
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default FundamentalAnalysisTab;
