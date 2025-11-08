"use client";

import { useState, useEffect, useCallback } from "react";

interface PipelineData {
  stage: string;
  count: number;
  totalValue: number;
  weightedValue: number;
  opportunities: Array<{
    id: string;
    title: string;
    value: number;
    probability: number;
    customer: {
      firstName: string;
      lastName: string;
      company?: string;
    };
  }>;
}

interface PipelineMetrics {
  totalOpportunities: number;
  activeOpportunities: number;
  wonOpportunities: number;
  lostOpportunities: number;
  totalPipelineValue: number;
  weightedPipelineValue: number;
  averageDealSize: number;
  winRate: number;
  lossRate: number;
  salesVelocity: number;
}

interface SalesPipelineProps {
  locale: string;
}

export default function SalesPipeline({}: SalesPipelineProps) {
  const [pipelineData, setPipelineData] = useState<PipelineData[]>([]);
  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("30");

  const fetchPipelineData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/crm/opportunities/pipeline?period=${period}`);
      const result = await response.json();
      
      if (result.success) {
        setPipelineData(result.data.pipeline);
        setMetrics(result.data.metrics);
      } else {
        setError(result.error || "خطا در بارگذاری داده‌های پipeline");
      }
    } catch (error) {
      console.error("Error fetching pipeline data:", error);
      setError("خطا در بارگذاری داده‌های pipeline");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchPipelineData();
  }, [fetchPipelineData]);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "PROSPECTING": return "from-blue-500/20 to-blue-600/20 border-blue-500/30";
      case "QUALIFICATION": return "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30";
      case "PROPOSAL": return "from-purple-500/20 to-purple-600/20 border-purple-500/30";
      case "NEGOTIATION": return "from-orange-500/20 to-orange-600/20 border-orange-500/30";
      case "CLOSED_WON": return "from-green-500/20 to-green-600/20 border-green-500/30";
      case "CLOSED_LOST": return "from-red-500/20 to-red-600/20 border-red-500/30";
      default: return "from-gray-500/20 to-gray-600/20 border-gray-500/30";
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case "PROSPECTING": return "پیش‌فروش";
      case "QUALIFICATION": return "صلاحیت‌سنجی";
      case "PROPOSAL": return "پیشنهاد";
      case "NEGOTIATION": return "مذاکره";
      case "CLOSED_WON": return "بسته شده (موفق)";
      case "CLOSED_LOST": return "بسته شده (ناموفق)";
      default: return stage;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <div className="text-white">در حال بارگذاری pipeline فروش...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <div className="text-red-400 mb-4">{error}</div>
        <button
          onClick={fetchPipelineData}
          className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-primary-orange-dark transition-colors"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Header */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Pipeline فروش</h2>
          <div className="flex items-center space-x-4 space-x-reverse">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
            >
              <option value="7">7 روز گذشته</option>
              <option value="30">30 روز گذشته</option>
              <option value="90">90 روز گذشته</option>
              <option value="365">یک سال گذشته</option>
            </select>
            <button
              onClick={fetchPipelineData}
              className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-primary-orange-dark transition-colors"
            >
              به‌روزرسانی
            </button>
          </div>
        </div>

        {/* Pipeline Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{metrics.totalOpportunities}</div>
              <div className="text-gray-400 text-sm">کل فرصت‌ها</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-400">{metrics.wonOpportunities}</div>
              <div className="text-gray-400 text-sm">موفق</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{formatCurrency(metrics.totalPipelineValue)}</div>
              <div className="text-gray-400 text-sm">ارزش کل Pipeline</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-primary-orange">{formatCurrency(metrics.weightedPipelineValue)}</div>
              <div className="text-gray-400 text-sm">ارزش وزن‌دار</div>
            </div>
          </div>
        )}
      </div>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {pipelineData.map((stage) => (
          <div
            key={stage.stage}
            className={`glass rounded-3xl p-6 bg-gradient-to-br ${getStageColor(stage.stage)} border`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{getStageLabel(stage.stage)}</h3>
              <div className="text-right">
                <div className="text-xl font-bold text-white">{stage.count}</div>
                <div className="text-gray-400 text-sm">فرصت</div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">ارزش کل:</span>
                <span className="text-white">{formatCurrency(stage.totalValue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">ارزش وزن‌دار:</span>
                <span className="text-primary-orange">{formatCurrency(stage.weightedValue)}</span>
              </div>
            </div>

            {/* Stage Opportunities */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stage.opportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="text-white font-medium text-sm mb-1">{opportunity.title}</div>
                  <div className="text-gray-400 text-xs mb-1">
                    {opportunity.customer.firstName} {opportunity.customer.lastName}
                    {opportunity.customer.company && ` - ${opportunity.customer.company}`}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white">{formatCurrency(opportunity.value)}</span>
                    <span className="text-primary-orange">{opportunity.probability}%</span>
                  </div>
                </div>
              ))}
            </div>

            {stage.opportunities.length === 0 && (
              <div className="text-gray-400 text-sm text-center py-4">
                هیچ فرصتی در این مرحله وجود ندارد
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Additional Metrics */}
      {metrics && (
        <div className="glass rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">آمار تکمیلی</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{metrics.winRate.toFixed(1)}%</div>
              <div className="text-gray-400 text-sm">نرخ موفقیت</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{metrics.lossRate.toFixed(1)}%</div>
              <div className="text-gray-400 text-sm">نرخ شکست</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{formatCurrency(metrics.averageDealSize)}</div>
              <div className="text-gray-400 text-sm">میانگین اندازه معامله</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-orange">{formatCurrency(metrics.salesVelocity)}</div>
              <div className="text-gray-400 text-sm">سرعت فروش (روزانه)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
