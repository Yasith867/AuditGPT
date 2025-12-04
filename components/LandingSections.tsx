import React from 'react';
import { Icons } from './Icons';

export const LandingSections: React.FC = () => {
  return (
    <div className="w-full space-y-24 py-12 animate-in fade-in duration-700">
      
      {/* Trust Badge Strip */}
      <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
        <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
          <Icons.Cpu className="w-5 h-5" /> Google Gemini 3.0
        </div>
        <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
          <div className="w-2 h-2 rounded-full bg-purple-500"></div> Polygon PoS
        </div>
        <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
          <Icons.Code className="w-5 h-5" /> Solidity 0.8+
        </div>
        <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
          <Icons.Shield className="w-5 h-5" /> Deterministic AI
        </div>
      </div>

      {/* Feature List */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Complete Security Lifecycle</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            From pre-deployment static analysis to real-time on-chain monitoring, AuditGPT covers every angle of smart contract security.
          </p>
        </div>

        <div className="flex flex-col gap-3 max-w-5xl mx-auto">
          <FeatureRow 
            color="text-purple-400"
            bg="bg-purple-500/5 border-purple-500/10"
            title="Deep Static Analysis"
            desc="Detects critical vulnerabilities like Reentrancy, Overflows, and Access Control failures using deterministic AI reasoning."
          />
          <FeatureRow 
            color="text-yellow-400"
            bg="bg-yellow-500/5 border-yellow-500/10"
            title="Gas Optimization"
            desc="Identifies expensive loops, storage inefficiencies, and redundant operations to reduce execution costs."
          />
          <FeatureRow 
            color="text-red-400"
            bg="bg-red-500/5 border-red-500/10"
            title="Economic Risk Modeling"
            desc="Simulates complex attack vectors like Flash Loans, Oracle Manipulation, and Sandwich attacks."
          />
           <FeatureRow 
            color="text-blue-400"
            bg="bg-blue-500/5 border-blue-500/10"
            title="Upgradeability Checks"
            desc="Verifies proxy patterns (Diamond, UUPS), storage slot collisions, and initialization safety."
          />
          <FeatureRow 
            color="text-green-400"
            bg="bg-green-500/5 border-green-500/10"
            title="Live Watchtower"
            desc="Connects to Polygon RPCs to monitor gas prices, decode events, and alert on suspicious activity in real-time."
          />
          <FeatureRow 
            color="text-indigo-400"
            bg="bg-indigo-500/5 border-indigo-500/10"
            title="Professional Reports"
            desc="Generates executive PDF reports with severity scores, remediation steps, and auto-generated code fixes."
          />
        </div>
      </section>

      {/* How it Works */}
      <section className="relative overflow-hidden bg-slate-800/30 rounded-3xl p-8 md:p-12 border border-slate-700/50">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/5 to-blue-500/5 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Step 
              num="01" 
              title="Input Source" 
              desc="Paste your Solidity code into the secure editor. No setup required." 
            />
            <Step 
              num="02" 
              title="AI Analysis" 
              desc="Gemini 3.0 Pro performs a deep-dive audit with 32k token reasoning budget." 
            />
            <Step 
              num="03" 
              title="Get Results" 
              desc="Receive a detailed dashboard and PDF report with fix suggestions." 
            />
          </div>
        </div>
      </section>

      {/* Stats / Footer */}
      <div className="border-t border-slate-800 pt-12 pb-6 text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <Stat val="0" label="Configuration Needed" />
            <Stat val="100%" label="Polygon Compatible" />
            <Stat val="< 60s" label="Audit Time" />
            <Stat val="24/7" label="Live Monitoring" />
        </div>
        <p className="text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} AuditGPT. Built for the Polygon Ecosystem.
        </p>
      </div>

    </div>
  );
};

const FeatureRow = ({ title, desc, color, bg }: any) => (
  <div className={`p-4 rounded-lg border transition-all duration-300 hover:bg-slate-800/50 ${bg} flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-8`}>
    <h3 className={`text-base font-bold ${color} md:w-56 shrink-0`}>{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const Step = ({ num, title, desc }: any) => (
  <div className="text-center space-y-3">
    <div className="text-4xl font-black text-slate-700/50 font-mono">{num}</div>
    <h3 className="text-xl font-bold text-white">{title}</h3>
    <p className="text-slate-400 text-sm">{desc}</p>
  </div>
);

const Stat = ({ val, label }: any) => (
  <div>
    <div className="text-3xl font-bold text-white mb-1">{val}</div>
    <div className="text-xs text-slate-500 uppercase tracking-wider">{label}</div>
  </div>
);
