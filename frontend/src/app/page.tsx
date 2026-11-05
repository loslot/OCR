"use client";

import Link from "next/link";
import {
  Zap,
  Shield,
  Cpu,
  Layers,
  ArrowRight,
  FileText,
  Lock,
  Globe,
  CheckCircle2,
} from "lucide-react";
import LandingNavbar from "@/components/layout/LandingNavbar";
import Footer from "@/components/layout/Footer";
import ScrollReveal from "@/components/effects/ScrollReveal";

export default function LandingPage() {
  const sampleLines = [
    { text: "SECURITY_PROTOCOL_REV_4.9", conf: "99.8%", color: "#39FF14" },
    { text: "QUANTUM_RESISTANT_SIGNATURE_OK", conf: "98.4%", color: "#39FF14" },
    { text: "EXTRACTING OPTICAL MATRICES...", conf: "95.2%", color: "#00E676" },
    { text: "CONFIRMATION: 0 DEVIATIONS DETECTED", conf: "99.1%", color: "#39FF14" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#080B0A] text-[#F5F7F5] selection:bg-[#39FF14]/20 selection:text-[#39FF14]">
      <LandingNavbar />

      <main className="flex-1 pt-24">
        {/* ================= HERO SECTION ================= */}
        <section className="relative min-h-[calc(100vh-6rem)] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#39FF14]/[0.035] rounded-full blur-[160px] pointer-events-none" />

          <div className="max-w-5xl mx-auto text-center relative z-10">
            {/* System Tag / Badge */}
            <ScrollReveal direction="down" delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111816] border border-[#1A2720] text-xs font-mono text-[#00E676] mb-8 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
                <span className="text-[#8B9690]">{"//"}</span>
                <span>NEURAL OPTICAL ENGINE ACTIVE</span>
                <span className="text-[#8B9690]">•</span>
                <span className="text-[#8B9690]">v1.0.0</span>
              </div>
            </ScrollReveal>

            {/* Main Headline */}
            <ScrollReveal delay={0.2}>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-mono font-extrabold tracking-tight text-[#F5F7F5] uppercase">
                READ THE{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39FF14] via-[#00E676] to-[#39FF14] drop-shadow-[0_0_30px_rgba(57,255,20,0.3)]">
                  DIGITAL WORLD.
                </span>
              </h1>
            </ScrollReveal>

            {/* Subtitle */}
            <ScrollReveal delay={0.3}>
              <p className="mt-6 text-lg sm:text-xl text-[#8B9690] max-w-2xl mx-auto font-sans leading-relaxed">
                AI-powered text extraction from images.
                <br className="hidden sm:inline" /> High-speed OCR with deep neural tensor recognition, sub-second latency, and zero database footprint.
              </p>
            </ScrollReveal>

            {/* CTAs */}
            <ScrollReveal delay={0.4}>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/scanner"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-mono text-sm font-semibold tracking-wider text-[#080B0A] bg-[#39FF14] hover:bg-[#00E676] shadow-[0_0_30px_rgba(57,255,20,0.4)] hover:shadow-[0_0_40px_rgba(57,255,20,0.6)] transition-all flex items-center justify-center gap-2.5"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>LAUNCH SCANNER</span>
                </Link>

                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-mono text-sm font-semibold tracking-wider text-[#F5F7F5] bg-[#111816] hover:bg-[#16201D] border border-[#1A2720] hover:border-[#39FF14]/40 transition-all flex items-center justify-center gap-2"
                >
                  <span>OPEN DASHBOARD</span>
                  <ArrowRight className="w-4 h-4 text-[#39FF14]" />
                </Link>
              </div>
            </ScrollReveal>

            {/* Live Cyber Interactive Terminal Preview */}
            <ScrollReveal delay={0.5}>
              <div className="mt-16 max-w-3xl mx-auto text-left rounded-2xl bg-[#0D1210]/90 border border-[#1A2720] shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden backdrop-blur-xl">
                {/* Window Topbar */}
                <div className="px-4 py-3 bg-[#080B0A] border-b border-[#1A2720] flex items-center justify-between font-mono text-xs text-[#8B9690]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D4D]/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFB020]/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#39FF14]/80" />
                    <span className="ml-2 text-[#8B9690]">{"//"}</span>
                    <span className="text-[#F5F7F5]">quickocr_engine_telemetry.sh</span>
                  </div>
                  <div className="text-[10px] text-[#39FF14] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-ping" />
                    INFERENCE_STREAMING
                  </div>
                </div>

                {/* Simulated Scanning Interface */}
                <div className="p-6 font-mono text-xs space-y-3 relative overflow-hidden">
                  {/* Laser Scanline Beam */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#39FF14] to-transparent shadow-[0_0_12px_#39FF14] animate-scanline pointer-events-none" />

                  <div className="text-[#8B9690]">
                    &gt; <span className="text-[#F5F7F5]">quickocr --input document.png --lang en --mode high-precision</span>
                  </div>
                  <div className="text-[#00E676]">
                    [*] Initializing OpenCV bilateral filter... Done [0.08s]
                  </div>
                  <div className="text-[#00E676]">
                    [*] Executing Tesseract OCR text recognition... Done [0.34s]
                  </div>

                  <div className="pt-2 border-t border-[#1A2720] space-y-2">
                    {sampleLines.map((line, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded bg-[#080B0A] border border-[#1A2720]/60"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#39FF14]" />
                          <span className="text-[#F5F7F5]">{line.text}</span>
                        </div>
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#111816]"
                          style={{ color: line.color }}
                        >
                          {line.conf} CONF
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 text-[#8B9690] flex items-center justify-between text-[11px]">
                    <span>STATUS: 201 CREATED</span>
                    <span className="text-[#39FF14]">DURATION: 0.42s • 100% SUCCESS</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ================= FEATURES SECTION ================= */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-[#1A2720] relative">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <ScrollReveal>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111816] border border-[#1A2720] text-xs font-mono text-[#39FF14] mb-4">
                  <span>{"// SYSTEM_CAPABILITIES"}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-mono font-bold text-[#F5F7F5] uppercase">
                  HIGH-VELOCITY OCR ARCHITECTURE
                </h2>
                <p className="mt-4 text-[#8B9690] font-sans text-base">
                  Engineered for maximum accuracy, privacy, and zero operational overhead.
                </p>
              </ScrollReveal>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Sub-Second Ingestion",
                  desc: "Optimized OpenCV preprocessors normalize lighting and orientation before neural tensor evaluation.",
                  icon: Cpu,
                  tag: "LATENCY < 500MS",
                },
                {
                  title: "Zero Database Dependency",
                  desc: "Fully database-free architecture. Documents and JSON results persist in local filesystem storage.",
                  icon: Lock,
                  tag: "LOCAL STORAGE",
                },
                {
                  title: "Bounding Box Polygons",
                  desc: "Every recognized word is isolated with precise coordinates and individual probability matrices.",
                  icon: Layers,
                  tag: "POLYGON MAPPING",
                },
                {
                  title: "Multilingual Engine",
                  desc: "Trained on Latin scripts and Khmer typography with extensible custom neural model weights.",
                  icon: Globe,
                  tag: "EN + KM MODELS",
                },
                {
                  title: "Live Editable Buffer",
                  desc: "Instantly edit, audit, search, and download TXT transcripts directly inside the scanner workspace.",
                  icon: FileText,
                  tag: "INSTANT EXPORT",
                },
                {
                  title: "Air-Gapped Privacy",
                  desc: "Your confidential scans never leave your local environment. Zero cloud analytics or telemetry leaks.",
                  icon: Shield,
                  tag: "TOTAL PRIVACY",
                },
              ].map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <ScrollReveal key={feat.title} delay={i * 0.1}>
                    <div className="group p-6 rounded-2xl bg-[#111816]/80 border border-[#1A2720] hover:border-[#39FF14]/40 transition-all duration-300 h-full flex flex-col justify-between backdrop-blur-md">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 rounded-xl bg-[#0D1210] border border-[#1A2720] text-[#00E676] group-hover:text-[#39FF14] group-hover:scale-110 transition-all">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#080B0A] border border-[#1A2720] text-[#8B9690]">
                            {feat.tag}
                          </span>
                        </div>
                        <h3 className="font-mono text-base font-semibold text-[#F5F7F5] mb-2 group-hover:text-[#39FF14] transition-colors">
                          {feat.title}
                        </h3>
                        <p className="text-sm text-[#8B9690] leading-relaxed font-sans">
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-[#1A2720] bg-[#0D1210]/50 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <ScrollReveal>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111816] border border-[#1A2720] text-xs font-mono text-[#39FF14] mb-4">
                  <span>{"// PIPELINE_EXECUTION"}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-mono font-bold text-[#F5F7F5] uppercase">
                  HOW QUICKOCR EXTRACTS TEXT
                </h2>
                <p className="mt-4 text-[#8B9690] font-sans text-base">
                  A four-stage deterministic neural pipeline running from browser to local FastAPI backend.
                </p>
              </ScrollReveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: "01",
                  title: "IMAGE INGESTION",
                  desc: "Upload or drag & drop PNG, JPG, or WEBP images up to 10MB through the reactive frontend scanner.",
                },
                {
                  step: "02",
                  title: "OPENCV FILTERING",
                  desc: "Image channels are normalized with contrast equalization, grayscaling, and edge enhancement.",
                },
                {
                  step: "03",
                  title: "NEURAL INFERENCE",
                  desc: "Tesseract OCR recognizes text and returns line-level confidence and bounding boxes.",
                },
                {
                  step: "04",
                  title: "EXPORT TRANSCRIPT",
                  desc: "Review confidence scores, edit in real-time, copy to clipboard, or export formatted TXT files.",
                },
              ].map((step, idx) => (
                <ScrollReveal key={step.step} delay={idx * 0.1}>
                  <div className="p-6 rounded-2xl bg-[#111816] border border-[#1A2720] h-full flex flex-col justify-between">
                    <div>
                      <div className="text-3xl font-mono font-extrabold text-[#39FF14] mb-3 opacity-80">
                        {step.step}
                      </div>
                      <h4 className="font-mono text-sm font-semibold text-[#F5F7F5] mb-2 tracking-wide">
                        {step.title}
                      </h4>
                      <p className="text-xs text-[#8B9690] font-sans leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA SECTION ================= */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-[#1A2720] relative">
          <div className="max-w-4xl mx-auto text-center p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-[#111816] to-[#080B0A] border border-[#1A2720] shadow-[0_0_50px_rgba(57,255,20,0.06)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14]/10 rounded-full blur-3xl pointer-events-none" />

            <h2 className="text-3xl sm:text-5xl font-mono font-bold text-[#F5F7F5] uppercase tracking-tight">
              READY TO SCAN YOUR FIRST DOCUMENT?
            </h2>
            <p className="mt-4 text-[#8B9690] max-w-xl mx-auto font-sans text-sm sm:text-base">
              Connect to your local FastAPI backend and start extracting characters in milliseconds.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/scanner"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono text-xs sm:text-sm font-semibold text-[#080B0A] bg-[#39FF14] hover:bg-[#00E676] shadow-[0_0_25px_rgba(57,255,20,0.35)] transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>LAUNCH SCANNER</span>
              </Link>
              <Link
                href="/history"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono text-xs sm:text-sm font-semibold text-[#F5F7F5] bg-[#0D1210] border border-[#1A2720] hover:border-[#39FF14]/30 transition-all flex items-center justify-center gap-2"
              >
                <span>VIEW HISTORY</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
