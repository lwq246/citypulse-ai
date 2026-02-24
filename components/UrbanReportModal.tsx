'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Download, Loader2, X, Leaf, Target, TrendingUp } from 'lucide-react';
import { useCallback, useMemo, useEffect, useState } from 'react';
import type { UrbanReportJSON, MetricData } from '@/types/urbanReport';
import { generateReportPDF } from '@/utils/reportPDF';

interface UrbanReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: UrbanReportJSON | null;
  isLoading: boolean;
}

export default function UrbanReportModal({
  isOpen,
  onClose,
  report,
  isLoading,
}: UrbanReportModalProps) {
  // State to hold the safely formatted date strings
  const [formattedDate, setFormattedDate] = useState<string>('');

  // Handle proper localized date formatting to prevent hydration mismatch
  useEffect(() => {
    if (report?.generated_at) {
      try {
        const date = new Date(report.generated_at);
        const formatted = new Intl.DateTimeFormat('en-MY', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        }).format(date);
        setFormattedDate(formatted);
      } catch (error) {
        // Fallback if browser locale engine fails
        setFormattedDate(new Date(report.generated_at).toLocaleString());
      }
    }
  }, [report]);

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      Excellent: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Good: 'bg-green-100 text-green-800 border-green-200',
      Moderate: 'bg-amber-100 text-amber-800 border-amber-200',
      Poor: 'bg-orange-100 text-orange-800 border-orange-200',
      Critical: 'bg-red-100 text-red-800 border-red-200',
    };
    return colorMap[status] || colorMap['Moderate'];
  };

  const getProgressColor = (status: string) => {
    const colorMap: Record<string, string> = {
      Excellent: 'bg-emerald-500',
      Good: 'bg-green-500',
      Moderate: 'bg-amber-500',
      Poor: 'bg-orange-500',
      Critical: 'bg-red-500',
    };
    return colorMap[status] || colorMap['Moderate'];
  };

  const handleDownloadPDF = useCallback(() => {
    if (report) {
      generateReportPDF(report);
    }
  }, [report]);

  const sortedMetrics = useMemo(() => {
    if (!report) return [];
    return [...report.key_metrics].sort((a, b) => {
      const severity: Record<string, number> = {
        Critical: 5,
        Poor: 4,
        Moderate: 3,
        Good: 2,
        Excellent: 1,
      };
      return (severity[b.status] || 0) - (severity[a.status] || 0);
    });
  }, [report]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - High Z-index to cover maps and UI */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0B1211]/80 backdrop-blur-md z-[9990]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
          >
            <div className="w-full max-w-5xl max-h-[90vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col pointer-events-auto border border-gray-100">
              {/* Header */}
              <div className="flex items-center justify-between p-6 sm:px-8 border-b border-gray-100 bg-gray-50/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#06D6A0]/10 flex items-center justify-center">
                    <Target className="text-[#06D6A0] w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                      Urban Intelligence Briefing
                    </h2>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5">
                      System Generated Report
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200/50 rounded-full text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 no-scrollbar p-6 sm:p-8">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full py-20">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 border-4 border-[#06D6A0]/20 rounded-full animate-pulse" />
                      <Loader2 className="w-8 h-8 text-[#06D6A0] animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-gray-800 font-bold text-lg mb-2">
                      Synthesizing Urban Data
                    </p>
                    <p className="text-gray-500 text-sm max-w-sm text-center">
                      Our AI engine is currently analyzing walkability, canopy
                      coverage, and environmental patterns...
                    </p>
                  </div>
                ) : report ? (
                  <div className="space-y-10">
                    {/* Top Title & Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="col-span-1 lg:col-span-2">
                        <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">
                          {report.location_name}
                        </h3>
                        <p className="text-sm text-gray-400 font-mono mb-6">
                          Generated on {formattedDate || 'Loading date...'}
                        </p>
                        <div className="prose prose-sm sm:prose-base text-gray-600 leading-relaxed">
                          <p className="text-lg font-medium text-gray-800 mb-2">
                            Executive Summary
                          </p>
                          <p>{report.executive_summary}</p>
                        </div>
                      </div>
                      <div className="col-span-1 bg-gray-50 rounded-3xl p-6 border border-gray-100 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-3">
                          <Leaf className="text-[#06D6A0] w-5 h-5" />
                          <h4 className="font-bold text-gray-900">
                            Environmental Insights
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {report.environmental_insights}
                        </p>
                      </div>
                    </div>

                    {/* Dashboard Metric Cards */}
                    <div>
                      <div className="flex items-center gap-2 mb-5">
                        <TrendingUp className="text-gray-400 w-5 h-5" />
                        <h4 className="text-lg font-bold text-gray-900">
                          Key Performance Indicators
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedMetrics.map(
                          (metric: MetricData, index: number) => {
                            const isCritical =
                              metric.status === 'Critical' ||
                              metric.status === 'Poor';
                            const maxVal = metric.unit.includes('°C')
                              ? 50
                              : metric.unit.includes('AQI')
                                ? 500
                                : 100;
                            const percentage = Math.min(
                              (metric.value / maxVal) * 100,
                              100,
                            );

                            return (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative overflow-hidden p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all group flex flex-col"
                              >
                                {/* Metric Header */}
                                <div className="flex items-start justify-between mb-4">
                                  <h5 className="font-bold text-gray-700 text-sm pr-2 leading-tight">
                                    {metric.label}
                                  </h5>
                                  <span
                                    className={`text-[10px] shrink-0 font-black px-2.5 py-1 rounded-md uppercase tracking-wider border ${getStatusColor(metric.status)}`}
                                  >
                                    {metric.status}
                                  </span>
                                </div>

                                {/* Value Display */}
                                <div className="flex items-baseline gap-1 mb-4">
                                  <span
                                    className={`text-3xl font-black tracking-tighter ${isCritical ? 'text-red-500' : 'text-gray-900'}`}
                                  >
                                    {metric.value}
                                  </span>
                                  <span className="text-xs font-bold text-gray-400">
                                    {metric.unit}
                                  </span>
                                </div>

                                {/* Linear Progress Bar */}
                                <div className="w-full mt-auto bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{
                                      duration: 1,
                                      delay: 0.2 + index * 0.1,
                                      ease: 'easeOut',
                                    }}
                                    className={`h-full ${getProgressColor(metric.status)} rounded-full`}
                                  />
                                </div>

                                {/* Description */}
                                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                                  {metric.description}
                                </p>
                              </motion.div>
                            );
                          },
                        )}
                      </div>
                    </div>

                    {/* Recommendations List */}
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-5">
                        Actionable Recommendations
                      </h4>
                      <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {report.recommendations.map(
                          (recommendation: string, index: number) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + index * 0.1 }}
                              className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100"
                            >
                              <span className="flex-shrink-0 w-8 h-8 bg-[#06D6A0]/10 text-[#06D6A0] rounded-full flex items-center justify-center font-black text-sm">
                                {index + 1}
                              </span>
                              <p className="text-sm text-gray-700 font-medium leading-relaxed pt-1.5">
                                {recommendation}
                              </p>
                            </motion.li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 font-medium">
                    No report data available.
                  </div>
                )}
              </div>

              {/* Footer */}
              {report && !isLoading && (
                <div className="flex justify-between items-center p-6 border-t border-gray-100 bg-white shrink-0">
                  <p className="text-xs text-gray-400 font-mono hidden sm:block tracking-wider">
                    Powered by CityPulse AI
                  </p>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      onClick={onClose}
                      className="flex-1 sm:flex-none px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-bold text-sm transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="flex-1 sm:flex-none px-6 py-3 bg-[#06D6A0] text-[#0B1211] rounded-xl hover:brightness-110 font-black text-sm uppercase tracking-wider transition-all shadow-[0_4px_20px_rgba(6,214,160,0.3)] flex items-center justify-center gap-2"
                    >
                      <Download size={18} strokeWidth={2.5} />
                      Download PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
