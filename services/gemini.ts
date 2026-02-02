
import { GoogleGenAI, Type } from "@google/genai";
import { SegmentAnalysis, SavedResearch } from "../types";

// Get API key from Vite-defined environment variable
// @ts-ignore - process.env is defined by Vite's define config
const getApiKey = (): string => {
  // #region agent log
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  const apiKeyStr = typeof apiKey === 'string' ? apiKey : String(apiKey || '');
  
  // Log to console for debugging (will show in browser console)
  console.log('[GEMINI API] Checking API key...', {
    hasAPI_KEY: typeof process.env.API_KEY !== 'undefined',
    hasGEMINI_API_KEY: typeof process.env.GEMINI_API_KEY !== 'undefined',
    apiKeyType: typeof apiKey,
    apiKeyLength: apiKeyStr.length,
    apiKeyValue: apiKeyStr === '' ? 'EMPTY_STRING' : apiKeyStr.substring(0, 5) + '...',
    processEnvKeys: Object.keys(process.env || {}).filter(k => k.includes('API') || k.includes('GEMINI'))
  });
  
  fetch('http://127.0.0.1:7244/ingest/cd052ad8-ca90-4ebc-8d20-38acbade9910',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'services/gemini.ts:getApiKey',message:'Getting API key',data:{apiKeyExists:!!apiKey,apiKeyType:typeof apiKey,apiKeyLength:apiKeyStr.length,apiKeyFirstChars:apiKeyStr.substring(0,5),hasAPI_KEY:typeof process.env.API_KEY!=='undefined',hasGEMINI_API_KEY:typeof process.env.GEMINI_API_KEY!=='undefined',apiKeyValue:apiKeyStr===''?'EMPTY_STRING':apiKeyStr.substring(0,10)+'...'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // Check for empty string or undefined
  if (!apiKey || (typeof apiKey === 'string' && apiKey.trim() === '')) {
    console.error('[GEMINI API] ERROR: API key is missing or empty!', {
      apiKey,
      apiKeyStr,
      processEnv: process.env
    });
    throw new Error("An API Key must be set. Please set GEMINI_API_KEY environment variable.");
  }
  return typeof apiKey === 'string' ? apiKey : String(apiKey);
};

// Lazy initialization to avoid errors at module load time
let aiInstance: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!aiInstance) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/cd052ad8-ca90-4ebc-8d20-38acbade9910',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'services/gemini.ts:getAI',message:'Initializing GoogleGenAI',data:{isFirstInit:!aiInstance},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    aiInstance = new GoogleGenAI({ apiKey: getApiKey() });
  }
  return aiInstance;
};

export async function analyzeResearch(segmentTitle: string, researchText: string): Promise<SegmentAnalysis> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a world-class semiconductor market analyst for ArcTern Ventures. 
    Analyze the following research text about the '${segmentTitle}' chip topology segment. 
    
    Identify:
    1. Primary companies (Foundries, EDA, IP core providers, OSATs, or integrated manufacturers) working on this topology.
    2. Their specific technical specialization within this segment.
    3. A strategic summary of the market readiness and current bottlenecks.
    4. Macro trends.
    
    Research Text:
    ${researchText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          companies: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                specialization: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["name", "specialization", "description"],
            },
          },
          summary: { type: Type.STRING },
          trends: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["companies", "summary", "trends"],
      },
    },
  });

  return JSON.parse(response.text || '{}') as SegmentAnalysis;
}

export async function queryWebIntelligence(segment: string, query: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a semiconductor industry expert helping someone understand the '${segment}' market segment. Answer their question in clear, plain English. Be detailed and thorough. Explain technical concepts in simple terms. Use real-time data where available.
    
    Question: ${query}
    
    Provide a comprehensive answer that directly addresses the question. Use clear language and avoid jargon unless necessary, and if you use technical terms, explain them.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || "No intelligence found for this query.";
  const citations = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  return { text, citations };
}

export async function bulkAnalyze(researchNarrative: string, segmentIds: string[]): Promise<SavedResearch> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `You are a VC analyst conducting a broad market scan. 
    Take the provided "Market Narrative" and extract data for the following Chip Topology segments:
    [${segmentIds.join(', ')}]

    For each segment, identify relevant companies, a summary of their approach based on the text, and key trends.
    If a segment is not mentioned in the text, return empty data for it.
    
    Research Narrative:
    ${researchNarrative}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          results: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                segmentId: { type: Type.STRING },
                analysis: {
                  type: Type.OBJECT,
                  properties: {
                    companies: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          specialization: { type: Type.STRING },
                          description: { type: Type.STRING },
                        },
                        required: ["name", "specialization", "description"],
                      },
                    },
                    summary: { type: Type.STRING },
                    trends: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["companies", "summary", "trends"],
                }
              },
              required: ["segmentId", "analysis"]
            }
          }
        },
        required: ["results"]
      },
    },
  });

  const parsed = JSON.parse(response.text || '{"results": []}');
  const finalResearch: SavedResearch = {};
  parsed.results.forEach((item: any) => {
    finalResearch[item.segmentId] = item.analysis;
  });
  return finalResearch;
}

export async function queryAssistant(segment: string, context: string, query: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a semiconductor industry expert helping someone understand the '${segment}' market segment. Answer their question in clear, plain English. Be detailed and thorough. Explain technical concepts in simple terms.
    
    Use the following research data to inform your answer:
    ${context}
    
    Question: ${query}
    
    Provide a comprehensive answer that directly addresses the question. Use clear language and avoid jargon unless necessary, and if you use technical terms, explain them. Structure your answer logically and include relevant details from the research data.`,
  });
  return response.text || "No response generated.";
}
