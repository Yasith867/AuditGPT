import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AuditReport, Severity } from '../types';

const API_KEY = process.env.API_KEY || '';

const AUDIT_SYSTEM_PROMPT = `
You are AuditGPT, a world-class Smart Contract Auditor and Security Researcher specialized in the Polygon PoS EVM ecosystem.

YOUR MISSION:
Perform a rigoruous, production-grade security audit on the provided Solidity source code. 
You must simulate the capabilities of static analysis tools (like Slither, Mythril) and manual economic review.

ANALYSIS REQUIREMENTS:

1. SECURITY & VULNERABILITY (Simulate Slither Detectors):
   - Detect Reentrancy (SWC-107)
   - Detect Unhandled External Calls (SWC-104)
   - Detect Integer Overflow/Underflow (SWC-101) - Context aware (SafeMath vs 0.8+)
   - Detect Access Control Issues (SWC-105)
   - Detect Weak Randomness (SWC-120)
   - Detect Proxy Implementation/Storage Collisions
   - For every finding, provide a CONFIDENCE level and strict line numbers.

2. GAS OPTIMIZATION:
   - Analyze storage layout packing.
   - Identify inefficient loops or expensive operations in hot paths.
   - Recommend "calldata" vs "memory" usage.

3. ECONOMIC SECURITY:
   - Identify Flash Loan attack vectors.
   - Analyze Oracle manipulation risks (Spot price dependency).
   - Assess Front-running/Sandwich attack opportunities.

4. UPGRADEABILITY & PROXY ANALYSIS:
   - Identify Proxy patterns (UUPS, Transparent, Beacon, Diamond).
   - Check for storage layout collisions between potential V1 and V2.
   - Verify 'initialize' functions are protected and cannot be called twice.
   - Check for unsafe 'selfdestruct' or 'delegatecall' usage in implementation contracts.
   - Check for missing gap variables (__gap) in upgradeable parent contracts.

OUTPUT FORMAT:
Return strict JSON adhering to the provided schema. Do not output markdown code blocks.
`;

const REPORT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    contractName: { type: Type.STRING },
    overallScore: { type: Type.NUMBER, description: "0-100 Security Score" },
    summary: { type: Type.STRING, description: "Professional executive summary of findings." },
    vulnerabilities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "SWC ID or Slither Detector Name" },
          title: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["High", "Medium", "Low", "Info"] },
          description: { type: Type.STRING },
          lineNumber: { type: Type.INTEGER },
          remediation: { type: Type.STRING },
          codeFix: { type: Type.STRING },
          impact: { type: Type.STRING, description: "What happens if exploited?" },
          confidence: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
        },
        required: ["id", "title", "severity", "description", "lineNumber", "remediation", "codeFix", "impact", "confidence"]
      }
    },
    gasAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          description: { type: Type.STRING },
          potentialSavings: { type: Type.STRING },
          codeSnippet: { type: Type.STRING }
        },
        required: ["category", "description", "potentialSavings", "codeSnippet"]
      }
    },
    economicAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          vector: { type: Type.STRING },
          riskLevel: { type: Type.STRING, enum: ["High", "Medium", "Low", "Info"] },
          scenario: { type: Type.STRING },
          mitigation: { type: Type.STRING }
        },
        required: ["vector", "riskLevel", "scenario", "mitigation"]
      }
    },
    upgradeabilityAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, description: "Type of upgrade issue e.g. Storage Collision" },
          severity: { type: Type.STRING, enum: ["High", "Medium", "Low", "Info"] },
          description: { type: Type.STRING },
          recommendation: { type: Type.STRING }
        },
        required: ["type", "severity", "description", "recommendation"]
      }
    },
    formalVerificationSuggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["contractName", "overallScore", "summary", "vulnerabilities", "gasAnalysis", "economicAnalysis", "upgradeabilityAnalysis", "formalVerificationSuggestions"]
};

export const performFullAudit = async (sourceCode: string, contractName?: string): Promise<AuditReport> => {
  if (!API_KEY) throw new Error("API Key missing. Please check your environment configuration.");

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Define helper to run analysis with specific model config
  const runAnalysis = async (modelName: string, useThinking: boolean) => {
      const config: any = {
        systemInstruction: AUDIT_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: REPORT_SCHEMA,
      };

      if (useThinking) {
        config.thinkingConfig = { thinkingBudget: 32768 };
      }

      return await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [{ text: `AUDIT TARGET SOURCE CODE (${contractName || 'Unknown'}):\n\n${sourceCode}` }]
          }
        ],
        config: config
      });
  };

  try {
    let response;
    try {
      // First try with the powerful thinking model
      response = await runAnalysis('gemini-3-pro-preview', true);
    } catch (primaryError: any) {
      console.warn("Gemini 3.0 Pro failed, falling back to Flash...", primaryError);
      // Fallback to Flash if Pro fails (e.g. 503, 429, or model access issues)
      response = await runAnalysis('gemini-2.5-flash', false);
    }

    if (!response.text) throw new Error("AI Analysis failed to generate output");

    let cleanJson = response.text.trim();
    
    // Robust JSON Extraction
    // 1. Try to find markdown block
    const jsonBlockMatch = cleanJson.match(/```json\s*([\s\S]*?)\s*```/i);
    if (jsonBlockMatch) {
      cleanJson = jsonBlockMatch[1];
    } else {
      // 2. If no block, try to find the outer braces if the text contains extra conversation
      const firstBrace = cleanJson.indexOf('{');
      const lastBrace = cleanJson.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
      }
    }

    let data;
    try {
      data = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw Output:", response.text);
      throw new Error("Failed to parse AI Analysis results. The model output was not valid JSON.");
    }

    return {
      contractName: data.contractName || contractName || "SmartContract",
      contractAddress: "", // Populated by caller
      network: "Polygon PoS",
      auditDate: new Date().toISOString(),
      overallScore: data.overallScore,
      summary: data.summary,
      vulnerabilities: data.vulnerabilities.map((v: any) => ({ ...v, severity: v.severity as Severity })),
      gasAnalysis: data.gasAnalysis,
      economicAnalysis: data.economicAnalysis.map((e: any) => ({ ...e, riskLevel: e.riskLevel as Severity })),
      upgradeabilityAnalysis: (data.upgradeabilityAnalysis || []).map((u: any) => ({ ...u, severity: u.severity as Severity })),
      formalVerificationSuggestions: data.formalVerificationSuggestions
    };

  } catch (error) {
    console.error("Gemini Audit Error:", error);
    throw new Error("Analysis Engine Failed: " + (error as Error).message);
  }
};