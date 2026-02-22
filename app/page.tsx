"use client";

import {
  ArrowRight,
  Globe,
  Heart,
  LayoutGrid,
  Mail,
  Search,
  Thermometer,
  Wind,
} from "lucide-react";
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
            COOLER<span className="text-primary">KL</span>
          </span>
        </div>

        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <Link href="#" className="hover:text-primary transition-colors">
            Mission
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            Data Layers
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            Partners
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            Case Studies
          </Link>
        </div>

        <div className="flex gap-4">
          <button className="px-5 py-2 text-sm font-medium border border-white/10 rounded-full hover:bg-white/5 transition-all">
            Log In
          </button>
          <Link
            href="/dashboard"
            className="px-5 py-2 text-sm font-bold bg-primary text-[#0B1211] rounded-full hover:scale-105 shadow-[0_0_20px_rgba(6,214,160,0.4)] transition-all"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-24 pb-32 px-6 flex flex-col items-center text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px] rounded-full -z-10" />

        <h1 className="text-5xl md:text-7xl font-bold max-w-4xl leading-tight tracking-tighter drop-shadow-2xl">
          Visualizing a <span className="text-primary">Cooler, Greener</span>{" "}
          <br /> Kuala Lumpur
        </h1>
        <p className="mt-6 text-gray-300 max-w-2xl text-lg leading-relaxed drop-shadow-md">
          Harnessing data-driven urban planning to combat the heat island effect
          and improve city livability through immersive spatial intelligence.
        </p>

        {/* Search Bar */}
        <div className="mt-12 w-full max-w-2xl relative flex items-center group">
          <Search
            className="absolute left-6 text-gray-500 group-focus-within:text-primary transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Search a neighborhood or landmark in KL..."
            className="w-full bg-[#0B1211]/60 border border-white/10 rounded-full py-5 pl-14 pr-36 outline-none focus:border-primary/50 transition-all text-lg backdrop-blur-xl shadow-2xl"
          />
          <button className="absolute right-2 bg-primary text-[#0B1211] font-bold px-8 py-3 rounded-full hover:brightness-110 transition-all shadow-lg">
            Locate
          </button>
        </div>

        {/* CTA Button */}
        <Link href="/dashboard" className="mt-12 group">
          <div className="bg-primary text-[#0B1211] font-black px-12 py-6 rounded-full text-2xl shadow-[0_0_50px_rgba(6,214,160,0.3)] hover:shadow-primary/60 transition-all active:scale-95">
            Start Exploring (Guest Mode)
          </div>
          <p className="text-[10px] text-gray-400 mt-4 tracking-[0.3em] font-bold uppercase drop-shadow-md">
            No account required to visualize
          </p>
        </Link>
      </section>

      {/* 3. FEATURE CARDS */}
      <section className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 mb-40 relative z-10">
        <FeatureCard
          icon={<Wind className="text-blue-400" />}
          title="Livability"
          desc="Optimizing walkable streets and shaded transit corridors to reduce pedestrian heat exposure."
          linkText="Explore Metrics"
        />
        <FeatureCard
          icon={<Thermometer className="text-primary" />}
          title="Climate"
          desc="Advanced urban heat mitigation and carbon sequestration modeling for a resilient future."
          linkText="View Simulations"
        />
        <FeatureCard
          icon={<Heart className="text-red-400" />}
          title="Health"
          desc="Improving air quality and mental well-being through strategic expansion of urban green spaces."
          linkText="Access Insights"
        />
      </section>

      {/* 4. QUICK JUMP HOTSPOTS */}
      <section className="pb-40 relative z-10">
        <h3 className="text-center text-xs font-bold tracking-[0.3em] text-gray-500 uppercase mb-12">
          Quick Jump to Hotspots
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
            url="\images\Merdeka_118_District.jpg"
          />
          {/* NEW: Putrajaya (Bridge/Architecture) */}
          <HotspotImage
            name="Putrajaya Corridors"
            url="https://images.unsplash.com/photo-1630713745260-848691b1062c?auto=format&fit=crop&q=80&w=600"
          />
        </div>
      </section>

      {/* 5. DATA INTEGRATION SECTION */}
      <section className="max-w-7xl mx-auto px-10 pb-40 grid md:grid-cols-2 gap-24 items-center relative z-10">
        <div>
          <h2 className="text-5xl font-bold leading-tight tracking-tighter italic drop-shadow-xl">
            Live Data Integration
          </h2>
          <p className="mt-8 text-gray-400 text-lg leading-relaxed">
            Our platform aggregates real-time temperature sensors, satellite
            vegetative indices, and urban canopy data to provide the most
            accurate cooling potential maps for KL residents and city planners.
          </p>
          <div className="mt-12 flex gap-12">
            <div>
              <h4 className="text-primary text-4xl font-bold tracking-tighter">
                3.2°C
              </h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">
                Avg Heat Reduction
              </p>
            </div>
            <div>
              <h4 className="text-primary text-4xl font-bold tracking-tighter">
                120k+
              </h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">
                Trees Mapped
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
            COOLER<span className="text-primary">KL</span>
          </span>
        </div>
        <p className="font-medium tracking-wide">
          © 2024 Urban Cooling Initiative. All rights reserved. Built for Kuala
          Lumpur.
        </p>
        <div className="flex gap-8">
          <Globe
            size={18}
            className="hover:text-primary cursor-pointer transition-colors"
          />
          <LayoutGrid
            size={18}
            className="hover:text-primary cursor-pointer transition-colors"
          />
          <Mail
            size={18}
            className="hover:text-primary cursor-pointer transition-colors"
          />
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
      <button className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all">
        {linkText} <ArrowRight size={14} />
      </button>
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
