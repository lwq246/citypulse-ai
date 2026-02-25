'use client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Footprints,
  MapPin,
  Sparkles,
  X,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import UrbanReportModal from '@/components/UrbanReportModal';
import type { UrbanReportJSON } from '@/types/urbanReport';

interface AIAnalysisPanelProps {
  data: {
    walkabilityScore: number;
    shadeScore: number;
    summary: string;
    recommendation: string;
  };
  locationName: string;
  lat: number;
  lng: number;
  activeLayer: string;
  onClose: () => void;
  envData?: { aqi?: number; temp?: number };
  solarData?: { potential?: string };
  floodData?: { riskLevel?: string };
}

export default function AIAnalysisPanel({
  data,
  locationName,
  lat,
  lng,
  activeLayer,
  onClose,
  envData,
  solarData,
  floodData,
}: AIAnalysisPanelProps) {
  if (!data) return null;

  const [isReportLoading, setIsReportLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [generatedReport, setGeneratedReport] =
    useState<UrbanReportJSON | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadingSteps = [
    'Initiating AI Engine...',
    'Synthesizing Environmental Data...',
    'Evaluating Walkability & Canopy...',
    'Drafting Executive Summary...',
    'Finalizing PDF Report...',
  ];

  useEffect(() => {
    if (!isReportLoading) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) =>
        prev < loadingSteps.length - 1 ? prev + 1 : prev,
      );
    }, 1500);
    return () => clearInterval(interval);
  }, [isReportLoading]);

  const handleGenerateReport = async () => {
    setIsReportLoading(true);
    setErrorMsg(null);
    setLoadingStep(0);

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName,
          lat,
          lng,
          walkabilityScore: data.walkabilityScore,
          shadeScore: data.shadeScore,
          aqi: envData?.aqi || 0,
          temp: envData?.temp || 0,
          solarPotential: solarData?.potential || 'Unknown',
          floodRiskLevel: floodData?.riskLevel || 'Unknown',
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setGeneratedReport(result.data);
        setShowReportModal(true);
      } else {
        setErrorMsg(
          result.error || 'Engine failure: Could not generate report',
        );
      }
    } catch (error) {
      console.error('Report generation error:', error);
      setErrorMsg('Network error: Failed to connect to AI engine');
    } finally {
      setIsReportLoading(false);
    }
  };

  const walkScore = Number(data.walkabilityScore) || 0;
  const shadeScore = Number(data.shadeScore) || 0;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (walkScore / 100) * circumference;

  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x450&location=${lat},${lng}&fov=90&heading=235&pitch=10&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
  const satelliteUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=18&size=800x450&maptype=satellite&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;

  // Wrap the entire return in a Fragment to decouple the Modal from the Sidebar's transform CSS
  return (
    <>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-[420px] bg-[#0B1211]/98 backdrop-blur-3xl border-l border-white/10 z-[100] shadow-[-20px_0_80px_rgba(0,0,0,0.8)] flex flex-col p-8 overflow-y-auto pointer-events-auto no-scrollbar"
      >
        {/* 1. HEADER */}
        <div className="flex justify-between items-start mb-6 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#06D6A0] rounded-full animate-pulse shadow-[0_0_8px_#06D6A0]" />
            <span className="text-[10px] font-bold text-[#06D6A0] tracking-[0.2em] uppercase italic">
              Live Analysis 
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <h2 className="text-3xl font-bold text-white mb-1 leading-tight tracking-tight shrink-0">
          {locationName}
        </h2>
        <div className="flex items-center gap-2 text-gray-500 font-mono text-[10px] mb-8 shrink-0">
          <MapPin size={10} className="text-[#06D6A0]" />
          <span>
            {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
          </span>
        </div>

        {/* 2. VISUAL DATA FEEDS */}
        <div className="flex gap-3 mb-8 shrink-0 mx-auto w-[356px]">
          {/* Satellite Image */}
          <div className="relative flex-1 h-[200px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
            <img
              src={satelliteUrl}
              alt="Satellite View"
              className="w-full h-full object-cover brightness-90"
            />
            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-md text-[7px] font-mono text-gray-300 border border-white/10 tracking-widest uppercase">
              Sat_Feed // Live
            </div>
          </div>

          {/* Street View Image */}
          <div className="relative flex-1 h-[200px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
            <img
              src={streetViewUrl}
              alt="Street View"
              className="w-full h-full object-cover grayscale-[15%] brightness-90"
            />
            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-md text-[7px] font-mono text-gray-300 border border-white/10 tracking-widest uppercase">
              Street_Cam // Live
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex gap-2 mb-8 shrink-0 px-2">
          <div className="bg-[#06D6A0] text-[#0B1211] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
            <CheckCircle2 size={12} strokeWidth={3} />
            <span className="text-[9px] font-black uppercase tracking-wider">
              {shadeScore > 40 ? 'Vegetation Detected' : 'Low Canopy Density'}
            </span>
          </div>
          <div className="bg-[#1A1A1A]/80 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/10 shadow-lg">
            <AlertTriangle size={12} className="text-yellow-500" />
            <span className="text-[9px] font-bold uppercase tracking-wider">
              Heat Mass: {walkScore < 50 ? 'High' : 'Optimal'}
            </span>
          </div>
        </div>

        {/* 3. GEMINI AI SYNTHESIS */}
        <div className="bg-white/[0.03] rounded-[2.5rem] border border-white/5 p-7 mb-8 relative flex flex-col gap-4 min-h-fit overflow-visible group hover:border-[#06D6A0]/30 transition-all duration-500">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#06D6A0]" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Gemini AI Synthesis
            </span>
          </div>
          <p className="text-[13px] text-gray-100 leading-[1.6] font-medium italic">
            {data.summary
              ? `"${data.summary}"`
              : 'Generating neighborhood impact summary...'}
          </p>
          <div className="bg-[#06D6A0]/10 p-3.5 rounded-2xl border border-[#06D6A0]/20 mt-2">
            <span className="text-[#06D6A0] uppercase font-bold text-[9px] tracking-[0.1em] block mb-1">
              Recommended Mitigation:
            </span>
            <p className="text-[11px] text-white leading-[1.5]">
              {data.recommendation || 'Analyzing urban design fixes...'}
            </p>
          </div>
        </div>

        {/* 4. SCORECARD SECTION */}
        <div className="flex justify-between items-center mb-6 shrink-0 px-2">
          <div className="flex items-center gap-2 text-gray-500">
            <Footprints size={14} />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
              Walkability Index
            </span>
          </div>
          <span
            className={`text-[9px] font-black px-3 py-1 rounded-md border uppercase tracking-widest ${walkScore > 70 ? 'bg-green-500/10 text-[#06D6A0] border-[#06D6A0]/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}
          >
            {walkScore > 70
              ? 'Excellent'
              : walkScore > 40
                ? 'Moderate'
                : 'Critical'}
          </span>
        </div>

        <div className="flex justify-center mb-8 relative shrink-0">
          <svg className="w-36 h-36 -rotate-90">
            <circle
              cx="72"
              cy="72"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="7"
              className="text-white/5"
            />
            <motion.circle
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 2, ease: 'circOut' }}
              cx="72"
              cy="72"
              r={radius}
              fill="transparent"
              stroke="#06D6A0"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeLinecap="round"
              className="drop-shadow-[0_0_12px_rgba(6,214,160,0.5)]"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white tracking-tighter">
              {walkScore}
            </span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Points
            </span>
          </div>
        </div>

        {/* 5. DYNAMIC BUTTONS AREA */}
        <div className="mt-auto shrink-0 mb-4 flex flex-col gap-3">
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs"
              >
                <AlertTriangle size={14} />
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {generatedReport ? (
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setShowReportModal(true)}
                className="flex-1 bg-[#06D6A0] text-[#0B1211] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,214,160,0.2)]"
              >
                <FileText size={16} />
                Open Report
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={isReportLoading}
                className="flex-1 bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isReportLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                Regenerate
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerateReport}
              disabled={isReportLoading}
              className="w-full relative overflow-hidden bg-[#06D6A0] text-[#0B1211] py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(6,214,160,0.3)] group disabled:opacity-90 disabled:cursor-wait"
            >
              {isReportLoading ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Generating</span>
                  </div>
                  <span className="text-[9px] text-[#0B1211]/70 tracking-widest absolute bottom-2">
                    {loadingSteps[loadingStep]}
                  </span>
                </div>
              ) : (
                <>
                  <FileText size={18} />
                  Generate Full Report
                </>
              )}
            </button>
          )}
        </div>

        <p
          suppressHydrationWarning
          className="text-[8px] text-gray-600 font-mono text-center uppercase tracking-widest opacity-40 shrink-0"
        >
          Engine v4.0.21 // {new Date().toLocaleTimeString()} MYT
        </p>
      </motion.div>

      {/* MODAL IS NOW OUTSIDE THE SIDEBAR SO IT CAN RENDER FULL SCREEN PROPERLY */}
      <UrbanReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        report={generatedReport}
        isLoading={isReportLoading}
      />
    </>
  );
}
