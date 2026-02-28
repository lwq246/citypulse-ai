"use client";

import { Sun, Thermometer, Wind } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full bg-transparent text-white font-sans selection:bg-primary selection:text-black overflow-x-hidden">
      {/* --- FIXED BACKGROUND SECTION --- */}
      <div className="fixed top-0 left-0 w-full h-full -z-50">
        {/* NEW BACKGROUND: A dark, moody Kuala Lumpur skyline with Petronas Towers */}
        <img
          src="\images\Twin_Tower.jpg"
          alt="Kuala Lumpur Skyline"
          className="w-full h-full object-cover object-[center_10%] opacity-40 blur-[2px] scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1211]/30 via-[#0B1211]/80 to-[#0B1211]" />
      </div>

      {/* 1. NAVBAR */}
      <nav className="flex items-center justify-between px-10 py-6 border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-[#0B1211] rounded-full rotate-45" />
          </div>
          <span className="font-bold tracking-tighter text-xl italic">
            CITYPULSE<span className="text-primary"> AI</span>
          </span>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-24 pb-32 px-6 flex flex-col items-center text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px] rounded-full -z-10" />

        <h1 className="text-5xl md:text-7xl font-bold max-w-4xl leading-tight tracking-tighter drop-shadow-2xl">
          AI-Powered Intelligence for a <br />
          <span className="text-primary">Sustainable, Resilient</span> City
          <br /> Kuala Lumpur
        </h1>
        <p className="mt-6 text-gray-300 max-w-2xl text-lg leading-relaxed drop-shadow-md">
          Deploying an <b>AI-powered Digital Twin</b> to combat the urban heat
          island effect and mitigate flood risks through high-fidelity
          geospatial intelligence and <b>Gemini 2.5 Flash Lite</b> multimodal
          audits.
        </p>

        {/* CTA Button */}
        <Link href="/dashboard" className="mt-12 group">
          <div className="bg-primary text-[#0B1211] font-black px-12 py-6 rounded-full text-2xl shadow-[0_0_50px_rgba(6,214,160,0.3)] hover:shadow-primary/60 transition-all active:scale-95">
            Start Exploring
          </div>
          <p className="text-[10px] text-gray-400 mt-4 tracking-[0.3em] font-bold uppercase drop-shadow-md">
            No account required to visualize
          </p>
        </Link>
      </section>

      {/* 3. FEATURE CARDS */}
      <section className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 mb-40 relative z-10">
        <FeatureCard
          icon={<Thermometer className="text-[#06D6A0]" />}
          title="Thermal Pulse"
          desc="Visualizing the Urban Heat Island effect through 144-node high-resolution topographical grid scans and real-time Google Weather baseline data."
          linkText="Explore Heatmaps"
        />

        {/* 2. SOLAR GOLDMINE CARD */}
        <FeatureCard
          icon={<Sun className="text-yellow-400" />}
          title="Solar Goldmine"
          desc="Identifying high-potential rooftops using the Google Solar API to provide precise architectural audits and RM savings projections."
          linkText="Analyze Savings"
        />

        {/* 3. FLOOD GUARDIAN CARD */}
        <FeatureCard
          icon={<Wind className="text-blue-400" />} // Using Wind or Waves icon
          title="Flood Guardian"
          desc="Predicting hydrological pooling risks by correlating topographical basin analysis with live precipitation probability data."
          linkText="Assess Risk"
        />
      </section>

      {/* 4. QUICK JUMP HOTSPOTS */}
      <section className="pb-40 relative z-10">
        <h3 className="text-center text-xs font-bold tracking-[0.3em] text-gray-500 uppercase mb-12">
          Hotspots
        </h3>
        <div className="flex justify-center gap-6 overflow-x-auto px-10 no-scrollbar">
          {/* NEW: KLCC Park (Greenery/Trees) */}
          <HotspotImage
            name="KLCC Park Area"
            url="/images/KLCC_Park_Area.jpg"
          />
          {/* NEW: Bukit Bintang (Busy Crossing) */}
          <HotspotImage name="Bukit Bintang" url="/images/Bukit_Bintang.jpg" />
          {/* NEW: Merdeka 118 (Skyscraper) */}
          <HotspotImage
            name="Merdeka 118 District"
            url="/images/Merdeka_118_District.jpg"
          />
          {/* NEW: Putrajaya (Bridge/Architecture) */}
          <HotspotImage name="Batu Caves" url="/images/Batu_Caves.jpg" />
        </div>
      </section>

      {/* 5. DATA INTEGRATION SECTION */}
      <section className="max-w-7xl mx-auto px-10 pb-40 grid md:grid-cols-2 gap-24 items-center relative z-10">
        <div>
          <h2 className="text-5xl font-bold leading-tight tracking-tighter italic drop-shadow-xl">
            High-Fidelity Data Synthesis
          </h2>
          <p className="mt-8 text-gray-400 text-lg leading-relaxed">
            Our engine synthesizes real-time{" "}
            <b>Google Environmental telemetry</b>, high-resolution{" "}
            <b>3D topography</b>, and{" "}
            <b>Gemini 2.5 Flash Lite vision analysis</b> to map the invisible
            micro-climates of Kuala Lumpur with street-level precision.
          </p>
          <div className="mt-12 flex gap-12">
            <div>
              <h4 className="text-primary text-4xl font-bold tracking-tighter">
                144-Node
              </h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">
                Grid Scan Resolution
              </p>
            </div>
            <div>
              <h4 className="text-primary text-4xl font-bold tracking-tighter">
                6.4 km
              </h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">
                AI Audit Radius
              </p>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-primary/20 rounded-[40px] blur-2xl group-hover:bg-primary/30 transition-all duration-500" />
          <div className="relative bg-[#0B1211]/40 border border-white/10 rounded-[40px] p-4 overflow-hidden h-[450px] flex items-center justify-center backdrop-blur-md">
            <div className="absolute top-6 left-6 bg-primary text-[#0B1211] font-black text-[10px] px-4 py-1.5 rounded-full flex items-center gap-2 z-10 shadow-lg">
              <div className="w-2 h-2 bg-[#0B1211] rounded-full animate-pulse" />
              LIVE HEATMAP
            </div>
            {/* Abstract Heatmap Graphic (Placeholder art is okay here, but swapped for a techy abstract one) */}
            <img
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800"
              className="opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-1000 scale-150 object-cover w-full h-full"
              alt="Heatmap preview"
            />
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="border-t border-white/5 py-16 px-10 flex flex-col md:flex-row justify-between items-center text-gray-500 text-[10px] gap-8 relative z-10 bg-[#0B1211]/80 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary/50 rounded flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-[#0B1211] rounded-full" />
          </div>
          <span className="font-bold text-white text-lg tracking-tighter italic">
            CITYPULSE<span className="text-primary"> AI</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function FeatureCard({
  icon,
  title,
  desc,
  linkText,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  linkText: string;
}) {
  return (
    <div className="bg-[#0B1211]/40 border border-white/5 p-10 rounded-[45px] backdrop-blur-md hover:border-primary/30 hover:bg-[#0B1211]/60 transition-all duration-500 group relative overflow-hidden">
      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/5">
        {icon}
      </div>
      <h3 className="text-3xl font-bold mb-4 tracking-tight">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-10">{desc}</p>
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 opacity-50" />
    </div>
  );
}

function HotspotImage({ name, url }: { name: string; url: string }) {
  return (
    <div className="flex-shrink-0 group cursor-pointer">
      <div className="w-72 h-44 rounded-[32px] overflow-hidden mb-4 border border-white/10 group-hover:border-primary/50 transition-all duration-500 shadow-xl">
        <img
          src={url}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 opacity-60 group-hover:opacity-100 grayscale-[50%] group-hover:grayscale-0"
        />
      </div>
      <p className="text-center text-[10px] font-bold text-gray-500 group-hover:text-primary transition-colors tracking-[0.2em] uppercase">
        {name}
      </p>
    </div>
  );
}
