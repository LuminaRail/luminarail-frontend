import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { GridScan } from '@/components/backgrounds/GridScan';
import { HeroMobileMockup } from '@/components/landing/HeroMobileMockup';
import {
  ArrowRight,
  Check,
  Shield,
  Clock,
  Layers,
  Cpu,
  RefreshCw,
  Lock,
  ExternalLink,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      {/* Background Grid Scan animation */}
      <GridScan scanColor="#15e113" opacity={0.85} gridScale={45} scanSpeed={1.0} scanHeight={160} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

      <main>
        {/* ================= 1. HERO SECTION ================= */}
        <section className="relative border-b border-slate-200 dark:border-slate-800/80 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Editorial Hero Text */}
              <div className="lg:col-span-7 space-y-8 text-left">
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono uppercase tracking-widest text-slate-700 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Stablecoin Settlement Infrastructure</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-slate-900 dark:text-slate-100">
                  Move local money <br />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    onto Stellar.
                  </span>
                </h1>

                {/* Supporting Text */}
                <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400 font-normal">
                  LuminaRail connects local fiat payment rails with programmable USDC settlement on Stellar, giving businesses a simple, reliable way to move value across borders.
                </p>

                {/* Primary & Secondary Action CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  <Link
                    href="/quotes"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-md transition-all duration-150 shadow-sm active:scale-[0.99]"
                  >
                    <span>Get a quote</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="#how-it-works"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium text-sm rounded-md border border-slate-300 dark:border-slate-800 transition-all duration-150"
                  >
                    <span>Explore how it works</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Interactive Mobile Mockup */}
              <div className="lg:col-span-5 flex justify-center">
                <HeroMobileMockup />
              </div>

            </div>
          </div>
        </section>

        {/* ================= 2. TRUST / NETWORK STRIP ================= */}
        <section className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0c101b] py-10 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
              
              {/* Metric 1 */}
              <div className="pt-4 md:pt-0 md:px-4 first:pl-0 space-y-1">
                <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
                  Stellar
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                  Settlement network
                </div>
              </div>

              {/* Metric 2 */}
              <div className="pt-4 md:pt-0 md:px-6 space-y-1">
                <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
                  USDC
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                  Settlement asset
                </div>
              </div>

              {/* Metric 3 */}
              <div className="pt-4 md:pt-0 md:px-6 space-y-1">
                <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
                  Soroban
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                  Smart contract layer
                </div>
              </div>

              {/* Metric 4 */}
              <div className="pt-4 md:pt-0 md:px-6 space-y-1">
                <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
                  NGN → USDC
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                  Primary settlement rail
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ================= 3. PRODUCT / PLATFORM & PREVIEW SECTION ================= */}
        <section id="product" className="py-24 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090d16] transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Heading */}
            <div className="max-w-3xl space-y-4 mb-16">
              <div className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold">
                Platform Capabilities
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                One rail for fiat and on-chain settlement.
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                LuminaRail provides the building blocks to collect local fiat payments, orchestrate rate locks, and settle directly via Stellar USDC smart contracts.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Capabilities Grid */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                
                {/* 1. Quotes */}
                <div className="bg-white dark:bg-[#0b0e17] p-6 space-y-3 hover:bg-slate-50 dark:hover:bg-[#0e121e] transition-colors">
                  <div className="w-7 h-7 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    Quotes
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Get live NGN → USDC quotes with deterministic exchange rates and transparent execution windows.
                  </p>
                </div>

                {/* 2. Orders */}
                <div className="bg-white dark:bg-[#0b0e17] p-6 space-y-3 hover:bg-slate-50 dark:hover:bg-[#0e121e] transition-colors">
                  <div className="w-7 h-7 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    Orders
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Create and manage settlement orders linked directly to recipient Stellar wallet public keys.
                  </p>
                </div>

                {/* 3. Soroban Settlement */}
                <div className="bg-white dark:bg-[#0b0e17] p-6 space-y-3 hover:bg-slate-50 dark:hover:bg-[#0e121e] transition-colors">
                  <div className="w-7 h-7 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    Soroban Settlement
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Programmable settlement logic powered by Soroban WASM smart contracts on Stellar.
                  </p>
                </div>

                {/* 4. Payment Tracking */}
                <div className="bg-white dark:bg-[#0b0e17] p-6 space-y-3 hover:bg-slate-50 dark:hover:bg-[#0e121e] transition-colors">
                  <div className="w-7 h-7 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    Payment Tracking
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Track payments from local deposit webhooks through to on-chain ledger finality.
                  </p>
                </div>

                {/* 5. Wallets */}
                <div className="bg-white dark:bg-[#0b0e17] p-6 space-y-3 hover:bg-slate-50 dark:hover:bg-[#0e121e] transition-colors">
                  <div className="w-7 h-7 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    Wallets
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Connect Stellar wallets securely using Freighter for non-custodial authorization.
                  </p>
                </div>

                {/* 6. Confirmation */}
                <div className="bg-white dark:bg-[#0b0e17] p-6 space-y-3 hover:bg-slate-50 dark:hover:bg-[#0e121e] transition-colors">
                  <div className="w-7 h-7 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    Confirmation
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    On-chain confirmation receipts and verifiable proof stored on the Stellar ledger.
                  </p>
                </div>

              </div>

              {/* Realistic Settlement Preview Interface Component */}
              <div id="preview" className="lg:col-span-5">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0e111a] overflow-hidden shadow-sm dark:shadow-xl font-sans">
                  
                  {/* Header */}
                  <div className="px-5 py-3.5 bg-slate-100 dark:bg-[#121623] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider font-mono">
                      Settlement preview
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Ready
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-5">
                    
                    {/* Send & Receive Fields */}
                    <div className="space-y-3 font-mono">
                      <div className="p-3.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090b10]">
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium font-sans">
                          You send
                        </div>
                        <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          250,000.00 NGN
                        </div>
                      </div>

                      <div className="p-3.5 rounded border border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-[#090b10]">
                        <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-medium font-sans">
                          You receive (estimated)
                        </div>
                        <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          158.423839 USDC
                        </div>
                      </div>
                    </div>

                    {/* Metadata Table */}
                    <div className="p-3.5 rounded border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#121623] space-y-2 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Rate:</span>
                        <span className="text-slate-800 dark:text-slate-200">1 USDC ≈ 1,578.00 NGN</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Network:</span>
                        <span className="text-slate-800 dark:text-slate-200">Stellar</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Fee:</span>
                        <span className="text-slate-800 dark:text-slate-200">0.00001 XLM</span>
                      </div>
                    </div>

                    {/* Primary Button */}
                    <div>
                      <Link
                        href="/quotes"
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider rounded transition-colors shadow-sm"
                      >
                        <span>Continue to settlement →</span>
                      </Link>
                    </div>

                  </div>

                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ================= 4. HOW IT WORKS ================= */}
        <section id="how-it-works" className="py-24 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0b0e15] transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="max-w-3xl space-y-4 mb-20">
              <div className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold">
                Process Flow
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                How settlement works
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                A minimal 3-step pipeline built for rapid execution and financial auditability.
              </p>
            </div>

            {/* 3-step Flow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              
              {/* 01 Quote */}
              <div className="space-y-4 border-l-2 border-emerald-500 pl-6 md:border-l-0 md:pl-0 md:border-t-2 md:pt-8">
                <div className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  01
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Quote
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Get a live NGN → USDC quote. Rates are calculated dynamically with explicit execution windows.
                </p>
              </div>

              {/* 02 Order */}
              <div className="space-y-4 border-l-2 border-slate-300 dark:border-slate-800 pl-6 md:border-l-0 md:pl-0 md:border-t-2 md:pt-8">
                <div className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  02
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Order
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Confirm the settlement and provide the required payment information along with recipient wallet details.
                </p>
              </div>

              {/* 03 Settle */}
              <div className="space-y-4 border-l-2 border-slate-300 dark:border-slate-800 pl-6 md:border-l-0 md:pl-0 md:border-t-2 md:pt-8">
                <div className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  03
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Settle
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  LuminaRail submits and confirms the Soroban smart-contract transaction on Stellar in seconds.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ================= 5. STELLAR / SOROBAN SECTION ================= */}
        <section id="developers" className="py-24 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090d16] transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column */}
              <div className="lg:col-span-6 space-y-6">
                <div className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold">
                  Infrastructure
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                  Built on Stellar. <br />
                  <span className="text-slate-500 dark:text-slate-400">Settled with Soroban.</span>
                </h2>

                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  LuminaRail uses Stellar for fast, reliable settlement and Soroban for programmable settlement logic, escrow conditions, and audit verification.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Sub-Second Finality</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Transactions finalize on the Stellar ledger in 3–5 seconds with negligible network fees.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Soroban Smart Contracts</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">WebAssembly-based contract state execution enforcing conditional payouts.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Subtle Technical Visualization */}
              <div className="lg:col-span-6">
                <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c101c] rounded-lg p-6 space-y-4 font-mono text-xs shadow-sm">
                  <div className="text-xs font-sans font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-3">
                    Technical Settlement Pipeline
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111520] flex justify-between items-center">
                      <span className="font-sans font-semibold text-slate-800 dark:text-slate-200">Fiat Rail</span>
                      <span className="text-[10px] text-slate-500">NGN Deposit Verification</span>
                    </div>
                    <div className="text-center text-slate-400 text-xs">↓</div>

                    <div className="p-3 rounded border border-emerald-300 dark:border-emerald-900/60 bg-emerald-50 dark:bg-[#111c1b] flex justify-between items-center">
                      <span className="font-sans font-semibold text-slate-900 dark:text-slate-100">LuminaRail Core</span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Order & Rate Engine</span>
                    </div>
                    <div className="text-center text-slate-400 text-xs">↓</div>

                    <div className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111520] flex justify-between items-center">
                      <span className="font-sans font-semibold text-slate-800 dark:text-slate-200">USDC Asset</span>
                      <span className="text-[10px] text-slate-500">Stellar Asset Trustline</span>
                    </div>
                    <div className="text-center text-slate-400 text-xs">↓</div>

                    <div className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111520] flex justify-between items-center">
                      <span className="font-sans font-semibold text-slate-800 dark:text-slate-200">Soroban Contract</span>
                      <span className="text-[10px] text-slate-500">WASM State Execution</span>
                    </div>
                    <div className="text-center text-slate-400 text-xs">↓</div>

                    <div className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111520] flex justify-between items-center">
                      <span className="font-sans font-semibold text-slate-800 dark:text-slate-200">Stellar Ledger</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Finality Confirmed</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ================= 6. FINAL CTA ================= */}
        <section className="py-24 bg-white dark:bg-[#090d16] transition-colors">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="rounded-xl p-8 sm:p-12 text-center space-y-8 bg-emerald-50/70 dark:bg-[#0c121e] border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
              <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Move value with LuminaRail.
              </h2>
              
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Start with a quote and settle USDC through Stellar.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Link
                  href="/quotes"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-md transition-all duration-150 shadow-sm"
                >
                  <span>Get a quote</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/orders"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm rounded-md border border-slate-300 dark:border-slate-800 transition-all duration-150"
                >
                  <span>Connect wallet</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ================= 7. FOOTER ================= */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#07090e] py-16 text-slate-600 dark:text-slate-400 text-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-slate-200 dark:border-slate-800/80">
            
            {/* Brand column */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/brand/luminarail-icon-dark.svg"
                  alt="LuminaRail Logo"
                  width={28}
                  height={28}
                  className="w-7 h-7"
                />
                <span className="font-bold text-slate-900 dark:text-slate-100 text-base tracking-tight">
                  Lumina<span className="text-[#15E113]">Rail</span>
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed text-xs">
                Settlement infrastructure platform connecting local fiat payments with Stellar USDC and Soroban smart-contract execution.
              </p>
            </div>

            {/* Column 1: Product */}
            <div className="space-y-3">
              <div className="font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 text-[11px]">
                Product
              </div>
              <ul className="space-y-2">
                <li><Link href="/#product" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Product</Link></li>
                <li><Link href="/#how-it-works" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">How it works</Link></li>
                <li><Link href="/quotes" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Quotes</Link></li>
                <li><Link href="/orders" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Orders</Link></li>
                <li><Link href="/transactions" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Transactions</Link></li>
                <li><Link href="/#developers" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Developers</Link></li>
              </ul>
            </div>

            {/* Column 2: Network */}
            <div className="space-y-3">
              <div className="font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 text-[11px]">
                Network
              </div>
              <ul className="space-y-2">
                <li><a href="https://stellar.org" target="_blank" rel="noreferrer" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors inline-flex items-center gap-1">Stellar <ExternalLink className="w-3 h-3 text-slate-400" /></a></li>
                <li><a href="https://soroban.stellar.org" target="_blank" rel="noreferrer" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors inline-flex items-center gap-1">Soroban <ExternalLink className="w-3 h-3 text-slate-400" /></a></li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="space-y-3">
              <div className="font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 text-[11px]">
                Company
              </div>
              <ul className="space-y-2">
                <li><Link href="/#product" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">About</Link></li>
                <li><Link href="/#developers" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Contact</Link></li>
                <li><Link href="/auth/login" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Portal Sign In</Link></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
            <div>
              © 2026 LuminaRail. Infrastructure for cross-border stablecoin settlement.
            </div>
            <div className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              Stellar Testnet • Paystack Test Mode
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
