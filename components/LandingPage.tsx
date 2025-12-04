
import React from 'react';
import { Icons } from './Icons';
import { LandingSections } from './LandingSections';

interface LandingPageProps {
  onLaunch: () => void;
  onLearnMore: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch, onLearnMore }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-purple-500/30">
      
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Icons.Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">AuditGPT</span>
            </div>
            <div>
              <button 
                onClick={onLaunch}
                className="bg-white text-slate-900 hover:bg-slate-200 px-5 py-2 rounded-lg font-bold text-sm transition-colors"
              >
                Launch App
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Icons.Zap className="w-3 h-3 text-yellow-400" />
            <span>Powered by Gemini 3.0 Pro (Thinking Mode)</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            AI-Powered Security <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 animate-gradient">for Polygon PoS</span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            The first production-grade autonomous auditor that combines deep static analysis with real-time on-chain monitoring.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <button 
              onClick={onLaunch}
              className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/25 transform hover:-translate-y-1 transition-all flex items-center gap-2 text-lg"
            >
              <Icons.Shield className="w-5 h-5" />
              Start Free Audit
            </button>
            <button 
              onClick={onLearnMore}
              className="px-8 py-4 rounded-xl font-bold text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800 transition-all flex items-center gap-2 text-lg"
            >
              Learn More <Icons.ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content (Features, Stats, etc.) */}
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <LandingSections />
      </div>

    </div>
  );
};
