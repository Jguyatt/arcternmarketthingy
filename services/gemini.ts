
import { GoogleGenAI, Type } from "@google/genai";
import { SegmentAnalysis, SavedResearch } from "../types";

// Get API key from Vite-defined environment variable
// @ts-ignore - process.env is defined by Vite's define config
const getApiKey = (): string => {
  // Check multiple possible environment variable names (including common typos)
  const apiKey = process.env.GEMINI_API_KEY || 
                 process.env.GEMENI_API_KEY || 
                 process.env.gemeni_api_key ||
                 process.env.API_KEY || 
                 process.env.VITE_GEMINI_API_KEY;
  const apiKeyStr = typeof apiKey === 'string' ? apiKey : String(apiKey || '');
  
  // Log to console for debugging (will show in browser console)
  console.log('[GEMINI API] Checking API key...', {
    hasGEMINI_API_KEY: typeof process.env.GEMINI_API_KEY !== 'undefined',
    hasGEMENI_API_KEY: typeof process.env.GEMENI_API_KEY !== 'undefined',
    hasAPI_KEY: typeof process.env.API_KEY !== 'undefined',
    apiKeyType: typeof apiKey,
    apiKeyLength: apiKeyStr.length,
    apiKeyValue: apiKeyStr === '' ? 'EMPTY_STRING' : apiKeyStr.substring(0, 5) + '...',
    processEnvKeys: Object.keys(process.env || {}).filter(k => k.includes('API') || k.includes('GEMINI') || k.includes('GEMENI'))
  });
  
  // Check for empty string or undefined
  if (!apiKey || (typeof apiKey === 'string' && apiKey.trim() === '')) {
    console.error('[GEMINI API] ERROR: API key is missing or empty!', {
      apiKey,
      apiKeyStr,
      processEnv: process.env,
      availableKeys: Object.keys(process.env || {}).filter(k => k.includes('API') || k.includes('GEMINI') || k.includes('GEMENI'))
    });
    throw new Error("An API Key must be set. Please set GEMINI_API_KEY environment variable in .env.local file.");
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
    contents: `You are a semiconductor industry expert. Provide a clear, concise answer about '${segment}' that fully addresses the question.

Question: ${query}

CRITICAL REQUIREMENTS:
- Your response MUST fully answer the question asked
- Your response MUST be exactly 200-300 words (count carefully)
- Your response MUST be complete and end with a period
- Do NOT cut off mid-sentence
- Do NOT exceed 300 words
- Ensure you directly address what was asked in the question

Formatting requirements:
- Start with 2-3 sentence overview paragraph that directly answers the question
- Use bullet points for key characteristics, advantages, and important facts
- Include 2-3 short paragraphs (2-3 sentences each) covering different aspects
- End with a brief conclusion sentence that ends with a period
- No markdown headers (no #, ##, ###, etc.)
- No em dashes or special formatting characters
- Write in clear, professional language
- Make it scannable and easy to read

Structure your answer like this:
1. Brief overview paragraph (2-3 sentences, ~50 words) - directly answer the question
2. Key characteristics as bullet points (~80 words)
3. Short paragraph on advantages/importance (2-3 sentences, ~60 words)
4. Short paragraph on market context or applications (2-3 sentences, ~60 words)
5. Brief conclusion sentence ending with a period (~20 words)

Total: approximately 270 words. Be concise, informative, ensure your response fully answers the question, and is complete.`,
    config: {
      maxOutputTokens: 2000,
    },
  });

  let text = response.text || "No intelligence found for this query.";
  
  // Ensure response ends properly - if it's cut off, try to clean it up
  if (text && !text.trim().endsWith('.') && !text.trim().endsWith('!') && !text.trim().endsWith('?')) {
    // If it ends mid-sentence, try to find the last complete sentence
    const lastPeriod = text.lastIndexOf('.');
    const lastExclamation = text.lastIndexOf('!');
    const lastQuestion = text.lastIndexOf('?');
    const lastComplete = Math.max(lastPeriod, lastExclamation, lastQuestion);
    
    if (lastComplete > text.length * 0.8) {
      // If we found a complete sentence in the last 20% of text, use that
      text = text.substring(0, lastComplete + 1);
    }
  }
  
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
    contents: `You are a semiconductor industry expert. Provide a comprehensive, detailed answer about '${segment}' using the provided research data.

Research context:
${context}

Question: ${query}

Formatting requirements:
- Use a mix of short paragraphs (3-4 sentences) and bullet points
- Start with a brief overview paragraph
- Use bullet points for lists, comparisons, and key facts
- Include multiple paragraphs for different aspects of the topic
- No markdown headers (no #, ##, ###, etc.)
- No em dashes or special formatting characters
- Write in clear, professional language
- Provide substantial detail (aim for 500-800 words)
- Structure: overview paragraph, then detailed points, then conclusion paragraph
- Always end your response with a complete sentence that ends in a period
- Ensure the response is complete and not cut off mid-sentence

Provide a thorough answer using the research data provided. Make sure to complete your full thought and end properly.`,
    config: {
      maxOutputTokens: 3000,
    },
  });
  return response.text || "No response generated.";
}

export async function queryResearchDocument(query: string): Promise<{ answer: string; relevantSections: string[] }> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are analyzing a comprehensive research document about chip topologies and compute infrastructure. Answer the following question based on the research document content.

Question: ${query}

Provide:
1. A concise overview paragraph (2-3 sentences, ~50 words)
2. Key points as bullet points (4-6 bullets, ~150-200 words total)
3. List 3-5 relevant sections or topics from the document

Format your response as JSON with this structure:
{
  "answer": "Brief overview paragraph here.\n\n• First key point\n• Second key point\n• Third key point\n• Fourth key point",
  "relevantSections": ["Section 1", "Section 2", "Section 3"]
}

Keep the total answer length around 200-300 words with a short paragraph followed by clear bullet points.`,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 2000,
      },
    });

    try {
      const parsed = JSON.parse(response.text || '{}');
      return {
        answer: parsed.answer || "No answer found.",
        relevantSections: parsed.relevantSections || []
      };
    } catch (e) {
      return {
        answer: response.text || "No answer found.",
        relevantSections: []
      };
    }
  } catch (error: any) {
    // Re-throw with more context for better error handling
    if (error?.message?.includes('API key') || error?.message?.includes('403') || error?.message?.includes('PERMISSION_DENIED')) {
      throw new Error(`API Key Error: ${error.message || 'Invalid or missing API key. Please check your GEMINI_API_KEY in .env.local'}`);
    }
    throw error;
  }
}

export async function queryResearchDocumentChat(
  originalQuery: string,
  originalAnswer: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  currentMessage: string
): Promise<string> {
  try {
    const ai = getAI();
    
    // Build conversation context with original query and answer
    let conversationContext = `You are an AI assistant helping users explore a comprehensive research document about chip topologies and compute infrastructure.

The user initially asked: "${originalQuery}"

You provided this initial answer:
"${originalAnswer}"

Now the user wants to dive deeper and ask follow-up questions. Maintain context from the original query and answer, and provide helpful, detailed responses based on the research document content.

Conversation history:
`;

    // Add conversation history (limit to last 20 messages to avoid token limits)
    const recentHistory = conversationHistory.slice(-20);
    recentHistory.forEach((msg) => {
      const roleLabel = msg.role === 'user' ? 'User' : 'Assistant';
      conversationContext += `\n${roleLabel}: ${msg.content}\n`;
    });

    conversationContext += `\n\nCurrent user question: ${currentMessage}

Provide a helpful, detailed response that builds on the conversation context and the research document. Format your response in a clear, readable way with:
- Short paragraphs (2-3 sentences each)
- Bullet points for key information
- Clear structure and easy-to-scan formatting

Also suggest 3-4 follow-up questions the user might want to ask to learn more about this topic. Format your response as JSON:

{
  "content": "Your detailed response here with paragraphs and bullets...",
  "suggestedQuestions": ["Question 1", "Question 2", "Question 3", "Question 4"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: conversationContext,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 2000,
      },
    });

    try {
      const parsed = JSON.parse(response.text || '{}');
      return JSON.stringify({
        content: parsed.content || response.text || "Sorry, I couldn't generate a response. Please try again.",
        suggestedQuestions: parsed.suggestedQuestions || []
      });
    } catch (e) {
      // Fallback if JSON parsing fails
      return JSON.stringify({
        content: response.text || "Sorry, I couldn't generate a response. Please try again.",
        suggestedQuestions: []
      });
    }
  } catch (error: any) {
    // Re-throw with more context for better error handling
    if (error?.message?.includes('API key') || error?.message?.includes('403') || error?.message?.includes('PERMISSION_DENIED')) {
      throw new Error(`API Key Error: ${error.message || 'Invalid or missing API key. Please check your GEMINI_API_KEY in .env.local'}`);
    }
    throw error;
  }
}

export async function explainInPlainTerms(selectedText: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are explaining technical concepts from a chip topology research document to someone who wants to understand it in very plain, simple terms. 

The user has selected this text: "${selectedText}"

Explain what this means in plain, simple language:
- Use everyday analogies when possible
- Avoid jargon or explain jargon when you must use it
- Keep it concise (2-4 sentences)
- Make it accessible to someone without a technical background
- Focus on what it means and why it matters

Just provide the explanation directly, no JSON formatting needed.`,
    config: {
      maxOutputTokens: 500,
    },
  });

  return response.text || "Sorry, I couldn't generate an explanation. Please try again.";
}
