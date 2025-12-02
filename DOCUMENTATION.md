# AuditGPT Technical Documentation

## 1. System Architecture

AuditGPT operates as a client-side Single Page Application (SPA) that orchestrates interactions between the user, the Polygon Blockchain, and the Google Gemini AI engine.

### High-Level Data Flow

1.  **Input Layer**: 
    - User inputs a Contract Address or pastes Solidity Source Code.
    - Application validates inputs and API keys.
2.  **Data Retrieval Layer (`polygonService.ts`)**:
    - Connects to Polygon RPC nodes to verify contract existence.
    - Queries PolygonScan API to fetch verified source code.
    - Flattens multi-file source code (JSON standard input) into a single analysis-ready string.
3.  **Analysis Layer (`geminiService.ts`)**:
    - Constructs a complex prompt context for Gemini 3.0 Pro.
    - Utilizes **Thinking Mode (Budget: 32k tokens)** to simulate deep reasoning and static analysis.
    - Enforces a strict JSON Schema for structured output.
4.  **Presentation Layer (`AuditDashboard.tsx`)**:
    - Renders the structured data into interactive tabs (Security, Gas, Economic, Upgrade).
    - Visualizes metrics using Recharts.
    - Generates PDF reports using `jspdf`.

## 2. Core Modules

### 2.1 Security & Vulnerability Engine
This module simulates the behavior of tools like Slither and Mythril. It specifically looks for:
- **SWC Registry Mappings**: Reentrancy (SWC-107), Unchecked Call (SWC-104), etc.
- **Logic Errors**: Business logic flaws that standard static analysis might miss.
- **Severity Classification**: High, Medium, Low, Info based on exploitability and impact.

### 2.2 Gas Optimization Profiler
Analyzes the code for EVM efficiency:
- **Storage Layout**: Checks for variable packing opportunities (e.g., `uint128` + `uint128` in one slot).
- **Memory vs Calldata**: Recommends `calldata` for external function arguments.
- **Loop Efficiency**: Identifies expensive operations inside loops.

### 2.3 Economic Risk Modeler
Evaluates financial attack vectors:
- **Flash Loans**: Checks if state changes can be manipulated by massive capital in a single block.
- **Oracle Dependency**: Identifies reliance on spot prices (e.g., `uniswapPair.getReserves`) without TWAP.

### 2.4 Monitoring Dashboard (`MonitoringDashboard.tsx`)
*Note: Currently runs in simulation mode for demonstration.*
- **Event Loop**: mimics a WebSocket connection to a blockchain node.
- **Pattern Matching**: Simulates heuristics for "Gas Spikes" and "High Value Transfers".
- **Alerting Logic**: Evaluates simulated events against user-defined thresholds.

## 3. Services & APIs

### `performFullAudit(sourceCode, contractName)`
- **Input**: Raw Solidity string.
- **Model**: `gemini-3-pro-preview`.
- **Output**: `AuditReport` object containing vulnerabilities, gas tips, and scores.
- **Error Handling**: Includes JSON repair logic to handle markdown fences in LLM responses.

### `fetchContractData(address, apiKey)`
- **Input**: Polygon Address.
- **Process**:
    1.  Ping RPC to verify bytecode exists.
    2.  Call PolygonScan `getsourcecode`.
    3.  Parse result (handles logic for Single File, Multi-Part, and Standard JSON Input).
- **Output**: Flattened source code string.

## 4. Data Types (`types.ts`)

The application relies on strict TypeScript interfaces to ensure type safety across the pipeline. Key interfaces include:
- `AuditReport`: The root object for analysis results.
- `Vulnerability`: Structure for a security finding (id, severity, remediation, codeFix, impact, confidence).
- `GasOptimization`: Structure for gas saving tips (category, potentialSavings, codeSnippet).
- `EconomicRisk`: Structure for financial vectors (vector, riskLevel, scenario, mitigation).
- `JobProgress`: Tracks the status of the multi-step audit pipeline (fetch, static, gas, etc.).
- `AppState`: Manages the global view state (IDLE, PROCESSING, RESULTS, MONITORING, DOCUMENTATION).

## 5. UI/UX Components

- **AuditDashboard**: The main report viewer. Uses `recharts` for visualization and tabbed navigation for different analysis verticals.
- **MonitoringDashboard**: A simulation environment for real-time contract watching.
- **Icons**: Centralized Lucide-React icon export for consistency.
- **pdfGenerator**: A utility using `jspdf-autotable` to transform the `AuditReport` JSON into a professional PDF document.
