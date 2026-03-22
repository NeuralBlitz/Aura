
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Message, ModelType, Artifact, GroundingSource, MemoryRetrieval, Widget, ReasoningStep } from '../types';
import { memoryService } from './memoryService';
import { executeTool, SOVEREIGN_TOOLS } from './toolService';

const handleApiError = (error: any) => {
  const message = error?.message || String(error);
  const status = error?.status || (error?.toString().match(/\d{3}/) ? parseInt(error.toString().match(/\d{3}/)[0]) : null);

  if (status === 429 || message.includes("429") || message.includes("QUOTA_EXHAUSTED") || message.includes("RESOURCE_EXHAUSTED")) {
    throw new Error("Neural Quota Exhausted: Switch to a personal API key or try again in 24 hours.");
  }
  if (status === 400 || message.includes("400") || message.includes("API_KEY_INVALID")) {
    throw new Error("Neural Handshake Failed: The API key provided is invalid.");
  }
  if (message.includes("SAFETY")) {
    throw new Error("Intelligence Guard Active: Intercepted to maintain system alignment.");
  }
  throw new Error(message || "Neural Disruption: An unexpected error occurred.");
};

const GEN_UI_INSTRUCTIONS = `
[GENERATIVE UI ENABLED]: You can render interactive widgets.
- For checklists: [WIDGET]{"type":"checklist","data":{"title":"Tasks","items":[{"id":"1","label":"Item","checked":false}]}}[/WIDGET]
- For dashboards: [WIDGET]{"type":"dashboard","data":{"title":"Overview","metrics":[{"label":"Stat","value":"100","trend":"up"}]}}[/WIDGET]
- For projections: [WIDGET]{"type":"projection","data":{"title":"Calculator","baseValue":100,"variables":[{"id":"v1","label":"Variable","min":0,"max":100,"value":50,"unit":"%"}]}}[/WIDGET]
[CHRONICLER]: If user interaction is high-value, provide a [CHRONICLE]{"title":"Name","summary":"..."}[/CHRONICLE] tag.
[THINKING]: You can output reasoning steps using [THOUGHT]{"title":"Step Title","content":"Logic..."}[/THOUGHT] tags.
`;

const parseResponse = (text: string): { artifacts: Artifact[], widgets: Widget[], thinking: ReasoningStep[], cleanText: string } => {
  let cleanText = text;
  const artifacts: Artifact[] = [];
  const widgets: Widget[] = [];
  const thinking: ReasoningStep[] = [];

  const safeParse = (jsonStr: string) => {
    try {
      const clean = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(clean);
    } catch (e) { return null; }
  };

  const artifactRegex = /\[ARTIFACT\]([\s\S]*?)\[\/ARTIFACT\]/g;
  let artifactMatch;
  while ((artifactMatch = artifactRegex.exec(text)) !== null) {
    const data = safeParse(artifactMatch[1]);
    if (data) artifacts.push({ id: Math.random().toString(36).substr(2, 9), ...data });
  }
  cleanText = cleanText.replace(artifactRegex, '').trim();

  const thoughtRegex = /\[THOUGHT\]([\s\S]*?)\[\/THOUGHT\]/g;
  let thoughtMatch;
  while ((thoughtMatch = thoughtRegex.exec(text)) !== null) {
    const data = safeParse(thoughtMatch[1]);
    if (data) thinking.push({ id: Math.random().toString(36).substr(2, 9), status: 'complete', ...data });
  }
  cleanText = cleanText.replace(thoughtRegex, '').trim();

  const widgetRegex = /\[WIDGET\]([\s\S]*?)\[\/WIDGET\]/g;
  let widgetMatch;
  while ((widgetMatch = widgetRegex.exec(text)) !== null) {
    const data = safeParse(widgetMatch[1]);
    if (data) widgets.push({ id: Math.random().toString(36).substr(2, 9), ...data });
  }
  cleanText = cleanText.replace(widgetRegex, '').trim();

  return { artifacts, widgets, thinking, cleanText };
};

export async function* sendMessageStreamToGemini(
  history: Message[],
  prompt: string,
  modelType: ModelType = ModelType.GEMINI_FLASH,
  attachment?: string,
  systemInstruction?: string,
  enabledToolIds: string[] = []
) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let memories: MemoryRetrieval[] = [];
  try { memories = await memoryService.queryMemories(prompt); } catch (e) {}

  let actualModel = 'gemini-3-flash-preview';
  let defaultInstruction = "You are Aura, a sophisticated AI assistant.";
  
  switch (modelType) {
    case ModelType.CREATIVE_WRITING:
      actualModel = 'gemini-3.1-pro-preview';
      defaultInstruction = "You are an expert creative writer, poet, and storyteller. Focus on narrative flow, evocative language, and character development.";
      break;
    case ModelType.CODING_ASSISTANT:
      actualModel = 'gemini-3.1-pro-preview';
      defaultInstruction = "You are an expert software engineer and coding assistant. Provide clean, efficient, and well-documented code. Explain your reasoning clearly.";
      break;
    case ModelType.GENERAL_KNOWLEDGE:
      actualModel = 'gemini-3-flash-preview';
      defaultInstruction = "You are a highly knowledgeable general assistant. Provide accurate, concise, and helpful answers across a wide range of topics.";
      break;
    case ModelType.GEMINI_PRO:
      actualModel = 'gemini-3.1-pro-preview';
      break;
    case ModelType.GEMINI_IMAGE:
      actualModel = 'gemini-2.5-flash-image';
      break;
    case ModelType.GEMINI_INTELLIGENCE:
      actualModel = 'gemini-2.5-flash-native-audio-preview-12-2025';
      break;
    case ModelType.GEMINI_FLASH:
    default:
      actualModel = 'gemini-3-flash-preview';
      break;
  }

  let effectiveSystemInstruction = (systemInstruction || defaultInstruction) + GEN_UI_INSTRUCTIONS;
  if (memories.length > 0) {
    effectiveSystemInstruction += `\n\nContext:\n${memories.map(m => m.text).join('\n')}`;
  }

  try {
    const formattedHistory = history.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] }));
    const tools: any[] = [];
    const activeSovereignTools = SOVEREIGN_TOOLS.filter(t => enabledToolIds.includes(t.id));
    if (activeSovereignTools.length > 0) {
      tools.push({ functionDeclarations: activeSovereignTools.map(t => t.declaration) });
    } else { tools.push({ googleSearch: {} }); }

    const config: any = { 
      tools,
      systemInstruction: effectiveSystemInstruction,
      thinkingConfig: { thinkingBudget: (actualModel === 'gemini-3.1-pro-preview' || actualModel === 'gemini-3-pro-preview') ? 32768 : 24576 }
    };

    const contents: any = { parts: [] };
    if (attachment) {
      const [mimeType, data] = attachment.split(';base64,');
      contents.parts.push({ inlineData: { mimeType: mimeType.split(':')[1], data: data } });
    }
    contents.parts.push({ text: prompt });

    const chat = ai.chats.create({ model: actualModel, history: formattedHistory, config });
    let response = await chat.sendMessageStream({ message: contents.parts });

    let fullText = "";
    let grounding: GroundingSource[] = [];
    
    while (true) {
      let functionCalls: any[] = [];
      for await (const chunk of response) {
        const c = chunk as GenerateContentResponse;
        const groundingChunks = c.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
          grounding = groundingChunks.map((gc: any) => (
            gc.web ? { title: gc.web.title || 'Web', uri: gc.web.uri, type: 'web' } : 
            gc.maps ? { title: gc.maps.title || 'Maps', uri: gc.maps.uri, type: 'maps' } : null
          )).filter((s): s is GroundingSource => s !== null);
        }

        if (c.text) {
          fullText += c.text;
          const { artifacts, widgets, thinking, cleanText } = parseResponse(fullText);
          yield { text: cleanText, artifacts, widgets, thinking, memories, grounding, done: false };
        }

        const candidate = c.candidates?.[0];
        if (candidate?.content?.parts) {
          const calls = candidate.content.parts.filter(p => p.functionCall);
          if (calls.length > 0) functionCalls.push(...calls.map(p => p.functionCall));
        }
      }
      if (functionCalls.length === 0) break;
      const functionResponses = await Promise.all(functionCalls.map(async (call) => {
        const result = await executeTool(call.name, call.args);
        return { functionResponse: { name: call.name, response: { result } } };
      }));
      response = await chat.sendMessageStream({ message: functionResponses });
    }
    const { artifacts, widgets, thinking, cleanText } = parseResponse(fullText);
    yield { text: cleanText, artifacts, widgets, thinking, memories, grounding, done: true };
  } catch (error: any) { handleApiError(error); }
}
