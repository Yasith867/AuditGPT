import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './components/Icons';
import { AppState, LogEntry, AuditReport, JobProgress, AnalysisStatus } from './types';
import { performFullAudit } from './services/geminiService';
import { fetchContractData, isValidAddress } from './services/polygonService';
import { AuditDashboard } from './components/AuditDashboard';
import { Documentation } from './components/Documentation';
import { MonitoringDashboard } from './components/MonitoringDashboard';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [inputMode, setInputMode] = useState<'address' | 'source'>('address');
  const [addressInput, setAddressInput] = useState('');
  const [sourceInput, setSourceInput] = useState('');
  const [apiKey, setApiKey] = useState(''); 
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [jobProgress, setJobProgress] = useState<JobProgress>({
    fetch: AnalysisStatus.PENDING,
    staticAnalysis: AnalysisStatus.PENDING,
    gasAnalysis: AnalysisStatus.PENDING,
    economicAnalysis: AnalysisStatus.PENDING,
    upgradeAnalysis: AnalysisStatus.PENDING,
    reportGeneration: AnalysisStatus.PENDING
  });
  
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message, type }]);
  };

  const runAuditJob = async () => {
    // Validation
    if (inputMode === 'address') {
      if (!addressInput.trim()) return;
      if (!isValidAddress(addressInput)) {
        addLog('Invalid Polygon Address Format', 'error');
        return;
      }

      // Validate API Key if provided
      if (apiKey.trim()) {
        const keyPattern = /^[A-Za-z0-9]{34}$/;
        if (!keyPattern.test(apiKey.trim())) {
          addLog('Invalid API Key format. It must be 34 alphanumeric characters.', 'error');
          return;
        }
      }
    } else {
      if (!sourceInput.trim() || sourceInput.length < 50) {
        addLog('Source code is too short or empty.', 'error');
        return;
      }
    }

    // Reset State
    setAppState(AppState.PROCESSING);
    setLogs([]);
    setReport(null);
    setJobProgress({
      fetch: AnalysisStatus.PENDING,
      staticAnalysis: AnalysisStatus.PENDING,
      gasAnalysis: AnalysisStatus.PENDING,
      economicAnalysis: AnalysisStatus.PENDING,
      upgradeAnalysis: AnalysisStatus.PENDING,
      reportGeneration: AnalysisStatus.PENDING
    });

    try {
      addLog(`Initializing Job: ${inputMode === 'address' ? addressInput : 'Manual Source Code'}`, 'process');

      let sourceCode = '';
      let contractName = 'Unknown Contract';

      // --- STEP 1: Fetch Data (Conditional) ---
      if (inputMode === 'address') {
        setJobProgress(prev => ({ ...prev, fetch: AnalysisStatus.PROCESSING }));
        addLog('Phase 1: Retrieving on-chain data...', 'info');
        // Pass trimmed API key
        const contractData = await fetchContractData(addressInput, apiKey.trim(), addLog);
        sourceCode = contractData.sourceCode;
        contractName = contractData.name;
        setJobProgress(prev => ({ ...prev, fetch: AnalysisStatus.COMPLETED, staticAnalysis: AnalysisStatus.PROCESSING }));
      } else {
        setJobProgress(prev => ({ ...prev, fetch: AnalysisStatus.COMPLETED, staticAnalysis: AnalysisStatus.PROCESSING }));
        addLog('Phase 1: Using provided source code input.', 'info');
        sourceCode = sourceInput;
        contractName = "Uploaded Contract";
      }
      
      // --- STEP 2: Run Analysis Engine ---
      addLog('Phase 2: Initializing Analysis Engine (Gemini 3.0 Pro - Thinking Mode)...', 'info');
      addLog(`Analyzing ${sourceCode.length} bytes of source code...`, 'info');
      
      // We start all "modules" as processing visually, though the API call is unified for consistency
      setJobProgress(prev => ({ 
        ...prev, 
        staticAnalysis: AnalysisStatus.PROCESSING,
        gasAnalysis: AnalysisStatus.PROCESSING,
        economicAnalysis: AnalysisStatus.PROCESSING,
        upgradeAnalysis: AnalysisStatus.PROCESSING
      }));

      // Real API Call
      const fullReport = await performFullAudit(sourceCode, contractName);
      
      if (inputMode === 'address') {
        fullReport.contractAddress = addressInput;
      } else {
        fullReport.contractAddress = "N/A (Source Input)";
      }

      // Update progress sequentially for visual effect (simulating pipeline completion)
      setJobProgress(prev => ({ ...prev, staticAnalysis: AnalysisStatus.COMPLETED }));
      addLog(`Static Analysis Complete: ${fullReport.vulnerabilities.length} findings`, 'success');
      await new Promise(r => setTimeout(r, 400));

      setJobProgress(prev => ({ ...prev, gasAnalysis: AnalysisStatus.COMPLETED }));
      addLog(`Gas Profiling Complete: ${fullReport.gasAnalysis.length} optimizations found`, 'success');
      await new Promise(r => setTimeout(r, 400));

      setJobProgress(prev => ({ ...prev, economicAnalysis: AnalysisStatus.COMPLETED }));
      addLog(`Economic Modeling Complete: ${fullReport.economicAnalysis.length} vectors analyzed`, 'success');
      await new Promise(r => setTimeout(r, 400));
      
      setJobProgress(prev => ({ ...prev, upgradeAnalysis: AnalysisStatus.COMPLETED, reportGeneration: AnalysisStatus.PROCESSING }));
      addLog(`Upgradeability Check Complete: ${fullReport.upgradeabilityAnalysis.length} items reviewed`, 'success');
      await new Promise(r => setTimeout(r, 400));

      setJobProgress(prev => ({ ...prev, reportGeneration: AnalysisStatus.COMPLETED }));
      addLog('Audit Report Generated Successfully', 'success');
      
      setReport(fullReport);
      setAppState(AppState.RESULTS);

    } catch (error: any) {
      console.error(error);
      addLog(error.message, 'error');
      setAppState(AppState.ERROR);
      setJobProgress(prev => ({
        fetch: prev.fetch === AnalysisStatus.PROCESSING ? AnalysisStatus.FAILED : prev.fetch,
        staticAnalysis: AnalysisStatus.FAILED,
        gasAnalysis: AnalysisStatus.FAILED,
        economicAnalysis: AnalysisStatus.FAILED,
        upgradeAnalysis: AnalysisStatus.FAILED,
        reportGeneration: AnalysisStatus.FAILED
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-purple-500/30">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setAppState(AppState.IDLE)}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Icons.Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">AuditGPT</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setAppState(AppState.MONITORING)}
                className={`text-sm flex items-center gap-2 transition-colors ${appState === AppState.MONITORING ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Icons.Activity className="w-4 h-4" /> Live Monitoring
              </button>
              <button 
                onClick={() => setAppState(AppState.DOCUMENTATION)}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Documentation
              </button>
              <div className="h-4 w-px bg-slate-700"></div>
              <div className="flex items-center gap-2 text-xs font-mono text-purple-400 px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                Polygon PoS Mainnet
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main View */}
      <main className="relative">
        {appState === AppState.DOCUMENTATION ? (
          <Documentation onBack={() => setAppState(AppState.IDLE)} />
        ) : appState === AppState.MONITORING ? (
          <MonitoringDashboard onBack={() => setAppState(AppState.IDLE)} />
        ) : appState === AppState.RESULTS && report ? (
          <AuditDashboard report={report} onReset={() => setAppState(AppState.IDLE)} />
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
            
            {/* Hero */}
            <div className="text-center mb-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-medium mb-4">
                <Icons.Zap className="w-3 h-3 text-yellow-400" />
                <span>Powered by Gemini 3.0 Pro (Thinking Mode) & PolygonScan</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Smart Contract Audit <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 animate-gradient">on Polygon</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Enter a verified contract address or paste source code to perform a real-time deep static analysis, gas profiling, and economic security check.
              </p>
            </div>

            {/* Input Section */}
            <div className="w-full max-w-2xl bg-slate-800/40 backdrop-blur border border-slate-700 rounded-2xl p-2 shadow-2xl relative overflow-hidden transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 pointer-events-none"></div>
              
              {/* Input Tabs */}
              <div className="flex p-2 bg-slate-900/50 rounded-t-xl gap-1">
                 <button
                    onClick={() => setInputMode('address')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                       inputMode === 'address' 
                       ? 'bg-slate-700 text-white shadow-sm' 
                       : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                 >
                    <Icons.Search className="w-3 h-3" />
                    Verified Address
                 </button>
                 <button
                    onClick={() => setInputMode('source')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                       inputMode === 'source' 
                       ? 'bg-slate-700 text-white shadow-sm' 
                       : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                 >
                    <Icons.FileCode className="w-3 h-3" />
                    Paste Source Code
                 </button>
              </div>

              <div className="p-6 space-y-4 relative z-10">
                
                {inputMode === 'address' ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Target Contract Address (Polygon)
                      </label>
                      <div className="relative">
                        <Icons.Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="0x..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono text-sm shadow-inner transition-all"
                          value={addressInput}
                          onChange={(e) => setAddressInput(e.target.value)}
                          disabled={appState === AppState.PROCESSING}
                        />
                      </div>
                    </div>
                    {/* Optional API Key */}
                    <div>
                      <div className="relative group">
                        <input
                          type="password"
                          placeholder="Optional: PolygonScan API Key (Recommended for high throughput)"
                          className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2 px-4 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Solidity Source Code
                    </label>
                    <div className="relative">
                      <textarea
                         className="w-full h-48 bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono text-xs shadow-inner custom-scrollbar resize-none leading-relaxed"
                         placeholder="// Paste your Solidity code here..."
                         value={sourceInput}
                         onChange={(e) => setSourceInput(e.target.value)}
                         disabled={appState === AppState.PROCESSING}
                         spellCheck={false}
                      />
                      <div className="absolute bottom-2 right-4 text-[10px] text-slate-600">
                        {sourceInput.length} chars
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={runAuditJob}
                  disabled={appState === AppState.PROCESSING || (inputMode === 'address' ? !addressInput : !sourceInput)}
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-3 relative overflow-hidden group ${
                    appState === AppState.PROCESSING
                      ? 'bg-slate-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/25 transform hover:-translate-y-0.5'
                  }`}
                >
                  {appState === AppState.PROCESSING ? (
                    <>
                      <Icons.Cpu className="w-5 h-5 animate-spin" />
                      <span>Processing Job...</span>
                    </>
                  ) : (
                    <>
                      <Icons.Shield className="w-5 h-5" />
                      <span>Start Security Audit</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Job Status / Terminal */}
            {appState === AppState.PROCESSING && (
              <div className="w-full max-w-2xl mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Pipeline Visualizer */}
                <div className="grid grid-cols-6 gap-2">
                   <StatusStep label="Fetch" status={jobProgress.fetch} icon={Icons.Download} />
                   <StatusStep label="Static" status={jobProgress.staticAnalysis} icon={Icons.Code} />
                   <StatusStep label="Gas" status={jobProgress.gasAnalysis} icon={Icons.Zap} />
                   <StatusStep label="Econ" status={jobProgress.economicAnalysis} icon={Icons.Activity} />
                   <StatusStep label="Upgrade" status={jobProgress.upgradeAnalysis} icon={Icons.GitBranch} />
                   <StatusStep label="Report" status={jobProgress.reportGeneration} icon={Icons.FileText} />
                </div>

                {/* Live Logs */}
                <div className="bg-black/90 rounded-xl border border-slate-800 p-4 font-mono text-xs shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50 animate-pulse"></div>
                  <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
                     <span className="text-slate-500">audit_worker_01@auditgpt:~/jobs$ tail -f execution.log</span>
                  </div>
                  <div className="h-48 overflow-y-auto custom-scrollbar space-y-1.5 pl-1">
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="text-slate-600 min-w-[80px]">{log.timestamp}</span>
                        <span className={`${
                          log.type === 'error' ? 'text-red-400 font-bold' :
                          log.type === 'success' ? 'text-green-400' :
                          log.type === 'process' ? 'text-purple-400' :
                          log.type === 'warning' ? 'text-yellow-400' :
                          'text-slate-300'
                        }`}>
                          {log.type === 'success' && '✓ '}
                          {log.type === 'error' && '✗ '}
                          {log.type === 'process' && '➜ '}
                          {log.message}
                        </span>
                      </div>
                    ))}
                    <div ref={logEndRef} />
                  </div>
                </div>
              </div>
            )}
            
            {appState === AppState.ERROR && (
               <div className="mt-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 text-sm flex items-center gap-3 animate-in fade-in">
                  <Icons.AlertOctagon className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="font-bold">Audit Job Failed</p>
                    <p className="opacity-80">Check the logs above. Ensure the input data is correct.</p>
                  </div>
               </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const StatusStep = ({ label, status, icon: Icon }: { label: string, status: AnalysisStatus, icon: any }) => {
  const getColors = () => {
    switch (status) {
      case AnalysisStatus.COMPLETED: return 'bg-green-500/20 border-green-500/50 text-green-400';
      case AnalysisStatus.PROCESSING: return 'bg-purple-500/20 border-purple-500/50 text-purple-400 animate-pulse';
      case AnalysisStatus.FAILED: return 'bg-red-500/20 border-red-500/50 text-red-400';
      default: return 'bg-slate-800 border-slate-700 text-slate-600';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${getColors()}`}>
       <Icon className="w-4 h-4 mb-1" />
       <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
    </div>
  );
};