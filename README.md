# AuditGPT - AI-Powered Smart Contract Auditor for Polygon PoS

AuditGPT is a production-grade, autonomous smart contract auditing platform designed specifically for the Polygon Proof-of-Stake (PoS) ecosystem. It leverages the advanced reasoning capabilities of **Google Gemini 3.0 Pro (Thinking Mode)** combined with real-time blockchain data to deliver comprehensive security reports, gas optimization strategies, and economic risk assessments.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Production-green.svg)
![Network](https://img.shields.io/badge/network-Polygon%20PoS-purple.svg)

## 🚀 Key Features

### 🛡️ Deep Security Analysis
- **Vulnerability Detection**: Identifies critical issues like Reentrancy, Integer Overflows, Access Control failures, and Unchecked Return Values.
- **Static Analysis Simulation**: Mimics industry-standard tools (Slither, Mythril) to provide high-confidence findings.
- **Upgradeability Checks**: Analyzes proxy patterns (UUPS, Transparent) for storage collisions and initialization risks.

### ⚡ Gas Optimization
- **Profiling**: Detects inefficient storage packing, expensive loops, and redundant operations.
- **Code Snippets**: Provides optimized Solidity code suggestions to reduce deployment and execution costs.

### 💰 Economic Security
- **Attack Vector Simulation**: Models Flash Loan attacks, Price Oracle manipulation, and Front-running scenarios.
- **Risk Assessment**: Evaluates the economic viability of potential exploits.

### 📡 Live Monitoring Dashboard
- **Real-Time Watchtower**: Monitor deployed contracts for suspicious transaction patterns.
- **Alert System**: Configurable thresholds for gas spikes and large value transfers (Simulation).
- **Visual Analytics**: Interactive charts for gas usage and transaction volume.

### 📄 Professional Reporting
- **PDF Export**: Generate executive-grade security reports with one click.
- **Detailed Metrics**: Vulnerability breakdown by severity, confidence levels, and impact analysis.

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS, Lucide React
- **AI Engine**: Google Gemini 3.0 Pro (via `@google/genai` SDK)
- **Blockchain**: Ethers.js v6
- **Data Source**: PolygonScan API, Polygon PoS RPC
- **Visualization**: Recharts
- **Reporting**: jsPDF, jsPDF-AutoTable

## 📦 Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/auditgpt.git
   cd auditgpt
   ```

2. **Install Dependencies**
   (If running locally with Node.js)
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   API_KEY=your_google_gemini_api_key
   ```
   *Note: For the web-based demo version, the API key is handled securely via the environment injection or UI input.*

4. **Run the Application**
   ```bash
   npm start
   ```

## 📖 Usage Guide

### Mode 1: Verified Contract Audit
1. Select **"Verified Address"** tab.
2. Enter a valid Polygon PoS Contract Address (e.g., `0x...`).
3. (Optional) Enter a PolygonScan API Key for higher rate limits.
4. Click **"Start Security Audit"**.
5. The system will fetch the source code, flatten it, and perform the analysis.

### Mode 2: Source Code Audit
1. Select **"Paste Source Code"** tab.
2. Paste your Solidity contract code directly into the editor.
3. Click **"Start Security Audit"**.

### Live Monitoring
1. Click **"Live Monitoring"** in the navigation bar.
2. Add contracts to your watchlist.
3. Observe real-time events, gas spikes, and transaction alerts.

## ⚠️ Disclaimer

AuditGPT is an AI-assisted tool and should not be considered a replacement for a professional manual audit. While it provides high-quality insights and vulnerability detection, no automated tool can guarantee 100% security. Always conduct thorough testing and seek professional review before deploying high-value contracts.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
