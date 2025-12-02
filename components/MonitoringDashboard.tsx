import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { MonitoredContract, AlertConfig, MonitoringEvent, Severity } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface MonitoringDashboardProps {
  onBack: () => void;
}

// Mock Data Generators for Simulation
const generateMockEvent = (contractName: string): MonitoringEvent => {
  const types: MonitoringEvent['type'][] = ['TRANSACTION', 'TRANSACTION', 'TRANSACTION', 'GAS_SPIKE', 'ALERT'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  let severity = Severity.INFO;
  let message = `Transfer of ${(Math.random() * 5).toFixed(2)} MATIC`;

  if (type === 'GAS_SPIKE') {
    severity = Severity.MEDIUM;
    message = `Gas Usage Spike: ${(Math.random() * 500 + 100).toFixed(0)} Gwei detected`;
  } else if (type === 'ALERT') {
    const alerts = [
      "Suspicious reentrancy pattern detected",
      "Large withdrawal exceeding threshold",
      "Privileged role calling sensitive function",
      "Flash loan interaction detected"
    ];
    message = alerts[Math.floor(Math.random() * alerts.length)];
    severity = Severity.HIGH;
  }

  return {
    id: Math.random().toString(36).substring(7),
    timestamp: Date.now(),
    type,
    severity,
    message,
    hash: '0x' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    value: (Math.random() * 100).toFixed(2)
  };
};

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ onBack }) => {
  const [contracts, setContracts] = useState<MonitoredContract[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [newName, setNewName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    email: '',
    slackWebhook: '',
    discordWebhook: '',
    minEthTransfer: 10,
    gasThreshold: 300,
    detectFlashLoans: true
  });
  
  // Chart Data State
  const [chartData, setChartData] = useState<{time: string, gas: number, txs: number}[]>([]);

  // Simulation Effect
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString();

      // Update Chart Data
      setChartData(prev => {
        const newData = [...prev, {
          time: timeStr,
          gas: Math.floor(Math.random() * 200) + 50,
          txs: Math.floor(Math.random() * 20)
        }];
        return newData.slice(-20); // Keep last 20 points
      });

      // Update Contract Events
      setContracts(prevContracts => {
        return prevContracts.map(c => {
          if (c.status === 'paused') return c;
          
          const shouldAddEvent = Math.random() > 0.7; // 30% chance of event per tick
          if (!shouldAddEvent) return c;

          const newEvent = generateMockEvent(c.name);
          const newEvents = [newEvent, ...c.events].slice(0, 50); // Keep last 50 events
          
          return {
            ...c,
            events: newEvents,
            stats: {
              txCount: c.stats.txCount + 1,
              volume: c.stats.volume + parseFloat(newEvent.value || '0'),
              lastGas: Math.floor(Math.random() * 100)
            }
          };
        });
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const addContract = () => {
    if (!newAddress || !newName) return;
    const newContract: MonitoredContract = {
      address: newAddress,
      name: newName,
      status: 'active',
      events: [],
      stats: { txCount: 0, volume: 0, lastGas: 0 }
    };
    setContracts([...contracts, newContract]);
    setNewAddress('');
    setNewName('');
  };

  const removeContract = (address: string) => {
    setContracts(contracts.filter(c => c.address !== address));
  };

  const toggleContractStatus = (address: string) => {
    setContracts(contracts.map(c => 
      c.address === address ? { ...c, status: c.status === 'active' ? 'paused' : 'active' } : c
    ));
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-900 text-slate-100 overflow-hidden animate-in fade-in duration-500">
      
      {/* Sidebar - Contract List */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col z-10">
        <div className="p-4 border-b border-slate-700">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 text-xs transition-colors">
            <Icons.ChevronRight className="w-3 h-3 rotate-180" /> Back to Home
          </button>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Icons.Activity className="w-5 h-5 text-green-400" /> Live Monitoring
          </h2>
          <p className="text-xs text-slate-500 mt-1">Real-time Polygon PoS Watchtower</p>
        </div>

        <div className="p-4 space-y-3">
          <input 
            type="text" 
            placeholder="Contract Name (e.g. USDC Vault)" 
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="0x... Address" 
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs font-mono"
            value={newAddress}
            onChange={e => setNewAddress(e.target.value)}
          />
          <button 
            onClick={addContract}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white p-2 rounded flex items-center justify-center gap-2 text-sm font-semibold transition-all"
          >
            <Icons.Plus className="w-4 h-4" /> Monitor Contract
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {contracts.map(contract => (
            <div key={contract.address} className={`p-3 rounded-lg border ${contract.status === 'active' ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-900 border-slate-800 opacity-60'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-sm truncate">{contract.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => toggleContractStatus(contract.address)}>
                    {contract.status === 'active' ? <Icons.Pause className="w-3 h-3 text-yellow-400" /> : <Icons.Play className="w-3 h-3 text-green-400" />}
                  </button>
                  <button onClick={() => removeContract(contract.address)}>
                    <Icons.Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mb-2 truncate">{contract.address}</div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-slate-800 p-1 rounded text-center">
                  <span className="block text-slate-500">TXs</span>
                  <span className="text-white">{contract.stats.txCount}</span>
                </div>
                <div className="bg-slate-800 p-1 rounded text-center">
                  <span className="block text-slate-500">Vol</span>
                  <span className="text-white">{contract.stats.volume.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
          {contracts.length === 0 && (
            <div className="text-center text-slate-600 text-sm mt-10">
              <Icons.Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No contracts monitored. Add one to start.
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
        {/* Top Header */}
        <div className="h-16 border-b border-slate-800 bg-slate-900/90 flex justify-between items-center px-6">
          <div className="flex gap-6">
            <div className="text-center">
              <span className="text-xs text-slate-500 block">Network Status</span>
              <span className="text-sm font-mono text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
              </span>
            </div>
            <div className="text-center">
              <span className="text-xs text-slate-500 block">Gas Price</span>
              <span className="text-sm font-mono text-blue-400">~{chartData.length > 0 ? chartData[chartData.length - 1].gas : 0} Gwei</span>
            </div>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg border transition-all flex items-center gap-2 text-sm ${showSettings ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
          >
            <Icons.Settings className="w-4 h-4" />
            Alert Config
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Col: Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Pattern Analysis */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg">
              <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Icons.TrendingUp className="w-4 h-4 text-blue-400" /> Transaction Pattern & Gas Analysis
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTxs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    />
                    <Area type="monotone" dataKey="gas" stroke="#8884d8" fillOpacity={1} fill="url(#colorGas)" name="Gas (Gwei)" />
                    <Area type="monotone" dataKey="txs" stroke="#82ca9d" fillOpacity={1} fill="url(#colorTxs)" name="Tx Volume" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Live Feed */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex flex-col h-[400px]">
              <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Icons.Radio className="w-4 h-4 text-red-500 animate-pulse" /> Live Event Feed
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {contracts.flatMap(c => c.events.map(e => ({...e, contractName: c.name})))
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((event) => (
                    <div key={event.id} className="flex gap-3 p-3 rounded bg-slate-900/50 border border-slate-700/50 text-xs">
                      <div className="flex flex-col items-center min-w-[60px]">
                        <span className="text-slate-500 font-mono">{new Date(event.timestamp).toLocaleTimeString()}</span>
                        {event.severity === Severity.HIGH && <Icons.AlertOctagon className="w-4 h-4 text-red-500 mt-1" />}
                        {event.severity === Severity.MEDIUM && <Icons.AlertTriangle className="w-4 h-4 text-orange-400 mt-1" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <span className="font-bold text-slate-300">{event.contractName}</span>
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              event.type === 'ALERT' ? 'bg-red-500/20 text-red-400' : 
                              event.type === 'GAS_SPIKE' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                           }`}>{event.type}</span>
                        </div>
                        <p className="text-slate-400 mt-1">{event.message}</p>
                        <div className="mt-1 font-mono text-[10px] text-slate-600 truncate">Tx: {event.hash}</div>
                      </div>
                    </div>
                  ))}
                  {contracts.flatMap(c => c.events).length === 0 && (
                     <div className="text-center p-10 text-slate-500">Waiting for events...</div>
                  )}
              </div>
            </div>
          </div>

          {/* Right Col: Settings & Stats */}
          <div className="space-y-6">
            {/* Alert Settings */}
            <div className={`bg-slate-800 border border-slate-700 rounded-xl p-6 transition-all ${showSettings ? 'ring-2 ring-purple-500' : ''}`}>
              <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Icons.Bell className="w-4 h-4 text-purple-400" /> Alert Thresholds
              </h3>
              
              <div className="space-y-4">
                 <div>
                    <label className="text-xs text-slate-400 mb-1 block">Gas Threshold (Gwei)</label>
                    <input 
                      type="number" 
                      value={alertConfig.gasThreshold}
                      onChange={e => setAlertConfig({...alertConfig, gasThreshold: parseInt(e.target.value)})}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
                    />
                 </div>
                 <div>
                    <label className="text-xs text-slate-400 mb-1 block">Min Value Transfer (MATIC)</label>
                    <input 
                      type="number" 
                      value={alertConfig.minEthTransfer}
                      onChange={e => setAlertConfig({...alertConfig, minEthTransfer: parseInt(e.target.value)})}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
                    />
                 </div>
                 <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      checked={alertConfig.detectFlashLoans}
                      onChange={e => setAlertConfig({...alertConfig, detectFlashLoans: e.target.checked})}
                      className="rounded border-slate-700 bg-slate-900 text-purple-600"
                    />
                    <label className="text-xs text-slate-300">Detect Flash Loans / Sandwich</label>
                 </div>
                 
                 <div className="pt-4 border-t border-slate-700">
                    <h4 className="text-xs font-bold text-slate-400 mb-2">Notification Channels</h4>
                    <input 
                      type="text" 
                      placeholder="Discord Webhook URL"
                      value={alertConfig.discordWebhook}
                      onChange={e => setAlertConfig({...alertConfig, discordWebhook: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs mb-2"
                    />
                    <input 
                      type="email" 
                      placeholder="Email Address"
                      value={alertConfig.email}
                      onChange={e => setAlertConfig({...alertConfig, email: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs"
                    />
                 </div>
                 <button className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-xs font-bold transition-colors">
                    Save Configuration
                 </button>
              </div>
            </div>

            {/* Historical Attack Detection Summary */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
               <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                  <Icons.Shield className="w-4 h-4 text-red-400" /> Pattern Matching
               </h3>
               <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs p-2 bg-slate-900 rounded">
                     <span className="text-slate-400">Reentrancy (Similar to DAO Hack)</span>
                     <span className="text-green-400">Safe</span>
                  </div>
                  <div className="flex justify-between items-center text-xs p-2 bg-slate-900 rounded">
                     <span className="text-slate-400">Poly Network Exploit Pattern</span>
                     <span className="text-green-400">Safe</span>
                  </div>
                   <div className="flex justify-between items-center text-xs p-2 bg-slate-900 rounded">
                     <span className="text-slate-400">Flash Loan Oracle Manipulation</span>
                     <span className="text-yellow-400">Warning (Low Liq)</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};